/**
 * Unit tests for X2Engine — The Power of X2 game logic.
 */
const E = require('../js/game-x2-engine');

describe('X2Engine', () => {
  // ===================== Constants =====================

  describe('constants', () => {
    test('grid is 8×8', () => {
      expect(E.COLS).toBe(8);
      expect(E.ROWS).toBe(8);
    });

    test('win value is 2048', () => {
      expect(E.WIN_VALUE).toBe(2048);
    });

    test('block types are defined', () => {
      expect(E.TYPE_NORMAL).toBe('normal');
      expect(E.TYPE_WILD).toBe('wild');
    });

    test('spawn values are powers of two', () => {
      E.SPAWN_VALUES.forEach(({ value }) => {
        expect(Math.log2(value) % 1).toBe(0);
      });
    });

    test('wild rate is 7%', () => {
      expect(E.WILD_RATE).toBeCloseTo(0.07);
    });
  });

  // ===================== weightedRandom =====================

  describe('weightedRandom', () => {
    test('returns lowest value when rand is 0', () => {
      expect(E.weightedRandom(E.SPAWN_VALUES, 0)).toBe(2);
    });

    test('returns highest value when rand is near 1', () => {
      expect(E.weightedRandom(E.SPAWN_VALUES, 0.999)).toBe(16);
    });

    test('returns value within the second bucket', () => {
      // Weights: 2=50, 4=30, 8=15, 16=5. Total=100
      // rand=0.6 → r=60. After 2: 60-50=10. After 4: 10-30=-20 → returns 4
      expect(E.weightedRandom(E.SPAWN_VALUES, 0.6)).toBe(4);
    });

    test('returns value within the third bucket', () => {
      // rand=0.85 → r=85. After 2: 85-50=35. After 4: 35-30=5. After 8: 5-15=-10 → returns 8
      expect(E.weightedRandom(E.SPAWN_VALUES, 0.85)).toBe(8);
    });
  });

  // ===================== createGrid =====================

  describe('createGrid', () => {
    test('creates 8 columns with 8 null rows each', () => {
      const grid = E.createGrid();
      expect(grid.length).toBe(8);
      grid.forEach((col) => {
        expect(col.length).toBe(8);
        col.forEach((cell) => expect(cell).toBeNull());
      });
    });
  });

  // ===================== getColumnHeight =====================

  describe('getColumnHeight', () => {
    test('returns 0 for empty column', () => {
      const grid = E.createGrid();
      expect(E.getColumnHeight(grid, 0)).toBe(0);
    });

    test('returns 1 when one block at row 0', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 2, type: 'normal' };
      expect(E.getColumnHeight(grid, 0)).toBe(1);
    });

    test('returns 3 for three contiguous blocks from top', () => {
      const grid = E.createGrid();
      grid[3][0] = { value: 2, type: 'normal' };
      grid[3][1] = { value: 4, type: 'normal' };
      grid[3][2] = { value: 8, type: 'normal' };
      expect(E.getColumnHeight(grid, 3)).toBe(3);
    });

    test('stops counting at first gap', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 2, type: 'normal' };
      // gap at row 1
      grid[0][2] = { value: 4, type: 'normal' };
      expect(E.getColumnHeight(grid, 0)).toBe(1);
    });
  });

  // ===================== isColumnFull / isBoardFull / hasFullColumn =====================

  describe('column and board state checks', () => {
    test('isColumnFull returns false for empty column', () => {
      const grid = E.createGrid();
      expect(E.isColumnFull(grid, 0)).toBe(false);
    });

    test('isColumnFull returns true when all 8 rows filled', () => {
      const grid = E.createGrid();
      for (let r = 0; r < 8; r++) {
        grid[0][r] = { value: 2, type: 'normal' };
      }
      expect(E.isColumnFull(grid, 0)).toBe(true);
    });

    test('hasFullColumn detects any full column', () => {
      const grid = E.createGrid();
      expect(E.hasFullColumn(grid)).toBe(false);
      for (let r = 0; r < 8; r++) {
        grid[5][r] = { value: 2, type: 'normal' };
      }
      expect(E.hasFullColumn(grid)).toBe(true);
    });

    test('isBoardFull returns false when any column is empty', () => {
      const grid = E.createGrid();
      // Fill all but column 7
      for (let c = 0; c < 7; c++) {
        for (let r = 0; r < 8; r++) {
          grid[c][r] = { value: 2, type: 'normal' };
        }
      }
      expect(E.isBoardFull(grid)).toBe(false);
    });

    test('isBoardFull returns true when every cell is filled', () => {
      const grid = E.createGrid();
      for (let c = 0; c < 8; c++) {
        for (let r = 0; r < 8; r++) {
          grid[c][r] = { value: 2, type: 'normal' };
        }
      }
      expect(E.isBoardFull(grid)).toBe(true);
    });
  });

  // ===================== generateBlock =====================

  describe('generateBlock', () => {
    test('first block (blockCount=0) is always normal', () => {
      // Even with randType that would trigger wild
      const block = E.generateBlock(0, 0.5, 0.01);
      expect(block.type).toBe('normal');
    });

    test('subsequent block can be wild when randType < WILD_RATE', () => {
      const block = E.generateBlock(5, 0.5, 0.03);
      expect(block.type).toBe('wild');
    });

    test('subsequent block is normal when randType >= WILD_RATE', () => {
      const block = E.generateBlock(5, 0.5, 0.5);
      expect(block.type).toBe('normal');
    });

    test('block value comes from spawn values', () => {
      const block = E.generateBlock(1, 0, 0.5);
      expect([2, 4, 8, 16]).toContain(block.value);
    });
  });

  // ===================== canMerge =====================

  describe('canMerge', () => {
    test('same values merge', () => {
      const a = { value: 4, type: 'normal' };
      const b = { value: 4, type: 'normal' };
      expect(E.canMerge(a, b)).toBe(true);
    });

    test('different values do not merge', () => {
      const a = { value: 4, type: 'normal' };
      const b = { value: 8, type: 'normal' };
      expect(E.canMerge(a, b)).toBe(false);
    });

    test('wild merges with any normal block', () => {
      const wild = { value: 2, type: 'wild' };
      const normal = { value: 128, type: 'normal' };
      expect(E.canMerge(wild, normal)).toBe(true);
      expect(E.canMerge(normal, wild)).toBe(true);
    });

    test('two wilds merge', () => {
      const a = { value: 2, type: 'wild' };
      const b = { value: 4, type: 'wild' };
      expect(E.canMerge(a, b)).toBe(true);
    });

    test('null blocks do not merge', () => {
      expect(E.canMerge(null, { value: 2, type: 'normal' })).toBe(false);
      expect(E.canMerge({ value: 2, type: 'normal' }, null)).toBe(false);
    });
  });

  // ===================== getMergedValue =====================

  describe('getMergedValue', () => {
    test('doubles the value for same-value blocks', () => {
      const a = { value: 16, type: 'normal' };
      const b = { value: 16, type: 'normal' };
      expect(E.getMergedValue(a, b)).toBe(32);
    });

    test('doubles the higher value for wild merge', () => {
      const wild = { value: 2, type: 'wild' };
      const normal = { value: 64, type: 'normal' };
      expect(E.getMergedValue(wild, normal)).toBe(128);
    });

    test('2+2=4, 4+4=8, ... 1024+1024=2048 (power of two chain)', () => {
      let v = 2;
      while (v < 2048) {
        const a = { value: v, type: 'normal' };
        const b = { value: v, type: 'normal' };
        expect(E.getMergedValue(a, b)).toBe(v * 2);
        v *= 2;
      }
    });
  });

  // ===================== clearMergedFlags =====================

  describe('clearMergedFlags', () => {
    test('sets merged to false on all blocks', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 4, type: 'normal', merged: true };
      grid[1][0] = { value: 8, type: 'normal', merged: true };
      grid[2][0] = { value: 2, type: 'normal', merged: false };
      E.clearMergedFlags(grid);
      expect(grid[0][0].merged).toBe(false);
      expect(grid[1][0].merged).toBe(false);
      expect(grid[2][0].merged).toBe(false);
    });
  });

  // ===================== resolveMerges =====================

  describe('resolveMerges', () => {
    test('merges two matching adjacent blocks', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 4, type: 'normal', merged: false };
      grid[0][1] = { value: 4, type: 'normal', merged: false };
      const result = E.resolveMerges(grid, 0, 1);
      expect(result.won).toBe(false);
      expect(grid[0][0].value).toBe(8);
      expect(grid[0][0].merged).toBe(true);
      expect(grid[0][1]).toBeNull();
    });

    test('does not merge non-matching blocks', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 4, type: 'normal', merged: false };
      grid[0][1] = { value: 8, type: 'normal', merged: false };
      E.resolveMerges(grid, 0, 1);
      expect(grid[0][0].value).toBe(4);
      expect(grid[0][1].value).toBe(8);
    });

    test('cascade merge: 2+2→4, then 4+4→8', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 4, type: 'normal', merged: false };
      grid[0][1] = { value: 2, type: 'normal', merged: false };
      grid[0][2] = { value: 2, type: 'normal', merged: false };
      // Resolve from row 2: 2+2=4, then 4+4=8
      const result = E.resolveMerges(grid, 0, 2);
      expect(grid[0][0].value).toBe(8);
      expect(grid[0][1]).toBeNull();
      expect(grid[0][2]).toBeNull();
    });

    test('wild card merges with any value and doubles it', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 32, type: 'normal', merged: false };
      grid[0][1] = { value: 8, type: 'wild', merged: false };
      const result = E.resolveMerges(grid, 0, 1);
      expect(grid[0][0].value).toBe(64); // max(32,8)*2 = 64
      expect(grid[0][0].type).toBe('normal'); // merged result is always normal
    });

    test('returns won:true when merge reaches 2048', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 1024, type: 'normal', merged: false };
      grid[0][1] = { value: 1024, type: 'normal', merged: false };
      const result = E.resolveMerges(grid, 0, 1);
      expect(result.won).toBe(true);
      expect(grid[0][0].value).toBe(2048);
    });

    test('compacts column after merge (no gaps)', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 4, type: 'normal', merged: false };
      grid[0][1] = { value: 4, type: 'normal', merged: false };
      grid[0][2] = { value: 8, type: 'normal', merged: false };
      // Merge row 1 into row 0 → gap at row 1, row 2 shifts up
      E.resolveMerges(grid, 0, 1);
      expect(grid[0][0].value).toBe(8); // merged
      expect(grid[0][1].value).toBe(8); // shifted up from row 2
      expect(grid[0][2]).toBeNull();
    });
  });

  // ===================== placeAndMerge =====================

  describe('placeAndMerge', () => {
    test('places block at correct height in empty column', () => {
      const grid = E.createGrid();
      const result = E.placeAndMerge(grid, 3, { value: 2, type: 'normal' });
      expect(result.landRow).toBe(0);
      expect(grid[3][0].value).toBe(2);
    });

    test('places block below existing blocks', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 2, type: 'normal', merged: false };
      const result = E.placeAndMerge(grid, 0, { value: 4, type: 'normal' });
      expect(result.landRow).toBe(1);
      expect(grid[0][1].value).toBe(4);
    });

    test('merges on placement when values match', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 8, type: 'normal', merged: false };
      E.placeAndMerge(grid, 0, { value: 8, type: 'normal' });
      expect(grid[0][0].value).toBe(16);
      expect(grid[0][1]).toBeNull();
    });

    test('returns landRow=-1 when column is full', () => {
      const grid = E.createGrid();
      for (let r = 0; r < 8; r++) {
        grid[0][r] = { value: 2, type: 'normal', merged: false };
      }
      const result = E.placeAndMerge(grid, 0, { value: 2, type: 'normal' });
      expect(result.landRow).toBe(-1);
    });

    test('detects win on merge to 2048', () => {
      const grid = E.createGrid();
      grid[0][0] = { value: 1024, type: 'normal', merged: false };
      const result = E.placeAndMerge(grid, 0, { value: 1024, type: 'normal' });
      expect(result.won).toBe(true);
      expect(grid[0][0].value).toBe(2048);
    });
  });
});
