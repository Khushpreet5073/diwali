// Audio Manager - centralised audio control
// Supports: sfx playback, background music, listener-based sync

class AudioManager {
  constructor() {
    this.sounds = {};        // keyed sfx clips
    this.enabled = false;    // global on/off
    this.volume = 0.7;       // sfx volume
    this.lastPlayTime = {};
    this.minInterval = 1000;

    // Background music
    this.bgMusic = null;
    this.bgVolume = 0.25;
    this.bgPlaying = false;

    // Listeners so components can react to enable/disable externally
    this._listeners = new Set();
  }

  /* ── SFX ───────────────────────────────────────────── */

  async load(key, src) {
    return new Promise((resolve) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = this.volume;
        let finished = false;
        const done = (ok) => {
          if (finished) return;
          finished = true;
          this.sounds[key] = audio;
          this.lastPlayTime[key] = 0;
          resolve(ok);
        };
        audio.addEventListener('canplaythrough', () => done(true), { once: true });
        audio.addEventListener('error', () => done(false), { once: true });
        setTimeout(() => done(true), 2500); // fallback timeout
        audio.src = src;
        audio.load();
      } catch (e) {
        console.warn(`Audio load failed for ${key}:`, e);
        resolve(false);
      }
    });
  }

  play(key, options = {}) {
    if (!this.enabled) return;
    const sound = this.sounds[key];
    if (!sound) return;

    const now = Date.now();
    const interval = options.minInterval ?? this.minInterval;
    if (now - (this.lastPlayTime[key] || 0) < interval) return;

    try {
      const clone = sound.cloneNode();
      clone.volume = options.volume ?? this.volume;
      clone.play().catch(() => {});
      this.lastPlayTime[key] = now;
    } catch (_) {}
  }

  /* ── Background music ──────────────────────────────── */

  initBgMusic(src = '/assets/audio/diwali-background.mp3') {
    if (this.bgMusic) return; // already initialised
    try {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = this.bgVolume;
      this.bgMusic = audio;
    } catch (e) {
      console.warn('Background music init failed:', e);
    }
  }

  /**
   * Start background music. Returns a promise so callers can
   * catch autoplay-policy failures gracefully.
   */
  async startBgMusic(src = '/assets/audio/diwali-background.mp3') {
    if (!this.bgMusic) {
      this.initBgMusic(src);
    }
    if (!this.bgMusic) return false;
    try {
      this.bgMusic.currentTime = 0;
      await this.bgMusic.play();
      this.bgPlaying = true;
      if (typeof window !== 'undefined') window.__AUDIO_BG_PLAYING__ = true;
      return true;
    } catch (e) {
      console.warn('Background music could not start:', e);
      return false;
    }
  }

  pauseBgMusic() {
    if (this.bgMusic && this.bgPlaying) {
      this.bgMusic.pause();
      this.bgPlaying = false;
      if (typeof window !== 'undefined') window.__AUDIO_BG_PLAYING__ = false;
    }
  }

  resumeBgMusic() {
    if (!this.bgMusic) {
      this.initBgMusic();
    }
    if (this.bgMusic && !this.bgPlaying && this.enabled) {
      this.bgMusic.play().then(() => {
        this.bgPlaying = true;
        if (typeof window !== 'undefined') window.__AUDIO_BG_PLAYING__ = true;
      }).catch((e) => {
        console.warn('Resume bgMusic failed:', e);
      });
    }
  }

  /* ── Global enable / disable ───────────────────────── */

  setEnabled(val) {
    this.enabled = Boolean(val);
    if (this.enabled) {
      this.resumeBgMusic();
    } else {
      this.pauseBgMusic();
    }
    this._notify(this.enabled);
  }

  setVolume(val) {
    this.volume = val;
    Object.values(this.sounds).forEach(s => { s.volume = val; });
  }

  /* ── Listener system (for MusicController sync) ─────── */

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _notify(val) {
    this._listeners.forEach(fn => fn(val));
  }
}

export const audioManager = new AudioManager();
