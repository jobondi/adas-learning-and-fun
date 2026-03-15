/**
 * The Power of X2 — UI controller.
 * Depends on X2Engine (game-x2-engine.js) for all game logic.
 * Handles DOM rendering, animations, and user input.
 */
var PowerOfX2 = (function () {
  'use strict';

  var E = X2Engine;

  // ===================== Visual Config =====================

  var VALUE_COLORS = {
    2: { bg: '#E8D5F5', border: '#D4B5FF', text: '#6B4E8B' },
    4: { bg: '#FFD6E8', border: '#FFB7D5', text: '#8B4E6B' },
    8: { bg: '#FFDAC1', border: '#F0C4A0', text: '#8B6B4E' },
    16: { bg: '#FFF3B0', border: '#FFE066', text: '#7A6B2E' },
    32: { bg: '#A8E6CF', border: '#7DD3B0', text: '#2E6B4E' },
    64: { bg: '#A8D8EA', border: '#7DC0D8', text: '#2E5A6B' },
    128: { bg: '#C3AED6', border: '#9B7FBF', text: '#4A2E6B' },
    256: { bg: '#FF9AA2', border: '#E87A82', text: '#6B2E32' },
    512: { bg: '#FFB347', border: '#E89A2E', text: '#6B4E1A' },
    1024: { bg: '#87CEEB', border: '#5FAED0', text: '#1A4E6B' },
    2048: { bg: '#FFD700', border: '#E8C200', text: '#5A4A00' },
  };

  var WILD_COLOR = { bg: '#FF69B4', border: '#E84E96', text: '#FFF' };

  // Animation durations (ms) — keep in sync with CSS
  var SHOOT_DURATION = 600;
  var MERGE_DURATION = 700;

  // ===================== State =====================

  var grid;
  var currentBlock;
  var nextBlock;
  var blockCount;
  var gameOver;
  var animating;

  // ===================== DOM Refs =====================

  var elGrid, elCurrent, elNext, elArrows, elOverlay;
  var elOverlayIcon, elOverlayTitle, elOverlayMsg;

  // ===================== Rendering =====================

  function getBlockStyle(block) {
    if (block.type === E.TYPE_WILD) return WILD_COLOR;
    return VALUE_COLORS[block.value] || VALUE_COLORS[2];
  }

  function getBlockLabel(block) {
    if (block.type === E.TYPE_WILD) return 'W';
    return String(block.value);
  }

  function applyBlockStyle(el, block) {
    var style = getBlockStyle(block);
    el.style.background = style.bg;
    el.style.borderColor = style.border;
    el.style.color = style.text;
    el.textContent = getBlockLabel(block);
    el.classList.toggle('x2-wild', block.type === E.TYPE_WILD);
  }

  function renderGrid(shootCol, shootRow) {
    elGrid.innerHTML = '';

    for (var r = 0; r < E.ROWS; r++) {
      for (var c = 0; c < E.COLS; c++) {
        var cell = document.createElement('div');
        cell.className = 'x2-cell';
        var block = grid[c][r];

        if (block) {
          cell.classList.add('x2-cell-filled');
          applyBlockStyle(cell, block);

          if (block.value >= 1024) {
            cell.style.fontSize = '10px';
          } else if (block.value >= 128) {
            cell.style.fontSize = '12px';
          }

          if (block.merged) cell.classList.add('x2-cell-pop');
          if (c === shootCol && r === shootRow) cell.classList.add('x2-cell-shoot');
        }
        elGrid.appendChild(cell);
      }
    }
  }

  function renderQueue() {
    applyBlockStyle(elCurrent, currentBlock);
    applyBlockStyle(elNext, nextBlock);
  }

  function render(shootCol, shootRow) {
    renderGrid(shootCol, shootRow);
    renderQueue();
  }

  // ===================== Game Actions =====================

  function advanceQueue() {
    currentBlock = nextBlock;
    blockCount++;
    nextBlock = E.generateBlock(blockCount);
  }

  function shoot(col) {
    if (gameOver || animating) return;
    if (E.isColumnFull(grid, col)) return;

    animating = true;
    E.clearMergedFlags(grid);

    // Phase 1: Place block visually, show shoot animation
    var landRow = E.getColumnHeight(grid, col);
    grid[col][landRow] = {
      value: currentBlock.value,
      type: currentBlock.type,
      merged: false,
    };

    advanceQueue();
    render(col, landRow);

    // Phase 2: After shoot animation lands, resolve merges
    setTimeout(function () {
      if (gameOver) return;

      var result = E.resolveMerges(grid, col, landRow);
      render();

      if (result.won) {
        showOverlay(true);
        return;
      }

      if (E.hasFullColumn(grid)) {
        showOverlay(false);
        return;
      }

      // Unlock input after merge animation plays
      setTimeout(function () {
        animating = false;
      }, MERGE_DURATION);
    }, SHOOT_DURATION);
  }

  // ===================== UI =====================

  function buildArrows() {
    elArrows.innerHTML = '';
    for (var c = 0; c < E.COLS; c++) {
      var btn = document.createElement('button');
      btn.className = 'x2-arrow-btn';
      btn.textContent = '\u25B2';
      btn.setAttribute('data-col', c);
      btn.addEventListener('click', (function (col) {
        return function () { shoot(col); };
      })(c));
      elArrows.appendChild(btn);
    }
  }

  function showOverlay(won) {
    gameOver = true;
    elOverlay.classList.remove('hidden');
    if (won) {
      elOverlayIcon.textContent = '\uD83C\uDF89';
      elOverlayTitle.textContent = 'You reached 2048!';
      elOverlayMsg.textContent = 'Amazing job!';
    } else {
      elOverlayIcon.textContent = '\uD83D\uDE3F';
      elOverlayTitle.textContent = 'Game Over';
      elOverlayMsg.textContent = 'So close! Try again!';
    }
  }

  function hideOverlay() {
    elOverlay.classList.add('hidden');
  }

  // ===================== Init =====================

  function startGame() {
    grid = E.createGrid();
    blockCount = 0;
    gameOver = false;
    animating = false;

    currentBlock = E.generateBlock(blockCount);
    blockCount++;
    nextBlock = E.generateBlock(blockCount);

    hideOverlay();
    render();
  }

  function init() {
    elGrid = document.getElementById('x2-grid');
    elCurrent = document.getElementById('x2-current-block');
    elNext = document.getElementById('x2-next-block');
    elArrows = document.getElementById('x2-arrows');
    elOverlay = document.getElementById('x2-overlay');
    elOverlayIcon = document.getElementById('x2-overlay-icon');
    elOverlayTitle = document.getElementById('x2-overlay-title');
    elOverlayMsg = document.getElementById('x2-overlay-msg');

    if (!elGrid) return;

    buildArrows();

    document.getElementById('x2-play-again').addEventListener('click', function () {
      startGame();
    });
  }

  return {
    init: init,
    start: startGame,
  };
})();
