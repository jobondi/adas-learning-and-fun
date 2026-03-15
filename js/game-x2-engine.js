/**
 * The Power of X2 — Pure game engine (no DOM dependencies).
 * Exports: window.X2Engine
 *
 * All game logic lives here: grid management, block generation,
 * merging, column height, win/loss detection. The UI layer
 * (game-x2.js) consumes this engine and handles rendering.
 */
var X2Engine = (function () {
  'use strict';

  // ===================== Constants =====================

  var COLS = 8;
  var ROWS = 8;
  var WIN_VALUE = 2048;

  var TYPE_NORMAL = 'normal';
  var TYPE_WILD = 'wild';

  var SPAWN_VALUES = [
    { value: 2, weight: 50 },
    { value: 4, weight: 30 },
    { value: 8, weight: 15 },
    { value: 16, weight: 5 },
  ];

  var WILD_RATE = 0.07;

  // ===================== Helpers =====================

  /** Pick a value from a weighted list. Accepts optional RNG (0-1). */
  function weightedRandom(items, rand) {
    if (rand === undefined) rand = Math.random();
    var total = 0;
    for (var i = 0; i < items.length; i++) total += items[i].weight;
    var r = rand * total;
    for (var i = 0; i < items.length; i++) {
      r -= items[i].weight;
      if (r <= 0) return items[i].value;
    }
    return items[items.length - 1].value;
  }

  // ===================== Grid =====================

  /** Create a COLS × ROWS grid filled with null. */
  function createGrid() {
    var grid = [];
    for (var c = 0; c < COLS; c++) {
      grid[c] = [];
      for (var r = 0; r < ROWS; r++) {
        grid[c][r] = null;
      }
    }
    return grid;
  }

  /** Number of filled slots from row 0 downward (0 = empty column). */
  function getColumnHeight(grid, col) {
    var count = 0;
    for (var r = 0; r < ROWS; r++) {
      if (grid[col][r]) count++;
      else break;
    }
    return count;
  }

  /** Returns true if the column is completely full. */
  function isColumnFull(grid, col) {
    return getColumnHeight(grid, col) >= ROWS;
  }

  /** Returns true if every column is full (board is full). */
  function isBoardFull(grid) {
    for (var c = 0; c < COLS; c++) {
      if (!isColumnFull(grid, c)) return false;
    }
    return true;
  }

  /** Check if ANY column is full (loss condition). */
  function hasFullColumn(grid) {
    for (var c = 0; c < COLS; c++) {
      if (isColumnFull(grid, c)) return true;
    }
    return false;
  }

  // ===================== Block Generation =====================

  /**
   * Generate a block. First block is always normal.
   * @param {number} blockCount - how many blocks have been generated so far
   * @param {number} [randValue] - optional RNG for value selection (0-1)
   * @param {number} [randType] - optional RNG for type selection (0-1)
   */
  function generateBlock(blockCount, randValue, randType) {
    var value = weightedRandom(SPAWN_VALUES, randValue);
    if (randType === undefined) randType = Math.random();
    if (blockCount > 0 && randType < WILD_RATE) {
      return { value: value, type: TYPE_WILD };
    }
    return { value: value, type: TYPE_NORMAL };
  }

  // ===================== Merge Logic =====================

  /** Can blocks a and b merge? */
  function canMerge(a, b) {
    if (!a || !b) return false;
    if (a.type === TYPE_WILD || b.type === TYPE_WILD) return true;
    return a.value === b.value;
  }

  /** Merged value of a and b (always doubles the higher value). */
  function getMergedValue(a, b) {
    return Math.max(a.value, b.value) * 2;
  }

  /** Clear all merged flags on the grid. */
  function clearMergedFlags(grid) {
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        if (grid[c][r]) grid[c][r].merged = false;
      }
    }
  }

  /**
   * Resolve cascading merges starting at startRow, moving upward.
   * Mutates grid in-place.
   * @returns {{ won: boolean }} result
   */
  function resolveMerges(grid, col, startRow) {
    var r = startRow;
    while (r > 0 && grid[col][r] && grid[col][r - 1]) {
      var current = grid[col][r];
      var above = grid[col][r - 1];

      if (!canMerge(current, above)) break;

      var mergedValue = getMergedValue(current, above);

      grid[col][r - 1] = {
        value: mergedValue,
        type: TYPE_NORMAL,
        merged: true,
      };
      grid[col][r] = null;

      // Compact: shift everything below the gap up
      for (var s = r; s < ROWS - 1; s++) {
        grid[col][s] = grid[col][s + 1];
      }
      grid[col][ROWS - 1] = null;

      if (mergedValue >= WIN_VALUE) {
        return { won: true };
      }

      r--;
    }

    return { won: false };
  }

  /**
   * Place a block and resolve cascading merges.
   * Convenience wrapper around resolveMerges.
   * @returns {{ won: boolean, landRow: number }} result
   */
  function placeAndMerge(grid, col, block) {
    var height = getColumnHeight(grid, col);
    if (height >= ROWS) return { won: false, landRow: -1 };

    var landRow = height;
    grid[col][landRow] = {
      value: block.value,
      type: block.type,
      merged: false,
    };

    var result = resolveMerges(grid, col, landRow);
    result.landRow = landRow;
    return result;
  }

  // ===================== Public API =====================

  return {
    // Constants
    COLS: COLS,
    ROWS: ROWS,
    WIN_VALUE: WIN_VALUE,
    TYPE_NORMAL: TYPE_NORMAL,
    TYPE_WILD: TYPE_WILD,
    SPAWN_VALUES: SPAWN_VALUES,
    WILD_RATE: WILD_RATE,

    // Functions
    weightedRandom: weightedRandom,
    createGrid: createGrid,
    getColumnHeight: getColumnHeight,
    isColumnFull: isColumnFull,
    isBoardFull: isBoardFull,
    hasFullColumn: hasFullColumn,
    generateBlock: generateBlock,
    canMerge: canMerge,
    getMergedValue: getMergedValue,
    clearMergedFlags: clearMergedFlags,
    resolveMerges: resolveMerges,
    placeAndMerge: placeAndMerge,
  };
})();

// Support Node.js require for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = X2Engine;
}
