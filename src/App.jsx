import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import LoadingScreen    from './components/LoadingScreen';
import MusicController  from './components/MusicController';
import HeroSection      from './components/HeroSection';
import MagicSection     from './components/MagicSection';
import PunjabiSection   from './components/PunjabiSection';
import GreetingGenerator from './components/GreetingGenerator';
import GrandFinale      from './components/GrandFinale';
import { audioManager } from './audio/AudioManager';

gsap.registerPlugin(ScrollTrigger);

// ── Asset paths ────────────────────────────────────────────
const ASSETS = {
  diya: '/assets/images/diya.jpg',
  dhol: '/assets/images/dhol.png',
  audio: {
    dhol:        '/assets/audio/dhol-beat.mp3',
    firecracker: '/assets/audio/firecracker.mp3',
  },
};

function checkImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function checkAudio(src) {
  return new Promise(resolve => {
    const audio = new Audio();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve(true);
    };
    audio.addEventListener('canplaythrough', finish, { once: true });
    audio.addEventListener('error', finish, { once: true });
    setTimeout(finish, 1500); // 1.5s per-audio fallback
    audio.src = src;
    audio.load();
  });
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  // Application state flow:
  // 'loading' → Festive Diwali Loading Screen (animated Diya, golden progress bar 0-100%)
  // 'main'    → Main Diwali home page (automatically revealed upon loading completion)
  const [phase, setPhase] = useState('loading');

  // Loading progress percentage (0 - 100) reflecting real asset readiness
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Sound effects enabled by default (Dhol and Fireworks)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Image asset availability
  const [assets, setAssets] = useState({ diya: null, dhol: null });

  // Ref for fireworks launch function passed down through sections
  const fireworksLaunchRef = useRef(null);

  // Main content wrapper ref (for GSAP entrance)
  const mainWrapRef = useRef(null);

  // ── Preload assets on mount & track progress ───────────────
  useEffect(() => {
    let mounted = true;
    let completedCount = 0;
    const TOTAL_ITEMS = 5;

    const notifyItemComplete = () => {
      if (!mounted) return;
      completedCount++;
      const pct = Math.min(100, Math.round((completedCount / TOTAL_ITEMS) * 100));
      setLoadingProgress(pct);
      if (pct >= 100) {
        setAssetsReady(true);
      }
    };

    // Overall safety fallback timer: ensure progress reaches 100% and assetsReady = true within 2.2s
    const fallbackTimer = setTimeout(() => {
      if (mounted) {
        setLoadingProgress(100);
        setAssetsReady(true);
      }
    }, 2200);

    async function loadAllAssets() {
      // Essential track 1: Web fonts readiness
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(notifyItemComplete).catch(notifyItemComplete);
      } else {
        notifyItemComplete();
      }

      // Concurrent track 2: dhol beat sfx
      audioManager.load('dhol', ASSETS.audio.dhol).then(notifyItemComplete);

      // Concurrent track 3: firecracker sfx
      audioManager.load('firecracker', ASSETS.audio.firecracker).then(notifyItemComplete);

      // Concurrent track 4: diya image
      checkImage(ASSETS.diya).then(ok => {
        if (mounted && ok) setAssets(prev => ({ ...prev, diya: ASSETS.diya }));
        notifyItemComplete();
      });

      // Concurrent track 5: dhol image
      checkImage(ASSETS.dhol).then(ok => {
        if (mounted && ok) setAssets(prev => ({ ...prev, dhol: ASSETS.dhol }));
        notifyItemComplete();
      });
    }

    loadAllAssets();

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // ── Handler: loading finished -> transition automatically to main website
  const handleLoadingComplete = useCallback(() => {
    console.log('[App] Loading complete! Opening main celebration...');
    audioManager.setEnabled(true);
    setSoundEnabled(true);
    setPhase('main');
  }, []);

  window.__DIWALI_PHASE__ = phase;

  // ── When main phase mounts, run entrance animation ───────
  useEffect(() => {
    if (phase !== 'main' || !mainWrapRef.current) return;

    const tid = setTimeout(() => {
      gsap.fromTo(
        mainWrapRef.current,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            ScrollTrigger.refresh();
          },
        }
      );
      ScrollTrigger.refresh();
    }, 40);

    return () => clearTimeout(tid);
  }, [phase]);

  // ── MusicController toggle (from persistent pill) ────────
  const handleSoundToggle = useCallback((enabled) => {
    setSoundEnabled(enabled);
  }, []);

  // ── RENDER ───────────────────────────────────────────────
  return (
    <>
      {/* 1. Dedicated Diwali Loading Page: loads progress 0-100% and auto-opens main website */}
      {phase === 'loading' && (
        <LoadingScreen
          progress={loadingProgress}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* 2. Main website: rendered in the background, visible when 'main' */}
      <div
        ref={mainWrapRef}
        id="app-wrapper"
        style={{
          opacity: phase === 'main' ? 1 : 0,
          pointerEvents: phase === 'main' ? 'auto' : 'none',
        }}
      >
        {/* ── Fixed UI ──────────────────────────────────── */}
        <MusicController
          initialEnabled={soundEnabled}
          onToggle={handleSoundToggle}
        />

        <div className="karmveer-signature" aria-label="Made by Karmveer Singh">
          <div className="karmveer-dot" />
          <span>Karmveer Singh</span>
          <span style={{ color: 'rgba(255,159,28,0.6)', marginLeft: '4px' }}>
            ✦ Diwali 2026
          </span>
        </div>

        {/* ── Main sections ─────────────────────────────── */}
        <main>
          <HeroSection
            isActive={phase === 'main'}
            fireworksLaunchRef={fireworksLaunchRef}
          />
          <MagicSection     diyaImageSrc={assets.diya} />
          <PunjabiSection   dholImageSrc={assets.dhol} />
          <GreetingGenerator fireworksLaunchRef={fireworksLaunchRef} />
          <GrandFinale      fireworksLaunchRef={fireworksLaunchRef} />
        </main>

        {/* ── Footer ────────────────────────────────────── */}
        <footer
          style={{
            background: '#060310',
            borderTop: '1px solid rgba(255,215,106,0.1)',
            padding: '2rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'rgba(255,242,213,0.4)',
            letterSpacing: '0.1em',
          }}
        >
          <div style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>🪔 ✦ 🎆 ✦ 🪔</div>
          <p>DIWALI – THE FESTIVAL OF LIGHTS &nbsp;•&nbsp; Crafted with ❤️ by Karmveer Singh</p>
          <p style={{ marginTop: '0.25rem', opacity: 0.6 }}>
            Tuhanu te tuhade parivaar nu Diwali diyan lakh lakh vadhaiyan!
          </p>
        </footer>
      </div>
    </>
  );
}
