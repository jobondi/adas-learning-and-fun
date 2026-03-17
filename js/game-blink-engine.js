/**
 * Fill In the Blink — Pure game engine (no DOM dependencies).
 * Exports: window.BlinkEngine
 *
 * All game logic lives here: word list, difficulty progression,
 * word selection, guess checking, keyboard management, and session
 * state. The UI layer consumes this engine and handles rendering.
 */
var BlinkEngine = (function () {
  'use strict';

  // ===================== Constants =====================

  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var ROUND_DURATION = 180; // seconds (3 minutes)

  var CORRECT_PAUSE = 3000;    // ms — pause clock during correct animation
  var WRONG_PAUSE = 3000;      // ms — wrong animation plays, clock keeps ticking
  var KEY_REMOVE_DELAY = 500;  // ms — delay before keys animate out

  // ===================== Word List =====================

  var WORDS = [
    // ---- Grade 2 (~70 words) ----
    { word: 'brave', def: 'not afraid of danger', grade: 2 },
    { word: 'angry', def: 'feeling mad or upset', grade: 2 },
    { word: 'climb', def: 'to move upward using hands and feet', grade: 2 },
    { word: 'quiet', def: 'making very little noise', grade: 2 },
    { word: 'shiny', def: 'bright and reflecting light', grade: 2 },
    { word: 'float', def: 'to rest on top of water', grade: 2 },
    { word: 'globe', def: 'a round model of the earth', grade: 2 },
    { word: 'proud', def: 'feeling good about what you did', grade: 2 },
    { word: 'storm', def: 'bad weather with wind and rain', grade: 2 },
    { word: 'trade', def: 'to give something and get something back', grade: 2 },
    { word: 'sneak', def: 'to move quietly so no one notices', grade: 2 },
    { word: 'growl', def: 'a low angry sound an animal makes', grade: 2 },
    { word: 'feast', def: 'a large meal for many people', grade: 2 },
    { word: 'chase', def: 'to run after someone or something', grade: 2 },
    { word: 'bloom', def: 'when a flower opens its petals', grade: 2 },
    { word: 'crisp', def: 'firm and crunchy when you bite it', grade: 2 },
    { word: 'drift', def: 'to move slowly without trying', grade: 2 },
    { word: 'fresh', def: 'new and not old or spoiled', grade: 2 },
    { word: 'grain', def: 'a tiny seed from wheat or rice', grade: 2 },
    { word: 'honey', def: 'sweet sticky food made by bees', grade: 2 },
    { word: 'jolly', def: 'happy and full of fun', grade: 2 },
    { word: 'knock', def: 'to hit a door with your hand', grade: 2 },
    { word: 'lucky', def: 'having good things happen by chance', grade: 2 },
    { word: 'minus', def: 'to take away one number from another', grade: 2 },
    { word: 'peace', def: 'a time with no fighting or war', grade: 2 },
    { word: 'rapid', def: 'moving or happening very fast', grade: 2 },
    { word: 'scarf', def: 'cloth worn around the neck for warmth', grade: 2 },
    { word: 'thumb', def: 'the short thick finger on your hand', grade: 2 },
    { word: 'upset', def: 'feeling sad or worried about something', grade: 2 },
    { word: 'value', def: 'how much something is worth', grade: 2 },
    { word: 'whale', def: 'a very large animal that lives in the ocean', grade: 2 },
    { word: 'youth', def: 'the time when you are young', grade: 2 },
    { word: 'zebra', def: 'a striped animal that looks like a horse', grade: 2 },
    { word: 'beach', def: 'sandy ground next to the ocean', grade: 2 },
    { word: 'cabin', def: 'a small wooden house in the woods', grade: 2 },
    { word: 'dance', def: 'to move your body to music', grade: 2 },
    { word: 'earth', def: 'the planet where we all live', grade: 2 },
    { word: 'flame', def: 'the hot bright part of a fire', grade: 2 },
    { word: 'giant', def: 'something much bigger than normal', grade: 2 },
    { word: 'heart', def: 'the part of your body that pumps blood', grade: 2 },
    { word: 'insect', def: 'a small bug with six legs', grade: 2 },
    { word: 'juice', def: 'liquid that comes from fruit', grade: 2 },
    { word: 'koala', def: 'a furry animal that lives in trees', grade: 2 },
    { word: 'lemon', def: 'a sour yellow fruit', grade: 2 },
    { word: 'moist', def: 'a little bit wet or damp', grade: 2 },
    { word: 'nurse', def: 'a person who helps sick people get better', grade: 2 },
    { word: 'ocean', def: 'a very large body of salt water', grade: 2 },
    { word: 'paste', def: 'a thick sticky mixture for gluing', grade: 2 },
    { word: 'ranch', def: 'a large farm with animals', grade: 2 },
    { word: 'silly', def: 'funny in a playful or goofy way', grade: 2 },
    { word: 'train', def: 'a line of cars that rides on tracks', grade: 2 },
    { word: 'uncle', def: 'your parent\'s brother', grade: 2 },
    { word: 'voice', def: 'the sound you make when you talk', grade: 2 },
    { word: 'weird', def: 'strange or very different from normal', grade: 2 },
    { word: 'alarm', def: 'a loud sound that warns of danger', grade: 2 },
    { word: 'brush', def: 'a tool with bristles for cleaning or painting', grade: 2 },
    { word: 'creek', def: 'a small stream of flowing water', grade: 2 },
    { word: 'empty', def: 'having nothing inside', grade: 2 },
    { word: 'flock', def: 'a group of birds together', grade: 2 },
    { word: 'grill', def: 'to cook food over a fire', grade: 2 },
    { word: 'hover', def: 'to stay in the air in one place', grade: 2 },
    { word: 'ledge', def: 'a narrow flat surface that sticks out', grade: 2 },
    { word: 'moose', def: 'a very large deer with big antlers', grade: 2 },
    { word: 'patch', def: 'a small piece used to cover a hole', grade: 2 },
    { word: 'spray', def: 'to send tiny drops of liquid through air', grade: 2 },
    { word: 'tower', def: 'a tall narrow building or structure', grade: 2 },
    { word: 'wagon', def: 'a cart with four wheels pulled along', grade: 2 },
    { word: 'crust', def: 'the hard outer layer of bread', grade: 2 },
    { word: 'shelf', def: 'a flat board for holding things on a wall', grade: 2 },
    { word: 'stump', def: 'the short part left after a tree is cut', grade: 2 },

    // ---- Grade 3 (~70 words) ----
    { word: 'ancient', def: 'very old, from long ago', grade: 3 },
    { word: 'balance', def: 'to keep steady without falling over', grade: 3 },
    { word: 'captain', def: 'the leader of a team or ship', grade: 3 },
    { word: 'destroy', def: 'to break something completely apart', grade: 3 },
    { word: 'explore', def: 'to travel to learn about new places', grade: 3 },
    { word: 'fragile', def: 'easy to break or damage', grade: 3 },
    { word: 'harvest', def: 'to gather crops when they are ready', grade: 3 },
    { word: 'imagine', def: 'to make a picture in your mind', grade: 3 },
    { word: 'journey', def: 'a long trip from one place to another', grade: 3 },
    { word: 'kingdom', def: 'a land ruled by a king or queen', grade: 3 },
    { word: 'lantern', def: 'a lamp you can carry with you', grade: 3 },
    { word: 'measure', def: 'to find the size or amount of something', grade: 3 },
    { word: 'natural', def: 'made by nature, not by people', grade: 3 },
    { word: 'observe', def: 'to watch something carefully', grade: 3 },
    { word: 'pattern', def: 'a design that repeats over and over', grade: 3 },
    { word: 'quicken', def: 'to make something go faster', grade: 3 },
    { word: 'require', def: 'to need something in order to succeed', grade: 3 },
    { word: 'scatter', def: 'to throw things in many directions', grade: 3 },
    { word: 'tremble', def: 'to shake because of fear or cold', grade: 3 },
    { word: 'unusual', def: 'not common or not seen very often', grade: 3 },
    { word: 'village', def: 'a small town in the countryside', grade: 3 },
    { word: 'whisper', def: 'to speak very softly and quietly', grade: 3 },
    { word: 'acquire', def: 'to get or gain something new', grade: 3 },
    { word: 'breathe', def: 'to take air in and out of your lungs', grade: 3 },
    { word: 'climate', def: 'the usual weather in a place over time', grade: 3 },
    { word: 'display', def: 'to show something for others to see', grade: 3 },
    { word: 'emotion', def: 'a strong feeling like joy or sadness', grade: 3 },
    { word: 'fiction', def: 'a story that is made up and not real', grade: 3 },
    { word: 'genuine', def: 'real and not fake or copied', grade: 3 },
    { word: 'horizon', def: 'the line where the sky meets the land', grade: 3 },
    { word: 'initial', def: 'happening at the very beginning', grade: 3 },
    { word: 'justice', def: 'fair treatment for all people', grade: 3 },
    { word: 'lecture', def: 'a talk given to teach a group', grade: 3 },
    { word: 'mineral', def: 'a natural solid found in the earth', grade: 3 },
    { word: 'nucleus', def: 'the center part of a cell or atom', grade: 3 },
    { word: 'opinion', def: 'what someone thinks about a topic', grade: 3 },
    { word: 'passage', def: 'a section of writing from a book', grade: 3 },
    { word: 'revolve', def: 'to spin or move in a circle', grade: 3 },
    { word: 'surface', def: 'the outside or top layer of something', grade: 3 },
    { word: 'trouble', def: 'a problem or difficult situation', grade: 3 },
    { word: 'uniform', def: 'special clothes worn by a group', grade: 3 },
    { word: 'volcano', def: 'a mountain that can erupt with hot lava', grade: 3 },
    { word: 'wander', def: 'to walk around without a clear goal', grade: 3 },
    { word: 'achieve', def: 'to finish something you worked hard on', grade: 3 },
    { word: 'burrow', def: 'a tunnel dug by an animal underground', grade: 3 },
    { word: 'connect', def: 'to join two things together', grade: 3 },
    { word: 'diagram', def: 'a drawing that explains how something works', grade: 3 },
    { word: 'exhibit', def: 'a display of objects for people to see', grade: 3 },
    { word: 'flutter', def: 'to move wings quickly up and down', grade: 3 },
    { word: 'glimpse', def: 'a quick short look at something', grade: 3 },
    { word: 'habitat', def: 'the place where an animal naturally lives', grade: 3 },
    { word: 'inspect', def: 'to look at something very closely', grade: 3 },
    { word: 'journal', def: 'a book for writing your thoughts each day', grade: 3 },
    { word: 'kitchen', def: 'the room where food is cooked', grade: 3 },
    { word: 'machine', def: 'a device built to do a job', grade: 3 },
    { word: 'nectar', def: 'sweet liquid flowers make for bees', grade: 3 },
    { word: 'outline', def: 'a drawing showing only the outer edge', grade: 3 },
    { word: 'predict', def: 'to say what you think will happen next', grade: 3 },
    { word: 'release', def: 'to let something go free', grade: 3 },
    { word: 'shelter', def: 'a place that protects you from weather', grade: 3 },
    { word: 'theater', def: 'a building where plays or movies are shown', grade: 3 },
    { word: 'vibrate', def: 'to shake back and forth very fast', grade: 3 },
    { word: 'wrinkle', def: 'a small fold or crease in something', grade: 3 },
    { word: 'century', def: 'a period of one hundred years', grade: 3 },
    { word: 'dolphin', def: 'a smart ocean animal that breathes air', grade: 3 },
    { word: 'fertile', def: 'good for growing plants and crops', grade: 3 },
    { word: 'migrate', def: 'to move to a new place each season', grade: 3 },
    { word: 'popular', def: 'liked or enjoyed by many people', grade: 3 },
    { word: 'compete', def: 'to try to win against someone else', grade: 3 },
    { word: 'costume', def: 'special clothes worn to look like someone else', grade: 3 },

    // ---- Grade 4 (~60 words) ----
    { word: 'abandon', def: 'to leave behind and not return', grade: 4 },
    { word: 'boundary', def: 'a line that marks the edge of an area', grade: 4 },
    { word: 'collapse', def: 'to fall down or break apart suddenly', grade: 4 },
    { word: 'distinct', def: 'clearly different from other things', grade: 4 },
    { word: 'enormous', def: 'extremely large in size', grade: 4 },
    { word: 'flexible', def: 'able to bend easily without breaking', grade: 4 },
    { word: 'generous', def: 'willing to give and share with others', grade: 4 },
    { word: 'hesitate', def: 'to pause before doing something', grade: 4 },
    { word: 'identify', def: 'to figure out what something is', grade: 4 },
    { word: 'juvenile', def: 'young and not fully grown up yet', grade: 4 },
    { word: 'navigate', def: 'to find your way from place to place', grade: 4 },
    { word: 'obstacle', def: 'something that blocks your path', grade: 4 },
    { word: 'preserve', def: 'to keep something safe from harm', grade: 4 },
    { word: 'quantity', def: 'the amount or number of something', grade: 4 },
    { word: 'reliable', def: 'can be trusted to work or help', grade: 4 },
    { word: 'sequence', def: 'things arranged in a specific order', grade: 4 },
    { word: 'treasure', def: 'valuable items like gold or jewels', grade: 4 },
    { word: 'accurate', def: 'correct and free from mistakes', grade: 4 },
    { word: 'bacteria', def: 'tiny living things too small to see', grade: 4 },
    { word: 'conclude', def: 'to finish or come to an end', grade: 4 },
    { word: 'document', def: 'a paper with important information on it', grade: 4 },
    { word: 'estimate', def: 'to make a close guess about a number', grade: 4 },
    { word: 'function', def: 'the purpose or job of something', grade: 4 },
    { word: 'guardian', def: 'a person who protects and cares for another', grade: 4 },
    { word: 'moderate', def: 'not too much and not too little', grade: 4 },
    { word: 'portrait', def: 'a painting or photo of a person', grade: 4 },
    { word: 'opposite', def: 'as different as possible from something', grade: 4 },
    { word: 'reaction', def: 'what you do in response to something', grade: 4 },
    { word: 'solution', def: 'the answer to a problem or puzzle', grade: 4 },
    { word: 'transfer', def: 'to move something from one place to another', grade: 4 },
    { word: 'apparent', def: 'easy to see or understand clearly', grade: 4 },
    { word: 'ceremony', def: 'a formal event for a special occasion', grade: 4 },
    { word: 'dramatic', def: 'exciting and full of strong feeling', grade: 4 },
    { word: 'evaluate', def: 'to judge how good or useful something is', grade: 4 },
    { word: 'fraction', def: 'a part of a whole number like one half', grade: 4 },
    { word: 'ignorant', def: 'not knowing about something important', grade: 4 },
    { word: 'majority', def: 'more than half of a group', grade: 4 },
    { word: 'numerous', def: 'a very large number of things', grade: 4 },
    { word: 'organize', def: 'to put things in a neat and useful order', grade: 4 },
    { word: 'peculiar', def: 'strange or odd in an unusual way', grade: 4 },
    { word: 'resource', def: 'something useful that you can use', grade: 4 },
    { word: 'stampede', def: 'a group of animals running wildly together', grade: 4 },
    { word: 'thorough', def: 'done carefully without missing anything', grade: 4 },
    { word: 'vehicle', def: 'a machine used to carry people or things', grade: 4 },
    { word: 'ancestor', def: 'a family member who lived long ago', grade: 4 },
    { word: 'convince', def: 'to make someone agree with your idea', grade: 4 },
    { word: 'diameter', def: 'the distance straight across a circle', grade: 4 },
    { word: 'exchange', def: 'to give one thing and receive another', grade: 4 },
    { word: 'grateful', def: 'feeling thankful for something nice', grade: 4 },
    { word: 'increase', def: 'to make something larger or greater', grade: 4 },
    { word: 'language', def: 'the words people use to communicate', grade: 4 },
    { word: 'moisture', def: 'tiny drops of water in the air or soil', grade: 4 },
    { word: 'particle', def: 'a very tiny piece of something', grade: 4 },
    { word: 'sentence', def: 'a group of words that states a complete idea', grade: 4 },
    { word: 'ultimate', def: 'the last or most important of all', grade: 4 },
    { word: 'chemical', def: 'a substance made by or used in chemistry', grade: 4 },
    { word: 'evidence', def: 'facts that help prove something is true', grade: 4 },
    { word: 'infinite', def: 'going on forever without any end', grade: 4 },
    { word: 'multiply', def: 'to add a number to itself many times', grade: 4 },
    { word: 'question', def: 'something you ask to get an answer', grade: 4 },
  ];

  // ===================== Difficulty Progression =====================

  var DIFFICULTY_THRESHOLDS = [
    { after: 0, grade: 2 },
    { after: 8, grade: 3 },
    { after: 18, grade: 4 },
  ];

  /**
   * Return the max word grade the player should see,
   * based on how many words they have completed so far.
   */
  function getDifficulty(wordsCompleted) {
    var maxGrade = DIFFICULTY_THRESHOLDS[0].grade;
    for (var i = 0; i < DIFFICULTY_THRESHOLDS.length; i++) {
      if (wordsCompleted >= DIFFICULTY_THRESHOLDS[i].after) {
        maxGrade = DIFFICULTY_THRESHOLDS[i].grade;
      }
    }
    return maxGrade;
  }

  // ===================== Word Selection =====================

  /**
   * Pick a random word at or below the given grade, avoiding already-used indices.
   * Returns { word, def, grade, index } or null if no words remain.
   */
  function pickWord(maxGrade, usedIndices) {
    var candidates = [];
    for (var i = 0; i < WORDS.length; i++) {
      if (WORDS[i].grade <= maxGrade && usedIndices.indexOf(i) === -1) {
        candidates.push(i);
      }
    }
    if (candidates.length === 0) return null;

    var idx = candidates[Math.floor(Math.random() * candidates.length)];
    var entry = WORDS[idx];
    return { word: entry.word, def: entry.def, grade: entry.grade, index: idx };
  }

  /**
   * Pick a random character index in the word to blank out.
   * Returns an integer in [0, word.length - 1].
   */
  function pickMissingIndex(word) {
    return Math.floor(Math.random() * word.length);
  }

  // ===================== Guess Checking =====================

  /**
   * Check if the guessed letter matches the missing character (case-insensitive).
   */
  function checkGuess(word, missingIndex, guessedLetter) {
    return word[missingIndex].toLowerCase() === guessedLetter.toLowerCase();
  }

  // ===================== Keyboard Management =====================

  /**
   * Given the correct word, the missing index, and an array of wrong guesses,
   * return an array of uppercase letters that should be eliminated from the keyboard.
   *
   * After 1 wrong guess: remove 5 random incorrect letters.
   * After 2 wrong guesses: remove 5 more (10 total).
   * After 3 wrong guesses: remove 5 more (15 total).
   *
   * Removal is deterministic: uses the word + missingIndex to seed a
   * consistent shuffle so the same call always returns the same set.
   */
  function getEliminatedKeys(word, missingIndex, wrongGuesses) {
    var correctLetter = word[missingIndex].toUpperCase();
    var wrongSet = {};
    for (var i = 0; i < wrongGuesses.length; i++) {
      wrongSet[wrongGuesses[i].toUpperCase()] = true;
    }

    // Build pool of removable letters: not the correct letter, not already guessed wrong
    var removable = [];
    for (var i = 0; i < ALPHABET.length; i++) {
      var ch = ALPHABET[i];
      if (ch !== correctLetter && !wrongSet[ch]) {
        removable.push(ch);
      }
    }

    // Deterministic shuffle seeded by word + missingIndex
    var seed = 0;
    for (var i = 0; i < word.length; i++) {
      seed = ((seed * 31) + word.charCodeAt(i)) | 0;
    }
    seed = ((seed * 31) + missingIndex) | 0;

    // Simple seeded pseudo-random shuffle (LCG-based)
    function nextSeed(s) {
      return ((s * 1103515245 + 12345) & 0x7fffffff);
    }
    var s = Math.abs(seed);
    for (var i = removable.length - 1; i > 0; i--) {
      s = nextSeed(s);
      var j = s % (i + 1);
      var tmp = removable[i];
      removable[i] = removable[j];
      removable[j] = tmp;
    }

    // Number of keys to remove based on wrong guess count
    var wrongCount = wrongGuesses.length;
    var removeCount = Math.min(wrongCount * 5, removable.length);

    return removable.slice(0, removeCount);
  }

  // ===================== Session State =====================

  /** Create a fresh session object. */
  function createSession() {
    return {
      wordsCompleted: 0,
      wrongGuesses: 0,
      completedWords: [],
      usedIndices: [],
    };
  }

  /** Record a correct answer. Mutates session in place. */
  function recordCorrect(session, wordObj) {
    session.wordsCompleted++;
    session.completedWords.push(wordObj);
    if (wordObj.index !== undefined && session.usedIndices.indexOf(wordObj.index) === -1) {
      session.usedIndices.push(wordObj.index);
    }
  }

  /** Record a wrong guess. Mutates session in place. */
  function recordWrong(session) {
    session.wrongGuesses++;
  }

  // ===================== Public API =====================

  return {
    // Constants
    ALPHABET: ALPHABET,
    ROUND_DURATION: ROUND_DURATION,
    CORRECT_PAUSE: CORRECT_PAUSE,
    WRONG_PAUSE: WRONG_PAUSE,
    KEY_REMOVE_DELAY: KEY_REMOVE_DELAY,
    DIFFICULTY_THRESHOLDS: DIFFICULTY_THRESHOLDS,
    WORDS: WORDS,

    // Functions
    getDifficulty: getDifficulty,
    pickWord: pickWord,
    pickMissingIndex: pickMissingIndex,
    checkGuess: checkGuess,
    getEliminatedKeys: getEliminatedKeys,
    createSession: createSession,
    recordCorrect: recordCorrect,
    recordWrong: recordWrong,
  };
})();

// Support Node.js require for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlinkEngine;
}
