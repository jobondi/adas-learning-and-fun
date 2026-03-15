# Ada's Learning AND Fun! — Specification v2.0

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
- Vanilla HTML / CSS / JavaScript — no frameworks
- Single `index.html` with CSS screen-based navigation (opacity/visibility/z-index transitions)
- Service worker for offline asset caching

**File structure:**
```
index.html              — All screens (title, name, hub, games)
css/style.css           — Full Kawaii theme + game styles (~900 lines)
js/game-x2-engine.js   — Pure game logic, zero DOM deps, testable
js/game-x2.js          — UI controller (rendering, animations, input)
js/app.js              — Navigation, player name, PWA setup
sw.js                  — Service worker (cache-first, v2)
manifest.json          — PWA manifest (portrait, pink theme)
tests/                  — Jest unit tests
  game-x2-engine.test.js — 43 tests covering all engine functions
package.json            — npm scripts: test (jest), start (serve)
```

**Key properties:**
- No app store required — runs in any browser
- Installable on iOS, Android, tablet, desktop
- Shareable via URL or QR code
- Offline-capable via service worker asset caching
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
- **Corners:** Generous border-radius (12px–28px)

---

## 4. Screen Flow

```
Title Screen → Name Screen → Game Hub → [Game Screens]
     ↑              ↑            ↑
     └──────────────┘            │
          (back)                 │
                    ←────────────┘
                       (back)
```

- **Title Screen:** Mascot, stars, "Let's Go!" button
- **Name Screen:** "What's your name?" input (skipped if name already in localStorage)
- **Game Hub:** Branding header, greeting with player name, game cards
- **Game Screens:** Full-screen game with back button to hub

---

## 5. Mini-Game #1: The Power of X2

### 5.1 Concept
A column-shooter variant of 2048 focused on teaching **powers of two**. Player shoots numbered blocks upward into columns. Matching blocks merge and advance to the next power of two. Goal is to reach 2048.

### 5.2 Grid
- **8 columns × 8 rows**
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
2. If block matches the value of the block directly above it → merge (value doubles to next power of two)
3. Check if newly merged block matches the block above it → cascade merge
4. Repeat until no match or top of column reached

**Power of two sequence:** 2 → 4 → 8 → 16 → 32 → 64 → 128 → 256 → 512 → 1024 → 2048

**Merge formula:** `mergedValue = max(a.value, b.value) × 2`

### 5.6 Special Blocks

| Block | Name | Visual | Behavior | Spawn Rate |
|-------|------|--------|----------|------------|
| W     | Wild | Pink/purple gradient circle with glowing "W", pulsing glow animation | Merges with any block regardless of value, doubling the higher value | 7% |

- Wild blocks never appear as the very first block of a game
- The wild card is designed to provide occasional relief while keeping focus on learning powers of two

**Iceboxed for future revisions:**
- ~~Bomb (💣): destroys adjacent blocks on merge~~ — removed to keep game focused on math
- ~~Multiplier (⚡): merges at 4× instead of 2×~~ — removed to keep game focused on math

### 5.7 Animations

| Animation | Duration | Description |
|-----------|----------|-------------|
| Shoot     | 0.6s     | Block flies straight up from below grid, subtle bounce on landing |
| Merge Pop | 0.7s     | Scale burst (0.2→1.5→0.85→1.2→1) with golden glow box-shadow |
| Wild Glow | 1.5s     | Continuous alternating pulse (scale + box-shadow) on wild blocks |

### 5.8 Win / Loss Conditions
- **Win:** Create a **2048 block** through merges
- **Loss:** Any column fills all 8 rows
- **No score display** — the only goal is reaching 2048

### 5.9 Engine Architecture

The game logic is split into two layers:

**`game-x2-engine.js` (X2Engine)** — Pure functions, no DOM:
- `createGrid()` — initialize 8×8 null grid
- `getColumnHeight(grid, col)` — count filled slots from top
- `isColumnFull()`, `isBoardFull()`, `hasFullColumn()` — state checks
- `generateBlock(blockCount, randValue, randType)` — weighted random with optional seeded RNG
- `weightedRandom(items, rand)` — generic weighted selection
- `canMerge(a, b)` — wild or same-value check
- `getMergedValue(a, b)` — max × 2
- `clearMergedFlags(grid)` — reset animation flags
- `resolveMerges(grid, col, startRow)` — cascade merge resolution
- `placeAndMerge(grid, col, block)` — convenience: place + merge

**`game-x2.js` (PowerOfX2)** — UI controller:
- Consumes X2Engine for all logic
- Manages DOM rendering (grid, queue, overlay)
- Two-phase animation: shoot first, then merge
- Arrow button input with animation locking
- Exposes `init()` and `start()` to the app shell

---

## 6. Mini-Game #2: Fill In the Blink

### 6.1 Status: Placeholder Only

Currently shows a "Coming soon!" screen with a preview of the concept (blinking eyes in a word).

### 6.2 Planned Concept
A spelling and vocabulary game for grades 1–5. A word is displayed with **one missing letter**, represented by **blinking eyes 👀**. A simple definition appears below as a clue. The player taps the correct letter on a custom on-screen QWERTY keyboard.

### 6.3 Planned Features
- **3-minute timer** per session
- Score = number of words correctly completed
- Custom QWERTY keyboard (no system keyboard)
- Adaptive difficulty: wrong guesses progressively remove incorrect letter options
- Haptic feedback where supported

---

## 7. Testing

**Framework:** Jest (v30)

**Test coverage (43 tests):**
- Constants validation (grid dimensions, win value, spawn values are powers of two)
- Weighted random selection with deterministic seeded RNG
- Grid creation and column height measurement
- Column/board full state detection
- Block generation (normal vs wild, first-block safety)
- Merge eligibility (same value, different value, wild, null safety)
- Merge value calculation (full 2→2048 power chain verified)
- Cascade merge resolution (2+2→4+4→8)
- Wild card merge behavior
- Win detection on reaching 2048
- Column compaction after merges (no gaps)
- Place-and-merge convenience wrapper

**Run tests:** `npm test`

---

## 8. Future / v2 Considerations

- **The Power of X2:** Difficulty progression (higher spawn values as game advances)
- **The Power of X2:** Additional special blocks focused on powers-of-two learning
- **Fill In the Blink:** Full implementation with word lists for grades 1–5
- **Fill In the Blink:** Two missing letters (hard mode)
- **Fill In the Blink:** Themed word category packs
- **Suite:** Sound effects and haptic feedback
- **Suite:** Full offline mode (service worker caches all assets)
- **Suite:** Player progress persistence
- **Suite:** Additional mini-games
- **Suite:** In-app QR code generation for sharing

---

## 9. Open Items

- Word list source / curation for Fill In the Blink
- Definition source / API or static list for Fill In the Blink
- Sound design — celebration and blooper audio assets
- PWA icons (192×192 and 512×512 PNGs referenced in manifest but not yet created)
- Hosting / deployment strategy for public access

---

*Spec version: 2.0 | Project: Ada's Learning AND Fun!*
