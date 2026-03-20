/**
 * Fill In the Blink — UI controller.
 * Depends on BlinkEngine (window.BlinkEngine) for all game logic.
 * Handles DOM rendering, animations, QWERTY keyboard, timer, and user input.
 */
var FillInTheBlink = (function () {
  'use strict';

  var E; // BlinkEngine reference, set in init()

  // ===================== Config =====================

  var TOTAL_TIME = 180; // 3 minutes in seconds
  var CORRECT_ADVANCE = 1500; // ms before advancing to next word after correct
  var WRONG_DISPLAY = 1500; // ms to show wrong answer feedback
  var KEY_ELIMINATE_DELAY = 500; // ms before keys fly away after wrong
  var CELEBRATION_ANIMATIONS = ['sparkle', 'confetti', 'emoji-burst'];
  var QWERTY_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // ===================== State =====================

  var session;
  var currentWord;
  var missingIndex;
  var missingLetter;
  var wrongGuessLetters; // letters guessed wrong for the CURRENT word
  var score;
  var totalWrong;
  var completedWords;
  var timeRemaining;
  var timerRunning;
  var timerPaused;
  var lastTimestamp;
  var animating;
  var rafId;
  var audioCtx;
  var blinkIntervalId;

  // ===================== DOM Refs =====================

  var elScreen, elTopbar, elScore, elTimerBar, elTimerFill, elTimerText;
  var elWordArea, elWordDisplay, elDefinition;
  var elKeyboard, elOverlay;
  var elOverlayTitle, elOverlayScore, elOverlayWrong, elOverlayWords, elPlayAgain;
  var elCelebration;
  var keyButtons; // map of letter -> button element

  // ===================== DOM Building =====================

  function buildGameDOM() {
    var inner = elScreen.querySelector('.screen-inner');
    if (!inner) return;

    // Clear placeholder content (keep topbar)
    var topbar = inner.querySelector('.game-topbar');
    inner.innerHTML = '';
    inner.classList.add('game-screen-inner');

    // Back button (top-left)
    var backBtn = document.createElement('button');
    backBtn.className = 'btn-back blink-back-btn';
    backBtn.id = 'btn-back-blink';
    backBtn.textContent = '\u2190';
    inner.appendChild(backBtn);

    // Title — centered
    var title = document.createElement('h2');
    title.className = 'blink-title';
    title.textContent = 'Fill In the Blink';
    inner.appendChild(title);

    // Score — centered under title
    elScore = document.createElement('div');
    elScore.className = 'blink-score';
    elScore.textContent = 'Score: 0';
    inner.appendChild(elScore);

    // Timer bar — under score
    elTimerBar = document.createElement('div');
    elTimerBar.className = 'blink-timer-bar';

    elTimerFill = document.createElement('div');
    elTimerFill.className = 'blink-timer-fill';

    elTimerText = document.createElement('span');
    elTimerText.className = 'blink-timer-text';
    elTimerText.textContent = '3:00';

    elTimerBar.appendChild(elTimerFill);
    elTimerBar.appendChild(elTimerText);
    inner.appendChild(elTimerBar);

    // Back button navigates to hub using the shared navigation function
    backBtn.addEventListener('click', function () {
      stopTimer();
      stopBlinkInterval();
      if (window.adaNavigateTo) {
        window.adaNavigateTo('hub');
      }
    });

    // Word display area
    elWordArea = document.createElement('div');
    elWordArea.className = 'blink-word-area';

    elWordDisplay = document.createElement('div');
    elWordDisplay.className = 'blink-word-display';

    elDefinition = document.createElement('div');
    elDefinition.className = 'blink-definition';

    elCelebration = document.createElement('div');
    elCelebration.className = 'blink-celebration';

    elWordArea.appendChild(elCelebration);
    elWordArea.appendChild(elWordDisplay);
    elWordArea.appendChild(elDefinition);
    inner.appendChild(elWordArea);

    // QWERTY keyboard
    elKeyboard = document.createElement('div');
    elKeyboard.className = 'blink-keyboard';
    buildKeyboard();
    inner.appendChild(elKeyboard);

    // End-of-session overlay
    elOverlay = document.createElement('div');
    elOverlay.className = 'blink-overlay hidden';

    var overlayContent = document.createElement('div');
    overlayContent.className = 'blink-overlay-content';

    elOverlayTitle = document.createElement('div');
    elOverlayTitle.className = 'blink-overlay-title';

    elOverlayScore = document.createElement('div');
    elOverlayScore.className = 'blink-overlay-score';

    elOverlayWrong = document.createElement('div');
    elOverlayWrong.className = 'blink-overlay-wrong';

    elOverlayWords = document.createElement('div');
    elOverlayWords.className = 'blink-overlay-words';

    elPlayAgain = document.createElement('button');
    elPlayAgain.className = 'btn-kawaii btn-primary';
    elPlayAgain.innerHTML = '<span>Play Again!</span>';
    elPlayAgain.addEventListener('click', function () {
      startGame();
    });

    overlayContent.appendChild(elOverlayTitle);
    overlayContent.appendChild(elOverlayScore);
    overlayContent.appendChild(elOverlayWrong);
    overlayContent.appendChild(elOverlayWords);
    overlayContent.appendChild(elPlayAgain);
    elOverlay.appendChild(overlayContent);
    inner.appendChild(elOverlay);
  }

  function buildKeyboard() {
    elKeyboard.innerHTML = '';
    keyButtons = {};

    for (var r = 0; r < QWERTY_ROWS.length; r++) {
      var row = document.createElement('div');
      row.className = 'blink-key-row';

      for (var k = 0; k < QWERTY_ROWS[r].length; k++) {
        var letter = QWERTY_ROWS[r][k];
        var btn = document.createElement('button');
        btn.className = 'blink-key';
        btn.textContent = letter;
        btn.setAttribute('data-letter', letter);
        btn.addEventListener('click', (function (l) {
          return function () { handleGuess(l); };
        })(letter));
        keyButtons[letter] = btn;
        row.appendChild(btn);
      }

      elKeyboard.appendChild(row);
    }
  }

  // ===================== Eye Blink (JS-driven) =====================

  function startBlinkInterval() {
    stopBlinkInterval();
    blinkIntervalId = setInterval(function () {
      var eye = document.querySelector('.blink-slot-eye');
      if (!eye) return;
      // Open the eye
      eye.textContent = '\uD83D\uDC41\uFE0F'; // 👁️
      setTimeout(function () {
        // Close it back to a dash
        if (eye.parentNode) eye.textContent = '\u2014'; // —
      }, 400);
    }, 2500);
  }

  function stopBlinkInterval() {
    if (blinkIntervalId) {
      clearInterval(blinkIntervalId);
      blinkIntervalId = null;
    }
  }

  // ===================== Rendering =====================

  function renderWord() {
    if (!currentWord) return;

    elWordDisplay.innerHTML = '';
    var letters = currentWord.word.toUpperCase().split('');

    for (var i = 0; i < letters.length; i++) {
      var span = document.createElement('span');
      span.className = 'blink-letter';

      if (i === missingIndex) {
        span.className += ' blink-slot';
        span.id = 'blink-missing-slot';
        // Single blinking eye — starts closed (dash), JS interval opens it
        var eye = document.createElement('span');
        eye.className = 'blink-slot-eye';
        eye.textContent = '\u2014'; // — (closed state)
        span.appendChild(eye);
      } else {
        span.textContent = letters[i];
      }

      elWordDisplay.appendChild(span);
    }

    elDefinition.textContent = currentWord.def || '';
  }

  function renderScore() {
    elScore.textContent = 'Score: ' + score;
  }

  function renderTimer() {
    var minutes = Math.floor(timeRemaining / 60);
    var seconds = Math.floor(timeRemaining % 60);
    var display = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    elTimerText.textContent = display;

    var pct = (timeRemaining / TOTAL_TIME) * 100;
    elTimerFill.style.width = pct + '%';

    // Color transitions as time runs low
    if (timeRemaining <= 30) {
      elTimerFill.style.background = 'linear-gradient(90deg, #FF6B6B, #EE5A24)';
    } else if (timeRemaining <= 60) {
      elTimerFill.style.background = 'linear-gradient(90deg, #FFE066, #FFA502)';
    } else {
      elTimerFill.style.background = '';
    }
  }

  function resetKeyboard() {
    for (var letter in keyButtons) {
      if (keyButtons.hasOwnProperty(letter)) {
        var btn = keyButtons[letter];
        btn.classList.remove('blink-key-eliminated', 'blink-key-fly-away');
        btn.disabled = false;
        btn.style.display = '';
        btn.style.transform = '';
        btn.style.opacity = '';
      }
    }
  }

  // ===================== Timer =====================

  function startTimer() {
    timerRunning = true;
    timerPaused = false;
    lastTimestamp = performance.now();
    tickTimer();
  }

  function stopTimer() {
    timerRunning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function pauseTimer() {
    timerPaused = true;
  }

  function resumeTimer() {
    timerPaused = false;
    lastTimestamp = performance.now();
  }

  function tickTimer() {
    if (!timerRunning) return;

    rafId = requestAnimationFrame(function (now) {
      if (!timerRunning) return;

      if (!timerPaused) {
        var delta = (now - lastTimestamp) / 1000;
        lastTimestamp = now;
        timeRemaining = Math.max(0, timeRemaining - delta);
        renderTimer();

        if (timeRemaining <= 0) {
          timerRunning = false;
          showEndOverlay();
          return;
        }
      } else {
        lastTimestamp = now;
      }

      tickTimer();
    });
  }

  // ===================== Audio =====================

  function getAudioContext() {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        audioCtx = new Ctx();
      }
    }
    return audioCtx;
  }

  function playTone(frequency, duration, type) {
    var ctx = getAudioContext();
    if (!ctx) return;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  }

  function playCorrectSound() {
    // Ascending two-note chime: C5 (523Hz) -> E5 (659Hz)
    playTone(523, 200, 'sine');
    setTimeout(function () {
      playTone(659, 200, 'sine');
    }, 200);
  }

  function playWrongSound() {
    // Descending low buzz
    playTone(180, 300, 'sawtooth');
  }

  // ===================== Animations =====================

  function triggerCelebration() {
    var type = CELEBRATION_ANIMATIONS[Math.floor(Math.random() * CELEBRATION_ANIMATIONS.length)];
    elCelebration.innerHTML = '';
    elCelebration.className = 'blink-celebration';

    if (type === 'sparkle') {
      createSparkles();
    } else if (type === 'confetti') {
      createConfetti();
    } else if (type === 'emoji-burst') {
      createEmojiBurst();
    }
  }

  /** Compute x/y endpoints from angle + distance (avoids CSS trig dependency) */
  function setFlyTarget(el, angleDeg, dist, extraY) {
    var rad = angleDeg * Math.PI / 180;
    var tx = Math.cos(rad) * dist;
    var ty = Math.sin(rad) * dist + (extraY || 0);
    el.style.setProperty('--tx', Math.round(tx) + 'px');
    el.style.setProperty('--ty', Math.round(ty) + 'px');
  }

  function createSparkles() {
    for (var i = 0; i < 12; i++) {
      var spark = document.createElement('span');
      spark.className = 'blink-sparkle';
      spark.textContent = '\u2728';
      var angle = Math.random() * 360;
      var dist = 40 + Math.random() * 60;
      setFlyTarget(spark, angle, dist);
      spark.style.animationDelay = (Math.random() * 0.3) + 's';
      elCelebration.appendChild(spark);
    }
  }

  function createConfetti() {
    var colors = ['#FF69B4', '#FFD700', '#87CEEB', '#98FB98', '#DDA0DD', '#FFA07A'];
    for (var i = 0; i < 20; i++) {
      var piece = document.createElement('span');
      piece.className = 'blink-confetti';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      var angle = Math.random() * 360;
      var dist = 50 + Math.random() * 80;
      setFlyTarget(piece, angle, dist, 30);
      piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      piece.style.animationDelay = (Math.random() * 0.2) + 's';
      elCelebration.appendChild(piece);
    }
  }

  function createEmojiBurst() {
    var emojis = ['\uD83D\uDC4D', '\uD83D\uDE0A', '\uD83D\uDC4D', '\uD83D\uDE0A',
                  '\uD83D\uDC4D', '\uD83D\uDE0A', '\u2B50', '\uD83C\uDF1F'];
    for (var i = 0; i < 8; i++) {
      var em = document.createElement('span');
      em.className = 'blink-emoji-burst';
      em.textContent = emojis[i % emojis.length];
      var angle = Math.random() * 360;
      var dist = 40 + Math.random() * 70;
      setFlyTarget(em, angle, dist, -20);
      em.style.animationDelay = (Math.random() * 0.3) + 's';
      elCelebration.appendChild(em);
    }
  }

  function animateScoreBounce() {
    elScore.classList.remove('blink-score-bounce');
    // Force reflow
    void elScore.offsetWidth;
    elScore.classList.add('blink-score-bounce');
  }

  function floatTimerBonus(amount) {
    var isPositive = amount > 0;
    var label = isPositive ? ('+' + amount) : String(amount);

    var el = document.createElement('div');
    el.className = 'blink-timer-bonus ' + (isPositive ? 'blink-bonus-positive' : 'blink-bonus-negative');
    el.textContent = label;

    // Position it over the word area
    var wordRect = elWordDisplay.getBoundingClientRect();
    var timerRect = elTimerBar.getBoundingClientRect();
    var parentRect = elWordDisplay.closest('.screen-inner').getBoundingClientRect();

    el.style.left = (wordRect.left - parentRect.left + wordRect.width / 2) + 'px';
    el.style.top = (wordRect.top - parentRect.top) + 'px';

    // Calculate how far to fly up to reach the timer
    var dy = timerRect.top - wordRect.top;
    el.style.setProperty('--fly-y', dy + 'px');

    elWordDisplay.closest('.screen-inner').appendChild(el);

    // Adjust time
    timeRemaining = Math.max(0, Math.min(timeRemaining + amount, TOTAL_TIME));
    renderTimer();

    // Clean up after animation
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1600);
  }

  function showCorrectSlot() {
    var slot = document.getElementById('blink-missing-slot');
    if (slot) {
      slot.innerHTML = '';
      slot.textContent = missingLetter;
      slot.classList.remove('blink-slot');
      slot.classList.add('blink-letter-correct');
    }
  }

  function showWrongSlot() {
    var slot = document.getElementById('blink-missing-slot');
    if (slot) {
      slot.innerHTML = '';
      slot.textContent = '\u274C'; // ❌
      slot.classList.add('blink-slot-shake');
    }
  }

  function clearWrongSlot() {
    var slot = document.getElementById('blink-missing-slot');
    if (slot) {
      // Restore closed eye (dash) structure
      slot.innerHTML = '';
      slot.classList.remove('blink-slot-shake');
      var eye = document.createElement('span');
      eye.className = 'blink-slot-eye';
      eye.textContent = '\u2014'; // — (closed state)
      slot.appendChild(eye);
    }
  }

  function eliminateKeys(keysToRemove) {
    for (var i = 0; i < keysToRemove.length; i++) {
      var letter = keysToRemove[i].toUpperCase();
      var btn = keyButtons[letter];
      if (btn && !btn.classList.contains('blink-key-eliminated')) {
        (function (b) {
          // Randomize fly direction
          var tx = (Math.random() * 200 - 100) + 'px';
          var ty = (Math.random() * -150 - 50) + 'px';
          b.style.setProperty('--fly-x', tx);
          b.style.setProperty('--fly-y', ty);
          b.classList.add('blink-key-fly-away');
          b.disabled = true;
          setTimeout(function () {
            b.classList.add('blink-key-eliminated');
          }, 500);
        })(btn);
      }
    }
  }

  // ===================== Game Logic =====================

  function handleGuess(letter) {
    if (animating || !timerRunning || !currentWord) return;

    var correct = letter.toUpperCase() === missingLetter;

    if (correct) {
      onCorrectGuess();
    } else {
      onWrongGuess(letter);
    }
  }

  function onCorrectGuess() {
    animating = true;

    // Visual feedback — timer keeps running
    showCorrectSlot();
    triggerCelebration();
    playCorrectSound();
    floatTimerBonus(5);

    // Haptic
    if (navigator.vibrate) navigator.vibrate(100);

    // Update score
    score++;
    completedWords.push({
      word: currentWord.word,
      def: currentWord.def
    });
    renderScore();
    animateScoreBounce();

    // Record in engine session
    E.recordCorrect(session, currentWord);

    // Advance after animation completes
    setTimeout(function () {
      animating = false;
      elCelebration.innerHTML = '';
      loadNextWord();
    }, CORRECT_ADVANCE);
  }

  function onWrongGuess(letter) {
    animating = true;
    wrongGuessLetters.push(letter.toUpperCase());
    totalWrong++;

    // Visual feedback — timer keeps running
    showWrongSlot();
    playWrongSound();
    floatTimerBonus(-3);

    // Haptic
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

    // Disable the guessed key
    var btn = keyButtons[letter.toUpperCase()];
    if (btn) {
      btn.disabled = true;
    }

    // Record in engine session
    E.recordWrong(session);

    // Check if keys should be eliminated (after threshold)
    var currentWrongLetters = wrongGuessLetters.slice(); // snapshot
    setTimeout(function () {
      var toRemove = E.getEliminatedKeys(
        currentWord.word,
        missingIndex,
        currentWrongLetters
      );
      if (toRemove && toRemove.length > 0) {
        eliminateKeys(toRemove);
      }
    }, KEY_ELIMINATE_DELAY);

    // Clear wrong display and unlock
    setTimeout(function () {
      clearWrongSlot();
      animating = false;
    }, WRONG_DISPLAY);
  }

  function loadNextWord() {
    if (!session) return;

    var maxGrade = E.getDifficulty(session.wordsCompleted);
    var next = E.pickWord(maxGrade, session.usedIndices);
    if (!next) {
      showEndOverlay();
      return;
    }

    currentWord = next;
    missingIndex = E.pickMissingIndex(next.word);
    missingLetter = next.word[missingIndex].toUpperCase();
    wrongGuessLetters = [];

    resetKeyboard();
    renderWord();
    startBlinkInterval();
  }

  // ===================== End-of-Session =====================

  function showEndOverlay() {
    stopTimer();
    stopBlinkInterval();
    animating = true;

    elOverlayTitle.innerHTML = '\u23F0 Time\'s Up! \uD83C\uDF89';
    elOverlayScore.textContent = 'You got ' + score + ' word' + (score !== 1 ? 's' : '') + '!';
    elOverlayWrong.textContent = totalWrong + ' wrong guess' + (totalWrong !== 1 ? 'es' : '');

    // Build completed words list
    elOverlayWords.innerHTML = '';
    if (completedWords.length > 0) {
      var list = document.createElement('div');
      list.className = 'blink-word-list';

      for (var i = 0; i < completedWords.length; i++) {
        var entry = document.createElement('div');
        entry.className = 'blink-word-entry';

        var wordEl = document.createElement('strong');
        wordEl.textContent = completedWords[i].word;

        var defEl = document.createElement('span');
        defEl.textContent = ' \u2014 ' + (completedWords[i].def || '');

        entry.appendChild(wordEl);
        entry.appendChild(defEl);
        list.appendChild(entry);
      }

      elOverlayWords.appendChild(list);
    }

    elOverlay.classList.remove('hidden');
  }

  // ===================== Init & Start =====================

  function startGame() {
    session = E.createSession();

    score = 0;
    totalWrong = 0;
    completedWords = [];
    wrongGuessLetters = [];
    timeRemaining = TOTAL_TIME;
    animating = false;

    elOverlay.classList.add('hidden');
    elCelebration.innerHTML = '';

    renderScore();
    renderTimer();
    resetKeyboard();
    loadNextWord();
    startTimer();
  }

  function init() {
    E = window.BlinkEngine;
    elScreen = document.getElementById('screen-blink');
    if (!elScreen || !E) return;

    buildGameDOM();
    injectStyles();
  }

  // ===================== Inline CSS =====================

  function injectStyles() {
    if (document.getElementById('blink-game-styles')) return;

    var style = document.createElement('style');
    style.id = 'blink-game-styles';
    style.textContent = [
      /* Back button */
      '.blink-back-btn {',
      '  align-self: flex-start;',
      '  margin-bottom: 2px;',
      '}',

      /* Title */
      '.blink-title {',
      '  font-size: 30px;',
      '  font-weight: 900;',
      '  color: var(--text);',
      '  text-align: center;',
      '  margin: 0;',
      '}',

      /* Score centered */
      '.blink-score {',
      '  font-size: 26px;',
      '  font-weight: 900;',
      '  color: var(--pink-dark);',
      '  text-align: center;',
      '  margin-top: 10px;',
      '}',
      '.blink-score-bounce {',
      '  animation: blink-score-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);',
      '}',
      '@keyframes blink-score-pop {',
      '  0% { transform: scale(1); }',
      '  50% { transform: scale(1.4); }',
      '  100% { transform: scale(1); }',
      '}',

      /* Timer bar */
      '.blink-timer-bar {',
      '  width: 100%;',
      '  max-width: 400px;',
      '  height: 34px;',
      '  background: var(--white);',
      '  border-radius: 17px;',
      '  border: 3px solid var(--mint);',
      '  position: relative;',
      '  overflow: hidden;',
      '  box-shadow: 0 3px 8px var(--shadow);',
      '}',
      '.blink-timer-fill {',
      '  height: 100%;',
      '  width: 100%;',
      '  background: linear-gradient(90deg, var(--mint), var(--sky));',
      '  border-radius: 11px;',
      '  transition: width 0.1s linear;',
      '}',
      '.blink-timer-text {',
      '  position: absolute;',
      '  inset: 0;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: 22px;',
      '  font-weight: 900;',
      '  color: var(--text);',
      '  text-shadow: 0 1px 2px rgba(255,255,255,0.8);',
      '}',

      /* Word area */
      '.blink-word-area {',
      '  flex: 1;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 100%;',
      '  max-width: 400px;',
      '  position: relative;',
      '  min-height: 140px;',
      '  padding: 16px 0;',
      '}',
      '.blink-word-display {',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: center;',
      '  gap: 6px;',
      '  flex-wrap: wrap;',
      '  margin-bottom: 12px;',
      '}',
      '.blink-letter {',
      '  font-size: 52px;',
      '  font-weight: 900;',
      '  color: var(--text);',
      '  letter-spacing: 4px;',
      '  text-transform: uppercase;',
      '}',
      '.blink-slot {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  min-width: 40px;',
      '  text-align: center;',
      '}',
      '.blink-slot-eye {',
      '  font-size: 48px;',
      '  display: block;',
      '  line-height: 1;',
      '}',
      '.blink-letter-correct {',
      '  color: #2E9E6B;',
      '  text-shadow: 0 2px 6px rgba(46,158,107,0.4);',
      '  animation: blink-correct-pop 0.5s cubic-bezier(0.34,1.56,0.64,1);',
      '}',
      '@keyframes blink-correct-pop {',
      '  0% { transform: scale(0.5); }',
      '  60% { transform: scale(1.3); }',
      '  100% { transform: scale(1); }',
      '}',
      '.blink-slot-shake {',
      '  animation: blink-shake 0.5s ease-in-out;',
      '}',
      '@keyframes blink-shake {',
      '  0%, 100% { transform: translateX(0); }',
      '  20% { transform: translateX(-8px); }',
      '  40% { transform: translateX(8px); }',
      '  60% { transform: translateX(-6px); }',
      '  80% { transform: translateX(6px); }',
      '}',
      '.blink-definition {',
      '  font-size: 26px;',
      '  font-style: italic;',
      '  color: var(--text-light);',
      '  text-align: center;',
      '  line-height: 1.4;',
      '  max-width: 320px;',
      '  padding: 0 12px;',
      '}',

      /* Celebration container */
      '.blink-celebration {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      '  width: 0;',
      '  height: 0;',
      '  z-index: 5;',
      '  pointer-events: none;',
      '}',

      /* Sparkle animation */
      '.blink-sparkle {',
      '  position: absolute;',
      '  font-size: 20px;',
      '  animation: blink-sparkle-fly 1s ease-out forwards;',
      '  opacity: 0;',
      '}',
      '@keyframes blink-sparkle-fly {',
      '  0% { transform: translate(0, 0) scale(0); opacity: 1; }',
      '  50% { opacity: 1; }',
      '  100% {',
      '    transform: translate(var(--tx, 50px), var(--ty, -50px)) scale(1.2);',
      '    opacity: 0;',
      '  }',
      '}',

      /* Confetti animation */
      '.blink-confetti {',
      '  position: absolute;',
      '  width: 8px;',
      '  height: 8px;',
      '  border-radius: 2px;',
      '  animation: blink-confetti-fly 1.2s ease-out forwards;',
      '  opacity: 0;',
      '}',
      '@keyframes blink-confetti-fly {',
      '  0% { transform: translate(0, 0) rotate(0deg) scale(0); opacity: 1; }',
      '  30% { opacity: 1; }',
      '  100% {',
      '    transform: translate(var(--tx, 40px), var(--ty, 30px)) rotate(var(--rot, 360deg)) scale(1);',
      '    opacity: 0;',
      '  }',
      '}',

      /* Emoji burst animation */
      '.blink-emoji-burst {',
      '  position: absolute;',
      '  font-size: 24px;',
      '  animation: blink-emoji-fly 1.5s ease-out forwards;',
      '  opacity: 0;',
      '}',
      '@keyframes blink-emoji-fly {',
      '  0% { transform: translate(0, 0) scale(0); opacity: 1; }',
      '  40% { opacity: 1; }',
      '  100% {',
      '    transform: translate(var(--tx, 30px), var(--ty, -40px)) scale(1.1);',
      '    opacity: 0;',
      '  }',
      '}',

      /* QWERTY Keyboard */
      '.blink-keyboard {',
      '  width: 100%;',
      '  max-width: 400px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 6px;',
      '  padding: 8px 0;',
      '}',
      '.blink-key-row {',
      '  display: flex;',
      '  justify-content: center;',
      '  gap: 4px;',
      '}',
      '.blink-key {',
      '  min-width: 34px;',
      '  height: 48px;',
      '  border: none;',
      '  border-radius: var(--radius-sm);',
      '  background: var(--white);',
      '  color: var(--text);',
      '  font-family: var(--font);',
      '  font-size: 26px;',
      '  font-weight: 900;',
      '  cursor: pointer;',
      '  box-shadow: 0 3px 0 var(--shadow-strong), 0 4px 8px var(--shadow);',
      '  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.3s ease;',
      '  flex: 1;',
      '  max-width: 42px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '.blink-key:active {',
      '  transform: translateY(3px);',
      '  box-shadow: 0 0 0 var(--shadow-strong), 0 2px 4px var(--shadow);',
      '}',
      '.blink-key:disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '}',
      '.blink-key-fly-away {',
      '  animation: blink-key-fly 0.5s ease-in forwards;',
      '}',
      '@keyframes blink-key-fly {',
      '  0% { transform: scale(1) translate(0, 0); opacity: 1; }',
      '  100% {',
      '    transform: scale(0.3) translate(var(--fly-x, 50px), var(--fly-y, -100px));',
      '    opacity: 0;',
      '  }',
      '}',
      '.blink-key-eliminated {',
      '  visibility: hidden;',
      '  pointer-events: none;',
      '}',

      /* Timer bonus float animation */
      '.blink-timer-bonus {',
      '  position: absolute;',
      '  font-size: 32px;',
      '  font-weight: 900;',
      '  pointer-events: none;',
      '  z-index: 20;',
      '  transform: translateX(-50%);',
      '  animation: blink-bonus-float 1.5s ease-out forwards;',
      '}',
      '.blink-bonus-positive {',
      '  color: #2E9E6B;',
      '}',
      '.blink-bonus-negative {',
      '  color: #EE5A24;',
      '}',
      '@keyframes blink-bonus-float {',
      '  0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.3); }',
      '  50% { opacity: 1; transform: translateX(-50%) translateY(calc(var(--fly-y, -80px) * 0.6)) scale(1); }',
      '  80% { opacity: 0.8; transform: translateX(-50%) translateY(var(--fly-y, -80px)) scale(0.9); }',
      '  100% { opacity: 0; transform: translateX(-50%) translateY(var(--fly-y, -80px)) scale(0.7); }',
      '}',

      /* End-of-session overlay */
      '.blink-overlay {',
      '  position: absolute;',
      '  inset: 0;',
      '  background: rgba(255, 248, 250, 0.95);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  z-index: 20;',
      '  border-radius: var(--radius);',
      '}',
      '.blink-overlay.hidden {',
      '  display: none;',
      '}',
      '.blink-overlay-content {',
      '  text-align: center;',
      '  padding: 24px;',
      '  width: 100%;',
      '  max-height: 90vh;',
      '  overflow-y: auto;',
      '}',
      '.blink-overlay-title {',
      '  font-size: 32px;',
      '  font-weight: 900;',
      '  color: var(--text);',
      '  margin-bottom: 12px;',
      '}',
      '.blink-overlay-score {',
      '  font-size: 24px;',
      '  font-weight: 900;',
      '  color: var(--pink-dark);',
      '  margin-bottom: 8px;',
      '}',
      '.blink-overlay-wrong {',
      '  font-size: 14px;',
      '  color: var(--text-light);',
      '  margin-bottom: 20px;',
      '}',
      '.blink-overlay-words {',
      '  margin-bottom: 20px;',
      '}',
      '.blink-word-list {',
      '  text-align: left;',
      '  max-height: 200px;',
      '  overflow-y: auto;',
      '  padding: 12px;',
      '  background: var(--white);',
      '  border-radius: var(--radius-sm);',
      '  border: 2px solid var(--mint);',
      '  box-shadow: 0 2px 8px var(--shadow);',
      '}',
      '.blink-word-entry {',
      '  padding: 6px 0;',
      '  border-bottom: 1px solid #F0E8F4;',
      '  font-size: 14px;',
      '  color: var(--text);',
      '  line-height: 1.4;',
      '}',
      '.blink-word-entry:last-child {',
      '  border-bottom: none;',
      '}',
      '.blink-word-entry strong {',
      '  text-transform: capitalize;',
      '  color: var(--text);',
      '}',
      '.blink-word-entry span {',
      '  color: var(--text-light);',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  return {
    init: init,
    start: startGame
  };
})();
