# Ada's Learning AND Fun! — Specification v1.0

---

## 1. Suite Overview

**Name:** Ada's Learning AND Fun!

**Concept:** A children's educational game suite with a Kawaii-inspired visual theme. Each mini-game targets a different learning domain. The outer shell provides shared identity, player profile, and navigation between games.

**Outer Shell responsibilities:**
- Title screen with Kawaii mascot (cat emoji), animated stars, floating clouds
- Player name entry (persisted in localStorage)
- Game hub with branding header and game selection cards
- Navigation between screens with fade/slide transitions
- Share button (Web Share API with clipboard fallback)

---

## 2. Architecture & Deployment

**Type:** Progressive Web App (PWA)

**Tech stack:**
- Vanilla HTML / CSS / JavaScript — no frameworks, no build step
- IIFE pattern with `var` declarations (ES5-compatible)
- Single `index.html` with CSS screen-based navigation (opacity/visibility/z-index transitions)
- Service worker for offline asset caching

**Engine / UI separation pattern:**
Each mini-game is split into two files:
- **Engine** — Pure functions IIFE, no DOM dependencies, testable with Jest
- **UI controller** — IIFE that consumes the engine, manages DOM rendering, animations, and user input
- Engines export to `window.*` and also `module.exports` for Node.js testing

**File structure:**
```
index.html              — All screens (title, name, hub, games)
css/style.css           — Full Kawaii theme + shared styles (~890 lines)
js/game-x2-engine.js        — Power of X2: pure game logic, testable
js/game-x2.js               — Power of X2: UI controller
js/game-blink-engine.js     — Fill In the Blink: pure game logic, testable
js/game-blink.js            — Fill In the Blink: UI controller (~1000 lines, includes injected CSS)
js/app.js                   — Navigation, player name, PWA setup
sw.js                       — Service worker (network-first, v4)
manifest.json               — PWA manifest (portrait, pink theme)
tests/                       — Jest unit tests
  game-x2-engine.test.js    — 51 tests covering X2 engine
  game-blink-engine.test.js — 58 tests covering Blink engine
package.json            — npm scripts: test (jest), start (serve)
```

**Hosting:**
- GitHub Pages: `https://jobondi.github.io/adas-learning-and-fun/`
- Repository: `github.com/jobondi/adas-learning-and-fun` (personal account)
- Deploys automatically on push to `main`

**Key properties:**
- No app store required — runs in any browser
- Installable on iOS, Android, tablet, desktop
- Shareable via URL or QR code
- Offline-capable via service worker asset caching (network-first for app files, cache-first for external resources)
- Portrait orientation locked

**Input:**
- Primary: Touch / tap
- Secondary: Mouse click (desktop testing)

**Target form factors (priority order):**
1. Phone (portrait)
2. Tablet (portrait)
3. Desktop browser (testing / development)

---

## 3. Visual Theme

**Style:** Kawaii-inspired

- **Font:** Nunito (400, 700, 900 weights) via Google Fonts
- **Color palette:** CSS custom properties defined in `:root`
  - Pink (`#FFB7D5`), Lavender (`#D4B5FF`), Mint (`#A8E6CF`), Sky (`#A8D8EA`), Peach (`#FFDAC1`), Yellow (`#FFF3B0`)
- **Backgrounds:** Pastel gradients per screen
- **Animations:** Bouncing mascots, twinkling stars, floating clouds, sparkles
- **Buttons:** 3D push-down effect with box-shadow shift on press
- **Corners:** Generous border-radius (12px-28px)

---

## 4. Screen Flow

```
Title Screen -> Name Screen -> Game Hub -> [Game Screens]
     ^              ^            ^
     +--------------+            |
          (back)                 |
                    <------------+
                       (back)
```

- **Title Screen:** Mascot, stars, "Let's Go!" button
- **Name Screen:** "What's your name?" input (skipped if name already in localStorage)
- **Game Hub:** Branding header, greeting with player name, game selection cards (⚡ Power of X2, 👀 Fill In the Blink)
- **Game Screens:** Full-screen game with back button (top-left) and centered title (aligned on same line), game content vertically centered

**Navigation glue (`app.js`):**
- `navigateTo(screenId)` manages screen transitions via CSS class toggling
- Exposes `window.adaNavigateTo` for game modules that rebuild their own DOM (e.g., Fill In the Blink replaces its placeholder content on first init, losing the original back button's event listener)

---

## 5. Mini-Game #1: The Power of X2

### 5.1 Concept
A column-shooter variant of 2048 focused on teaching **powers of two**. Player shoots numbered blocks upward into columns. Matching blocks merge and advance to the next power of two. Goal is to reach 2048.

### 5.2 Grid
- **8 columns x 8 rows**
- Blocks stack from the **top down** (row 0 = visual top, fills downward)
- Grid rendered as CSS grid inside a rounded white container with lavender border

### 5.3 Shooting Mechanics
- Player taps a **column arrow** below the grid to shoot into that column
- Shot block flies **straight up** into position (0.6s CSS animation with subtle bounce on landing)
- After the shoot animation completes (600ms), merges resolve with a separate pop animation (700ms)
- Input is locked during the full animation sequence (~1.3s total)
- Player sees the **current block** and the **next block** in a queue centered below the arrows

### 5.4 Block Values
Spawn values with weights:

| Value | Weight | Approx % |
|-------|--------|----------|
| 2     | 50     | 50%      |
| 4     | 30     | 30%      |
| 8     | 15     | 15%      |
| 16    | 5      | 5%       |

### 5.5 Merge Resolution
1. Block lands at the next available position in the chosen column
2. If block matches the value of the block directly above it -> merge (value doubles to next power of two)
3. Check if newly merged block matches the block above it -> cascade merge
4. Repeat until no match or top of column reached

**Power of two sequence:** 2 -> 4 -> 8 -> 16 -> 32 -> 64 -> 128 -> 256 -> 512 -> 1024 -> 2048

**Merge formula:** `mergedValue = max(a.value, b.value) * 2`

### 5.6 Special Blocks

| Block | Name | Visual | Behavior | Spawn Rate |
|-------|------|--------|----------|------------|
| W     | Wild | Pink/purple gradient circle with glowing "W", pulsing glow animation | Merges with any block regardless of value, doubling the higher value | 7% |

- Wild blocks never appear as the very first block of a game
- The wild card is designed to provide occasional relief while keeping focus on learning powers of two

**Iceboxed for future revisions:**
- ~~Bomb: destroys adjacent blocks on merge~~ -- removed to keep game focused on math
- ~~Multiplier: merges at 4x instead of 2x~~ -- removed to keep game focused on math

### 5.7 Animations

| Animation | Duration | Description |
|-----------|----------|-------------|
| Shoot     | 0.6s     | Block flies straight up from below grid, subtle bounce on landing |
| Merge Pop | 0.7s     | Scale burst (0.2->1.5->0.85->1.2->1) with golden glow box-shadow |
| Wild Glow | 1.5s     | Continuous alternating pulse (scale + box-shadow) on wild blocks |

### 5.8 Win / Loss Conditions
- **Win:** Create a **2048 block** through merges
- **Loss:** Any column fills all 8 rows
- **No score display** -- the only goal is reaching 2048

### 5.9 Engine Architecture

The game logic is split into two layers:

**`game-x2-engine.js` (X2Engine)** -- Pure functions, no DOM:
- `createGrid()` -- initialize 8x8 null grid
- `getColumnHeight(grid, col)` -- count filled slots from top
- `isColumnFull()`, `isBoardFull()`, `hasFullColumn()` -- state checks
- `generateBlock(blockCount, randValue, randType)` -- weighted random with optional seeded RNG
- `weightedRandom(items, rand)` -- generic weighted selection
- `canMerge(a, b)` -- wild or same-value check
- `getMergedValue(a, b)` -- max x 2
- `clearMergedFlags(grid)` -- reset animation flags
- `resolveMerges(grid, col, startRow)` -- cascade merge resolution
- `placeAndMerge(grid, col, block)` -- convenience: place + merge

**`game-x2.js` (PowerOfX2)** -- UI controller:
- Consumes X2Engine for all logic
- Manages DOM rendering (grid, queue, overlay)
- Two-phase animation: shoot first, then merge
- Arrow button input with animation locking
- Exposes `init()` and `start()` to the app shell

---

## 6. Mini-Game #2: Fill In the Blink

### 6.1 Concept
A spelling and vocabulary game for grades 2-4. A word is displayed with **one missing letter** (random position), represented by a **single blinking eye** (closed by default as an em dash, opens to show the eye emoji briefly every 2.5 seconds via JS `setInterval`). A short definition appears below as a clue. The player taps the correct letter on a custom on-screen QWERTY keyboard.

### 6.2 Word List
- **600 hardcoded words** with short definitions, organized by grade level:
  - Grade 2: ~200 words (e.g., "brave", "climb", "whale", "arrow", "frost")
  - Grade 3: ~200 words (e.g., "ancient", "explore", "habitat", "culture", "gravity")
  - Grade 4: ~200 words (e.g., "abandon", "boundary", "evidence", "catalyst", "diagnose")
- Each word has: `word` (lowercase), `def` (5-12 word definition), `grade` (2, 3, or 4)

### 6.3 Difficulty Progression
Configurable thresholds (designed for easy tuning):

| Words Completed | Max Word Grade |
|-----------------|---------------|
| 0-7             | Grade 2       |
| 8-17            | Grade 3       |
| 18+             | Grade 4       |

Follows the **optimal challenge** principle -- start easy and increase difficulty as the player demonstrates competence.

### 6.4 Game Flow
1. Timer starts at **2 minutes** (120 seconds)
2. Word displayed with random missing letter (shown as em dash / blinking eye) and definition below
3. Player taps a letter on the QWERTY keyboard
4. **Correct:** Timer keeps running, celebration animation plays, words completed counter increments, auto-advances to next word after 1.5s
5. **Wrong:** Timer keeps running, **-3 seconds** subtracted from clock (orange "-3" floats up from word to timer bar over 1.5s), wrong letter is disabled, X appears on slot with shake animation, unlocks after 1.5s
6. After 1/2/3 wrong guesses, 5/10/15 incorrect keys are eliminated from the keyboard (fly-away animation)
7. When timer reaches 0, end-of-session overlay appears

### 6.5 Missing Letter Display
The missing letter slot uses a **single eye emoji** with a JS-driven blink effect:
- **Default state (closed):** An em dash character, inline with the other letters
- **Blink (every 4s):** JS `setInterval` swaps the em dash to the eye emoji for 600ms, then swaps back
- No CSS animation -- pure content swap via `textContent` for an instant, crisp blink
- Blink interval is started on each new word and stopped on correct answer, end of session, or back navigation

### 6.6 Animations & Feedback

**Correct answer** (clock keeps running, 1.5s animation):
Random celebration from a pool of 3 (extensible):
- **Sparkle**: Sparkle particles burst outward from the word
- **Confetti**: Colorful confetti pieces fly in all directions
- **Emoji Burst**: Thumbs up, smiley, and star emojis float outward from the word
Plus: score bounce animation, ascending two-note chime (C5->E5), haptic vibration (100ms)

Celebration particle positions are computed in JS using `cos()`/`sin()` and passed as `--tx`/`--ty` CSS custom properties (avoids CSS trig function browser compatibility issues).

**Wrong answer** (clock keeps running, 1.5s animation):
- X replaces the missing letter slot
- Slot shakes side-to-side
- Guessed key is disabled (no color change)
- **Timer penalty**: Orange "-3" label floats up from the missing letter slot to timer bar (1.5s ease-out), subtracts 3 seconds
- After 500ms delay, additional keys fly away off the keyboard
- Descending sawtooth buzz sound, double-buzz haptic

**Key elimination animation**: Keys shrink, translate in a random direction, and fade out (500ms)

### 6.7 End-of-Session Stats
- "Time's Up!" header
- Words Completed: count of correct answers
- Wrong guesses: total count
- Scrollable word list in dictionary style (bold word + definition)
- "Play Again!" button to restart

### 6.8 Engine Architecture

**`game-blink-engine.js` (BlinkEngine)** -- Pure functions, no DOM:
- `WORDS` -- 300 words with grade/definition metadata
- `DIFFICULTY_THRESHOLDS` -- configurable progression breakpoints
- `getDifficulty(wordsCompleted)` -- returns max grade for current progress
- `pickWord(maxGrade, usedIndices)` -- random word selection avoiding repeats
- `pickMissingIndex(word)` -- random letter position to blank out
- `checkGuess(word, missingIndex, guessedLetter)` -- case-insensitive check
- `getEliminatedKeys(word, missingIndex, wrongGuesses)` -- deterministic key removal (seeded shuffle)
- `createSession()`, `recordCorrect()`, `recordWrong()` -- session state management

**`game-blink.js` (FillInTheBlink)** -- UI controller:
- Dynamically builds game DOM on first init (replaces placeholder content)
- Injects game-specific CSS via `<style id="blink-game-styles">` tag
- JS-driven eye blink via `setInterval` (no CSS animation)
- Timer using `requestAnimationFrame` with pause/resume
- QWERTY keyboard with uniform square keys, per-key state management
- Score display: large number centered above "words completed" label
- Celebration animation system (sparkles, confetti, emoji burst)
- Web Audio API for sound effects (no audio files needed)
- Uses `window.adaNavigateTo` for back navigation (since DOM is rebuilt)
- Exposes `init()` and `start()` to the app shell

---

## 7. Testing

**Framework:** Jest (v30)

**Test coverage (109 tests):**

*X2 Engine (51 tests):*
- Constants, weighted random, grid creation, column height
- Column/board state detection, block generation
- Merge eligibility, merge values (full power chain)
- Cascade merges, wild card behavior, win detection
- Column compaction, place-and-merge, edge cases

*Blink Engine (58 tests):*
- Constants, word list validation (200 words, grades, no duplicates)
- Difficulty progression thresholds and boundary values
- Word selection (grade filtering, used-index avoidance, exhaustion)
- Missing index selection, guess checking (case-insensitive)
- Key elimination (counts per wrong-guess level, never eliminates correct letter, determinism)
- Session state management (create, recordCorrect, recordWrong)

**Run tests:** `npm test`

---

## 8. Future / v2 Considerations

- **The Power of X2:** Difficulty progression (higher spawn values as game advances)
- **The Power of X2:** Additional special blocks focused on powers-of-two learning
- **Fill In the Blink:** Two missing letters (hard mode)
- **Fill In the Blink:** Themed word category packs
- **Fill In the Blink:** Expanded word list (grades 1 and 5)
- **Fill In the Blink:** More celebration animations (extensible pool)
- **Suite:** Full offline mode (service worker caches all assets)
- **Suite:** Player progress persistence
- **Suite:** Additional mini-games
- **Suite:** In-app QR code generation for sharing

---

## 9. Open Items

- ~~Word list source / curation for Fill In the Blink~~ -- resolved: 200 hardcoded words, grades 2-4
- ~~Definition source for Fill In the Blink~~ -- resolved: inline short definitions per word
- Sound design -- additional audio variety beyond current Web Audio tones
- PWA icons (192x192 and 512x512 PNGs referenced in manifest but not yet created)
- ~~Hosting / deployment strategy for public access~~ -- resolved: GitHub Pages

---

*Spec version: 1.0 | Project: Ada's Learning AND Fun!*
