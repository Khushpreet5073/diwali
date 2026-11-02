// Audio Manager - centralised audio control
// Supports: sfx playback (dhol, firecracker) with listener-based sync

class AudioManager {
  constructor() {
    this.sounds = {};        // keyed sfx clips: dhol, firecracker
    this.enabled = false;    // global on/off
    this.volume = 0.75;      // sfx volume
    this.lastPlayTime = {};
    this.minInterval = 800;

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

  /* ── Background music (removed per user request) ──── */

  initBgMusic() {
    // Background song removed
  }

  async startBgMusic() {
    // Background song removed
    return false;
  }

  pauseBgMusic() {
    // Background song removed
  }

  resumeBgMusic() {
    // Background song removed
  }

  /* ── Global enable / disable ───────────────────────── */

  setEnabled(val) {
    this.enabled = Boolean(val);
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
