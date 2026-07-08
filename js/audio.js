(function () {
  let audioContext = null;
  let masterVolume = 0.65;
  let muted = false;

  function getSettings() {
    return window.gamePlatform && window.gamePlatform.getSettings ? window.gamePlatform.getSettings() : {};
  }

  function saveSettings(settings) {
    if (window.gamePlatform && window.gamePlatform.saveSettings) {
      window.gamePlatform.saveSettings(settings);
    }
  }

  function ensureAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    return audioContext;
  }

  function beep(type) {
    const ctx = ensureAudioContext();
    if (!ctx || muted) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    const frequencyMap = { click: 660, success: 880, fail: 240 };
    oscillator.type = 'square';
    oscillator.frequency.value = frequencyMap[type] || 520;
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(masterVolume * 0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  }

  function setVolume(volume) {
    masterVolume = Math.max(0, Math.min(1, Number(volume) || 0));
    muted = masterVolume <= 0;
    const settings = getSettings();
    settings.volume = masterVolume;
    settings.mute = muted;
    settings.sound = !muted;
    saveSettings(settings);
  }

  function toggleMute() {
    muted = !muted;
    const settings = getSettings();
    settings.mute = muted;
    settings.sound = !muted;
    saveSettings(settings);
    return muted;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const settings = getSettings();
    masterVolume = settings.volume || 0.65;
    muted = !!settings.mute;
    const volumeInput = document.getElementById('volumeRange');
    const muteBtn = document.getElementById('muteBtn');
    if (volumeInput) {
      volumeInput.value = masterVolume;
      volumeInput.addEventListener('input', function () {
        setVolume(this.value);
      });
    }
    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        const isMuted = toggleMute();
        this.textContent = isMuted ? '🔈 静音' : '🔊 音量';
      });
    }
    document.body.addEventListener('click', function (event) {
      if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
        beep('click');
      }
    }, true);
  });

  window.audioHelper = { beep: beep, setVolume: setVolume, toggleMute: toggleMute };
})();
