# Ada's Learning & Fun — Project Notes

## Key Files
- **Spec**: `docs/SPEC.md` (v1.0) — single source of truth for architecture and game design
- **Tests**: `tests/game-blink-engine.test.js` (58 tests), `tests/game-x2-engine.test.js` (51 tests)
- **Engines**: Pure-function IIFEs in `js/game-*-engine.js` — no DOM, testable with Jest
- **UI controllers**: IIFEs in `js/game-*.js` — DOM rendering, animations, input handling

## Architecture
- Vanilla HTML/CSS/JS PWA, no frameworks, no build step
- IIFE pattern with `var` declarations (ES5-compatible)
- Engine/UI separation: engines are pure logic, UI controllers consume engines
- CSS injected dynamically by UI controllers (not in style.css) for game-specific styles
- `window.adaNavigateTo` exposed by app.js for cross-module navigation

## Deployment
- **GitHub Pages**: https://jobondi.github.io/adas-learning-and-fun/
- Deploys automatically on push to `main`
- No build step required — static files served directly

## Conventions
- Keep spec version at v1.0 until user says otherwise
- Always update SPEC.md, tests, and code comments when functionality changes
- Run `npx jest` to verify all tests pass before committing
