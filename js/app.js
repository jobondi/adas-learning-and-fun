(function () {
  'use strict';

  // --- State ---
  let playerName = localStorage.getItem('ada_player_name') || '';
  let currentScreen = 'title';

  // --- DOM refs ---
  const screens = {
    title: document.getElementById('screen-title'),
    name: document.getElementById('screen-name'),
    hub: document.getElementById('screen-hub'),
    '2048': document.getElementById('screen-2048'),
    blink: document.getElementById('screen-blink'),
  };

  const inputName = document.getElementById('input-name');
  const btnNameDone = document.getElementById('btn-name-done');
  const hubPlayerName = document.getElementById('hub-player-name');

  // --- Navigation ---
  var x2Initialized = false;
  var blinkInitialized = false;

  function navigateTo(screenId) {
    if (!screens[screenId]) return;
    screens[currentScreen]?.classList.remove('active');
    screens[screenId].classList.add('active');
    currentScreen = screenId;

    // Initialize & start Power of X2 when entering
    if (screenId === '2048') {
      if (!x2Initialized) {
        PowerOfX2.init();
        x2Initialized = true;
      }
      PowerOfX2.start();
    }

    // Initialize & start Fill In the Blink when entering
    if (screenId === 'blink') {
      if (!blinkInitialized) {
        FillInTheBlink.init();
        blinkInitialized = true;
      }
      FillInTheBlink.start();
    }
  }

  // Expose navigateTo for game modules that rebuild their own DOM
  window.adaNavigateTo = navigateTo;

  // --- Title screen ---
  document.getElementById('btn-start').addEventListener('click', function () {
    if (playerName) {
      hubPlayerName.textContent = playerName;
      navigateTo('hub');
    } else {
      navigateTo('name');
    }
  });

  // --- Name screen ---
  document.getElementById('btn-back-name').addEventListener('click', function () {
    navigateTo('title');
  });

  inputName.addEventListener('input', function () {
    const val = inputName.value.trim();
    btnNameDone.disabled = val.length === 0;
  });

  btnNameDone.addEventListener('click', function () {
    const val = inputName.value.trim();
    if (!val) return;
    playerName = val;
    localStorage.setItem('ada_player_name', playerName);
    hubPlayerName.textContent = playerName;
    navigateTo('hub');
  });

  // Enter key submits name
  inputName.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !btnNameDone.disabled) {
      btnNameDone.click();
    }
  });

  // --- Hub screen ---
  document.querySelectorAll('.game-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var game = card.getAttribute('data-game');
      if (game === '2048') navigateTo('2048');
      else if (game === 'blink') navigateTo('blink');
    });
  });

  // --- Game back buttons ---
  document.getElementById('btn-back-2048').addEventListener('click', function () {
    navigateTo('hub');
  });

  document.getElementById('btn-back-blink').addEventListener('click', function () {
    navigateTo('hub');
  });

  // --- Share button ---
  document.getElementById('btn-share').addEventListener('click', function () {
    var url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "Ada's Learning AND Fun!", url: url });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        alert('Link copied!');
      });
    }
  });

  // --- PWA service worker registration ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {
      // Service worker registration failed — app still works
    });
  }

  // --- Lock orientation to portrait if supported ---
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('portrait').catch(function () {
      // Orientation lock not supported — that's fine
    });
  }

  // --- Restore state if player already named ---
  if (playerName) {
    inputName.value = playerName;
    btnNameDone.disabled = false;
  }
})();
