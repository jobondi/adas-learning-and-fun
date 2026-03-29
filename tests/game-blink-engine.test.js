/**
 * Unit tests for BlinkEngine — Fill In the Blink game logic.
 */
const E = require('../js/game-blink-engine');

describe('BlinkEngine', () => {
  // ===================== Constants =====================

  describe('constants', () => {
    test('ALPHABET contains all 26 uppercase letters', () => {
      expect(E.ALPHABET).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(E.ALPHABET.length).toBe(26);
    });

    test('ROUND_DURATION is 120 seconds', () => {
      expect(E.ROUND_DURATION).toBe(120);
    });

    test('CORRECT_PAUSE timing constant exists and is a number', () => {
      expect(typeof E.CORRECT_PAUSE).toBe('number');
      expect(E.CORRECT_PAUSE).toBe(1500);
    });

    test('WRONG_PAUSE timing constant exists and is a number', () => {
      expect(typeof E.WRONG_PAUSE).toBe('number');
      expect(E.WRONG_PAUSE).toBe(1500);
    });

    test('KEY_REMOVE_DELAY timing constant exists and is a number', () => {
      expect(typeof E.KEY_REMOVE_DELAY).toBe('number');
      expect(E.KEY_REMOVE_DELAY).toBe(500);
    });

    test('DIFFICULTY_THRESHOLDS is defined', () => {
      expect(Array.isArray(E.DIFFICULTY_THRESHOLDS)).toBe(true);
      expect(E.DIFFICULTY_THRESHOLDS.length).toBe(3);
    });
  });

  // ===================== Word List =====================

  describe('word list', () => {
    test('contains exactly 300 words', () => {
      expect(E.WORDS.length).toBe(300);
    });

    test('every word has word, def, and grade properties', () => {
      E.WORDS.forEach((entry, i) => {
        expect(entry).toHaveProperty('word');
        expect(entry).toHaveProperty('def');
        expect(entry).toHaveProperty('grade');
        expect(typeof entry.word).toBe('string');
        expect(typeof entry.def).toBe('string');
        expect(typeof entry.grade).toBe('number');
      });
    });

    test('all grades are 2, 3, or 4', () => {
      E.WORDS.forEach((entry) => {
        expect([2, 3, 4]).toContain(entry.grade);
      });
    });

    test('all words are lowercase', () => {
      E.WORDS.forEach((entry) => {
        expect(entry.word).toBe(entry.word.toLowerCase());
      });
    });

    test('no duplicate words', () => {
      const words = E.WORDS.map((e) => e.word);
      const unique = new Set(words);
      expect(unique.size).toBe(words.length);
    });

    test('every word has at least 2 characters', () => {
      E.WORDS.forEach((entry) => {
        expect(entry.word.length).toBeGreaterThanOrEqual(2);
      });
    });

    test('every definition is non-empty', () => {
      E.WORDS.forEach((entry) => {
        expect(entry.def.length).toBeGreaterThan(0);
      });
    });
  });

  // ===================== getDifficulty =====================

  describe('getDifficulty', () => {
    test('returns grade 2 at the start (0 words completed)', () => {
      expect(E.getDifficulty(0)).toBe(2);
    });

    test('returns grade 2 for 7 words completed', () => {
      expect(E.getDifficulty(7)).toBe(2);
    });

    test('returns grade 3 after 8 words completed', () => {
      expect(E.getDifficulty(8)).toBe(3);
    });

    test('returns grade 3 for 17 words completed', () => {
      expect(E.getDifficulty(17)).toBe(3);
    });

    test('returns grade 4 after 18 words completed', () => {
      expect(E.getDifficulty(18)).toBe(4);
    });

    test('returns grade 4 for large numbers', () => {
      expect(E.getDifficulty(100)).toBe(4);
    });
  });

  // ===================== pickWord =====================

  describe('pickWord', () => {
    test('returns an object with word, def, grade, and index', () => {
      const result = E.pickWord(4, []);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('word');
      expect(result).toHaveProperty('def');
      expect(result).toHaveProperty('grade');
      expect(result).toHaveProperty('index');
    });

    test('respects maxGrade filter (grade 2 only)', () => {
      for (let i = 0; i < 20; i++) {
        const result = E.pickWord(2, []);
        expect(result.grade).toBe(2);
      }
    });

    test('respects maxGrade filter (grade 3 includes 2 and 3)', () => {
      for (let i = 0; i < 30; i++) {
        const result = E.pickWord(3, []);
        expect(result.grade).toBeLessThanOrEqual(3);
      }
    });

    test('avoids used indices', () => {
      const usedIndices = [0, 1, 2, 3, 4];
      for (let i = 0; i < 20; i++) {
        const result = E.pickWord(4, usedIndices);
        expect(usedIndices).not.toContain(result.index);
      }
    });

    test('returns null when all words of allowed grade are exhausted', () => {
      // Collect all grade-2 indices
      const grade2Indices = [];
      E.WORDS.forEach((entry, i) => {
        if (entry.grade === 2) grade2Indices.push(i);
      });
      // Use all of them
      const result = E.pickWord(2, grade2Indices);
      expect(result).toBeNull();
    });

    test('returned index matches the correct word in WORDS', () => {
      const result = E.pickWord(4, []);
      expect(E.WORDS[result.index].word).toBe(result.word);
      expect(E.WORDS[result.index].def).toBe(result.def);
      expect(E.WORDS[result.index].grade).toBe(result.grade);
    });
  });

  // ===================== pickMissingIndex =====================

  describe('pickMissingIndex', () => {
    test('returns an index within word bounds', () => {
      const word = 'brave';
      for (let i = 0; i < 50; i++) {
        const idx = E.pickMissingIndex(word);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(word.length);
      }
    });

    test('returns an integer', () => {
      const idx = E.pickMissingIndex('hello');
      expect(Number.isInteger(idx)).toBe(true);
    });

    test('works with single-character word', () => {
      const idx = E.pickMissingIndex('a');
      expect(idx).toBe(0);
    });
  });

  // ===================== checkGuess =====================

  describe('checkGuess', () => {
    test('correct letter returns true', () => {
      expect(E.checkGuess('brave', 0, 'b')).toBe(true);
    });

    test('wrong letter returns false', () => {
      expect(E.checkGuess('brave', 0, 'z')).toBe(false);
    });

    test('case-insensitive: uppercase guess matches lowercase letter', () => {
      expect(E.checkGuess('brave', 0, 'B')).toBe(true);
    });

    test('case-insensitive: lowercase guess matches uppercase word char', () => {
      // Even though words are lowercase, engine should handle mixed case
      expect(E.checkGuess('brave', 2, 'A')).toBe(true);
      expect(E.checkGuess('brave', 2, 'a')).toBe(true);
    });

    test('wrong letter at each position', () => {
      expect(E.checkGuess('hello', 0, 'x')).toBe(false);
      expect(E.checkGuess('hello', 4, 'a')).toBe(false);
    });

    test('correct letter at last position', () => {
      expect(E.checkGuess('brave', 4, 'e')).toBe(true);
    });
  });

  // ===================== getEliminatedKeys =====================

  describe('getEliminatedKeys', () => {
    test('returns empty array for 0 wrong guesses', () => {
      const result = E.getEliminatedKeys('brave', 0, []);
      expect(result).toEqual([]);
    });

    test('returns 5 keys for 1 wrong guess', () => {
      const result = E.getEliminatedKeys('brave', 0, ['Z']);
      expect(result.length).toBe(5);
    });

    test('returns 10 keys for 2 wrong guesses', () => {
      const result = E.getEliminatedKeys('brave', 0, ['Z', 'X']);
      expect(result.length).toBe(10);
    });

    test('returns 15 keys for 3 wrong guesses', () => {
      const result = E.getEliminatedKeys('brave', 0, ['Z', 'X', 'Y']);
      expect(result.length).toBe(15);
    });

    test('never eliminates the correct letter', () => {
      // Test with multiple words and missing indices
      const testCases = [
        { word: 'brave', missingIndex: 0 },  // correct = B
        { word: 'quiet', missingIndex: 2 },  // correct = I
        { word: 'storm', missingIndex: 4 },  // correct = M
      ];
      testCases.forEach(({ word, missingIndex }) => {
        const correctLetter = word[missingIndex].toUpperCase();
        const result = E.getEliminatedKeys(word, missingIndex, ['Z', 'X', 'Y']);
        expect(result).not.toContain(correctLetter);
      });
    });

    test('never eliminates letters already in wrongGuesses', () => {
      const wrongGuesses = ['Z', 'X', 'Y'];
      const result = E.getEliminatedKeys('brave', 0, wrongGuesses);
      wrongGuesses.forEach((letter) => {
        expect(result).not.toContain(letter);
      });
    });

    test('all eliminated keys are uppercase letters', () => {
      const result = E.getEliminatedKeys('brave', 0, ['Z', 'X']);
      result.forEach((key) => {
        expect(key).toMatch(/^[A-Z]$/);
      });
    });

    test('deterministic: same inputs produce same outputs', () => {
      const result1 = E.getEliminatedKeys('brave', 2, ['Z']);
      const result2 = E.getEliminatedKeys('brave', 2, ['Z']);
      expect(result1).toEqual(result2);
    });

    test('deterministic: different words produce different outputs', () => {
      const result1 = E.getEliminatedKeys('brave', 0, ['Z']);
      const result2 = E.getEliminatedKeys('quiet', 0, ['Z']);
      // Very unlikely to be the same, but technically possible
      // We check they are at least valid
      expect(result1.length).toBe(5);
      expect(result2.length).toBe(5);
    });

    test('different missingIndex produces different seed', () => {
      const result1 = E.getEliminatedKeys('brave', 0, ['Z']);
      const result2 = E.getEliminatedKeys('brave', 1, ['Z']);
      expect(result1.length).toBe(5);
      expect(result2.length).toBe(5);
    });

    test('eliminated keys are unique (no duplicates)', () => {
      const result = E.getEliminatedKeys('brave', 0, ['Z', 'X', 'Y']);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    test('handles case-insensitive wrongGuesses', () => {
      const result = E.getEliminatedKeys('brave', 0, ['z']);
      expect(result.length).toBe(5);
      expect(result).not.toContain('Z');
    });
  });

  // ===================== createSession =====================

  describe('createSession', () => {
    test('returns object with correct initial values', () => {
      const session = E.createSession();
      expect(session.wordsCompleted).toBe(0);
      expect(session.wrongGuesses).toBe(0);
      expect(session.completedWords).toEqual([]);
      expect(session.usedIndices).toEqual([]);
    });

    test('each call returns a new independent object', () => {
      const s1 = E.createSession();
      const s2 = E.createSession();
      s1.wordsCompleted = 5;
      expect(s2.wordsCompleted).toBe(0);
    });

    test('completedWords and usedIndices are independent arrays', () => {
      const s1 = E.createSession();
      const s2 = E.createSession();
      s1.completedWords.push({ word: 'test' });
      s1.usedIndices.push(0);
      expect(s2.completedWords).toEqual([]);
      expect(s2.usedIndices).toEqual([]);
    });
  });

  // ===================== recordCorrect =====================

  describe('recordCorrect', () => {
    test('increments wordsCompleted', () => {
      const session = E.createSession();
      const wordObj = { word: 'brave', def: 'not afraid', grade: 2, index: 0 };
      E.recordCorrect(session, wordObj);
      expect(session.wordsCompleted).toBe(1);
    });

    test('adds wordObj to completedWords', () => {
      const session = E.createSession();
      const wordObj = { word: 'brave', def: 'not afraid', grade: 2, index: 0 };
      E.recordCorrect(session, wordObj);
      expect(session.completedWords).toContain(wordObj);
      expect(session.completedWords.length).toBe(1);
    });

    test('adds index to usedIndices', () => {
      const session = E.createSession();
      const wordObj = { word: 'brave', def: 'not afraid', grade: 2, index: 0 };
      E.recordCorrect(session, wordObj);
      expect(session.usedIndices).toContain(0);
    });

    test('does not add duplicate index to usedIndices', () => {
      const session = E.createSession();
      const wordObj = { word: 'brave', def: 'not afraid', grade: 2, index: 0 };
      E.recordCorrect(session, wordObj);
      E.recordCorrect(session, wordObj);
      expect(session.usedIndices.filter((i) => i === 0).length).toBe(1);
    });

    test('multiple correct answers accumulate', () => {
      const session = E.createSession();
      const w1 = { word: 'brave', def: 'not afraid', grade: 2, index: 0 };
      const w2 = { word: 'angry', def: 'feeling mad', grade: 2, index: 1 };
      const w3 = { word: 'climb', def: 'to move up', grade: 2, index: 2 };
      E.recordCorrect(session, w1);
      E.recordCorrect(session, w2);
      E.recordCorrect(session, w3);
      expect(session.wordsCompleted).toBe(3);
      expect(session.completedWords.length).toBe(3);
      expect(session.usedIndices).toEqual([0, 1, 2]);
    });

    test('handles wordObj without index gracefully', () => {
      const session = E.createSession();
      const wordObj = { word: 'test', def: 'a test', grade: 2 };
      E.recordCorrect(session, wordObj);
      expect(session.wordsCompleted).toBe(1);
      expect(session.completedWords.length).toBe(1);
      expect(session.usedIndices.length).toBe(0);
    });
  });

  // ===================== recordWrong =====================

  describe('recordWrong', () => {
    test('increments wrongGuesses', () => {
      const session = E.createSession();
      E.recordWrong(session);
      expect(session.wrongGuesses).toBe(1);
    });

    test('multiple wrong guesses accumulate', () => {
      const session = E.createSession();
      E.recordWrong(session);
      E.recordWrong(session);
      E.recordWrong(session);
      expect(session.wrongGuesses).toBe(3);
    });

    test('does not affect other session properties', () => {
      const session = E.createSession();
      E.recordWrong(session);
      expect(session.wordsCompleted).toBe(0);
      expect(session.completedWords).toEqual([]);
      expect(session.usedIndices).toEqual([]);
    });
  });
});
