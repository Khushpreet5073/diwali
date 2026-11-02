import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { audioManager } from '../audio/AudioManager';

/* ─────────────────────────────────────────────────────────
   HIGH-PERFORMANCE CANVAS: Petals & Mini Fireworks (No shadowBlur)
───────────────────────────────────────────────────────── */
class EntryParticle {
  constructor(w, h) { this.reset(w, h); this.y = Math.random() * h; }
  reset(w, h) {
    this.x = Math.random() * w;
    this.y = -12;
    this.r = 2 + Math.random() * 4;
    this.vy = 0.5 + Math.random() * 1.0;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.02 + Math.random() * 0.03;
    this.alpha = 0.35 + Math.random() * 0.45;
    const palette = ['#FFD76A', '#FF9F1C', '#FFB800', '#F04492', '#32C5C5', '#FFF2D5'];
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.05;
    this.type = Math.random() < 0.6 ? 'petal' : 'spark';
  }
  update(w, h) {
    this.wobble += this.wobbleSpeed;
    this.x += this.vx + Math.sin(this.wobble) * 0.4;
    this.y += this.vy;
    this.rot += this.rotSpeed;
    if (this.y > h + 15 || this.x < -15 || this.x > w + 15) this.reset(w, h);
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    if (this.type === 'petal') {
      ctx.beginPath();
      ctx.ellipse(0, -this.r * 0.55, this.r * 0.4, this.r * 1.0, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class MiniFirework {
  constructor(w, h) {
    this.reset(w, h);
    this.life = Math.random();
  }
  reset(w, h) {
    this.x = w * (0.1 + Math.random() * 0.8);
    this.y = h * (0.05 + Math.random() * 0.45);
    this.maxLife = 50 + Math.random() * 50;
    this.life = 0;
    this.particles = [];
    const count = 18 + Math.floor(Math.random() * 14);
    const palette = ['#FFD76A', '#FF9F1C', '#F04492', '#32C5C5', '#FFFFFF', '#FFB800'];
    const c1 = palette[Math.floor(Math.random() * palette.length)];
    const c2 = palette[Math.floor(Math.random() * palette.length)];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.6;
      this.particles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? c1 : c2,
      });
    }
  }
  update(w, h) {
    this.life++;
    if (this.life >= this.maxLife) { this.reset(w, h); return; }
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.035;
      p.vx *= 0.97;
      p.vy *= 0.97;
    });
  }
  draw(ctx) {
    const progress = this.life / this.maxLife;
    const alpha = progress < 0.25 ? progress / 0.25 : 1 - (progress - 0.25) / 0.75;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.particles.forEach(p => {
      ctx.globalAlpha = alpha * 0.75;
      ctx.beginPath();
      ctx.arc(this.x + p.x, this.y + p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    ctx.restore();
  }
}

function useEntryCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let raf;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const petals = Array.from({ length: 35 }, () => new EntryParticle(canvas.width, canvas.height));
    const fireworks = Array.from({ length: 4 }, () => new MiniFirework(canvas.width, canvas.height));

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(p => { p.update(canvas.width, canvas.height); p.draw(ctx); });
      fireworks.forEach(f => { f.update(canvas.width, canvas.height); f.draw(ctx); });
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [canvasRef]);
}

/* ─────────────────────────────────────────────────────────
   DECORATIVE SVGs: Rangoli Ring & Diya
───────────────────────────────────────────────────────── */
function RangoliRing({ size = 300, opacity = 0.1, style }) {
  const petals = 12;
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 300 300"
      style={{ position: 'absolute', opacity, pointerEvents: 'none', ...style }}
    >
      <g transform="translate(150,150)">
        {Array.from({ length: petals }, (_, i) => {
          const a = (i / petals) * Math.PI * 2;
          const colors = ['#FFD76A', '#FF9F1C', '#F04492', '#32C5C5'];
          return (
            <g key={i} transform={`rotate(${(i / petals) * 360})`}>
              <ellipse cx="0" cy="-90" rx="16" ry="36"
                fill={colors[i % colors.length]} opacity="0.7" />
              <circle cx={Math.cos(a - Math.PI / 2) * 115}
                      cy={Math.sin(a - Math.PI / 2) * 115}
                      r="6" fill="#FFD76A" opacity="0.6" />
            </g>
          );
        })}
        <circle r="55" fill="none" stroke="#FFD76A" strokeWidth="1" opacity="0.5" />
        <circle r="30" fill="none" stroke="#FF9F1C" strokeWidth="0.8" opacity="0.4" />
      </g>
    </svg>
  );
}

function EntryDiya({ size = 48 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 56 67"
      style={{ filter: 'drop-shadow(0 2px 10px rgba(255,183,0,0.7))', pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="uedf" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#FFD76A" />
          <stop offset="60%" stopColor="#FF9F1C" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="28" cy="52" rx="22" ry="11" fill="#C0392B" />
      <ellipse cx="28" cy="49" rx="20" ry="9" fill="#E74C3C" />
      <path d="M28 43 C25.5 37 23.5 27 28 19 C32.5 27 30.5 37 28 43Z" fill="url(#uedf)" />
      <ellipse cx="28" cy="20" rx="2.5" ry="4" fill="white" opacity="0.9" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   UNIFIED ENTRY SCREEN COMPONENT
───────────────────────────────────────────────────────── */
export default function EntryScreen({
  progress = 0,
  assetsReady = false,
  onEnter
}) {
  const screenRef      = useRef(null);
  const canvasRef      = useRef(null);
  const contentRef     = useRef(null);
  const titleRef       = useRef(null);
  const greetRef       = useRef(null);
  const progressBoxRef = useRef(null);
  const subtitleRef    = useRef(null);
  const promptRef      = useRef(null);
  const buttonsRef     = useRef(null);

  // Smooth progress counter state
  const [displayPct, setDisplayPct] = useState(0);
  const currentPctRef = useRef(0);

  // User pre-selection state (visitor can select while loading)
  const [queuedChoice, setQueuedChoice] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  // Run canvas background animation
  useEntryCanvas(canvasRef);

  // Smoothly interpolate display percentage
  useEffect(() => {
    const target = Math.min(100, Math.max(0, Math.round(progress)));
    let animId;
    let lastTime = performance.now();

    const step = (now) => {
      const dt = Math.min(50, now - lastTime) / 1000;
      lastTime = now;

      if (currentPctRef.current < target) {
        // Fast, smooth ramp: ~70% per second
        const rate = Math.max(0.6, (target - currentPctRef.current) * 0.15 + 40 * dt);
        currentPctRef.current = Math.min(target, currentPctRef.current + rate);
        setDisplayPct(Math.round(currentPctRef.current));
      }

      if (currentPctRef.current < target) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [progress]);

  // Entrance GSAP animation (fast, unified 0.4s stagger)
  useEffect(() => {
    const targets = [
      titleRef.current,
      greetRef.current,
      progressBoxRef.current,
      subtitleRef.current,
      promptRef.current,
      buttonsRef.current
    ].filter(Boolean);

    const ctx = gsap.context(() => {
      gsap.fromTo(targets,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.05 }
      );
    }, screenRef);

    return () => ctx.revert();
  }, []);

  // Trigger smooth cinematic transition directly into main website
  const executeTransition = useCallback((withSound) => {
    if (transitioning) return;
    setTransitioning(true);

    // 1. Immediately configure audio
    if (withSound) {
      audioManager.setEnabled(true);
    } else {
      audioManager.setEnabled(false);
    }

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      onEnter?.({ withSound });
    };

    // 2. Failsafe timer (300ms)
    const failsafe = setTimeout(finish, 300);

    // 3. Smooth cinematic fade-out transition (240ms)
    if (screenRef.current) {
      gsap.to(screenRef.current, {
        opacity: 0,
        y: -15,
        duration: 0.24,
        ease: 'power2.inOut',
        onComplete: () => {
          clearTimeout(failsafe);
          finish();
        },
      });
    } else {
      clearTimeout(failsafe);
      finish();
    }
  }, [transitioning, onEnter]);

  // If user selected an option while loading, execute transition as soon as resources are ready
  useEffect(() => {
    if (queuedChoice !== null && (assetsReady || displayPct >= 100)) {
      executeTransition(queuedChoice.withSound);
    }
  }, [queuedChoice, assetsReady, displayPct, executeTransition]);

  // Button click handler
  const handleButtonClick = useCallback((withSound) => {
    if (transitioning) return;

    // If assets are already ready or 100% loaded, transition immediately
    if (assetsReady || displayPct >= 100) {
      executeTransition(withSound);
    } else {
      // User pre-selected their sound preference while assets load!
      setQueuedChoice({ withSound });
    }
  }, [transitioning, assetsReady, displayPct, executeTransition]);

  const isReady = assetsReady || displayPct >= 100;

  return (
    <div
      ref={screenRef}
      id="entry-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'linear-gradient(160deg, #0A0420 0%, #1E0B45 18%, #3A1278 42%, #1A073A 65%, #0A0420 100%)',
        opacity: 1,
        padding: '1.25rem 1rem',
      }}
    >
      {/* Ambient background glow accents (using gradients instead of heavy Skia blur filters) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '12%', left: '15%',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(199,44,145,0.18) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '10%',
          width: '340px', height: '340px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,159,28,0.14) 0%, transparent 70%)',
        }} />
      </div>

      {/* Decorative Rangoli accents */}
      <RangoliRing size={320} opacity={0.08} style={{ top: '-70px', left: '-70px' }} />
      <RangoliRing size={280} opacity={0.06} style={{ bottom: '-50px', right: '-50px' }} />

      {/* Canvas — petals + subtle mini fireworks */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      {/* Corner diyas */}
      <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', opacity: 0.85, pointerEvents: 'none' }}>
        <EntryDiya size={42} />
      </div>
      <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem', opacity: 0.85, pointerEvents: 'none' }}>
        <EntryDiya size={42} />
      </div>

      {/* ── UNIFIED CONTENT CONTAINER ── */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: 'clamp(0.8rem, 2vh, 1.8rem) clamp(1rem, 3.5vw, 2.2rem)',
          maxWidth: '780px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: 'auto',
        }}
      >
        {/* TITLE: THE FESTIVAL OF LIGHTS */}
        <div ref={titleRef} style={{ marginBottom: '0.5rem', opacity: 1 }}>
          <span style={{
            display: 'inline-block',
            padding: '0.3rem 1.1rem',
            borderRadius: '50px',
            border: '1px solid rgba(255,215,106,0.5)',
            background: 'rgba(255,159,28,0.12)',
            fontSize: 'clamp(0.65rem, 1.3vw, 0.78rem)',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#FFD76A',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            boxShadow: '0 0 14px rgba(255,183,0,0.18)',
          }}>
            ✦ &nbsp; THE FESTIVAL OF LIGHTS &nbsp; ✦
          </span>
        </div>

        {/* MAIN GREETING: HAPPY DIWALI */}
        <div
          ref={greetRef}
          style={{
            marginBottom: '0.4rem',
            lineHeight: 0.92,
            opacity: 1,
            filter: 'drop-shadow(0 0 25px rgba(255,183,0,0.5))',
          }}
        >
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: 'clamp(2.6rem, 7vw, 4.8rem)',
            letterSpacing: '-0.01em',
            background: 'linear-gradient(135deg, #FFD76A 0%, #FF9F1C 35%, #F04492 70%, #FFD76A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'block',
          }}>
            HAPPY
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: 'clamp(3.1rem, 8.5vw, 6.0rem)',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #FF9F1C 0%, #FFD76A 40%, #F04492 75%, #FF9F1C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'block',
          }}>
            DIWALI
          </div>
        </div>

        {/* ── ANIMATED DIWALI LOADING PROGRESS BAR ── */}
        <div
          ref={progressBoxRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.55rem',
            width: '100%',
            maxWidth: '340px',
            margin: '0.5rem 0 0.85rem 0',
            opacity: 1,
          }}
        >
          {/* Animated Center Diya */}
          <div className="loading-diya" style={{ marginBottom: '0.2rem' }}>
            <div className="loading-flame" />
            <div className="loading-diya-body" />
          </div>

          {/* Progress Bar Container */}
          <div
            className="loading-bar-container"
            role="progressbar"
            aria-valuenow={displayPct}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ width: '100%', height: '6px' }}
          >
            <div
              className="loading-bar"
              style={{ width: `${displayPct}%` }}
            />
          </div>

          {/* Percentage & Loading Status Message */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 2px' }}>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.78rem',
              color: isReady ? '#32C5C5' : 'rgba(255,215,106,0.85)',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              {isReady ? '✦ Celebration ready!' : 'Preparing the celebration...'}
            </span>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.82rem',
              color: '#FFD76A',
              fontWeight: 700,
            }}>
              {displayPct}%
            </span>
          </div>
        </div>

        {/* SUBTITLE: An unforgettable celebration awaits you. */}
        <p ref={subtitleRef} style={{
          fontFamily: "'Libre Baskerville', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(0.9rem, 1.7vw, 1.15rem)',
          color: 'rgba(255,242,213,0.9)',
          maxWidth: '540px',
          lineHeight: 1.45,
          marginBottom: '0.75rem',
          opacity: 1,
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          An unforgettable celebration awaits you.
        </p>

        {/* INSTRUCTION: How would you like to experience the celebration? */}
        <p ref={promptRef} style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(0.85rem, 1.5vw, 1.0rem)',
          color: 'rgba(255,242,213,0.95)',
          letterSpacing: '0.04em',
          fontWeight: 600,
          marginBottom: '1.15rem',
          opacity: 1,
        }}>
          How would you like to experience the celebration?
        </p>

        {/* ── TWO ENTRY BUTTONS (Active & pre-selectable while loading) ── */}
        <div
          ref={buttonsRef}
          style={{
            display: 'flex',
            gap: 'clamp(0.85rem, 2vw, 1.6rem)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            opacity: 1,
          }}
        >
          {/* BUTTON 1: ENTER WITH SOUND */}
          <EntryButton
            id="btn-enter-with-sound"
            icon={<SoundOnIcon />}
            label="ENTER WITH SOUND"
            sub="Experience the dhol and fireworks."
            accent="#FF9F1C"
            glow="rgba(255,159,28,0.4)"
            gradient="linear-gradient(135deg, rgba(255,159,28,0.22), rgba(199,44,145,0.18))"
            borderColor="rgba(255,159,28,0.65)"
            hoverBorder="rgba(255,215,106,0.95)"
            selected={queuedChoice?.withSound === true}
            isReady={isReady}
            disabled={transitioning}
            onClick={() => handleButtonClick(true)}
          />

          {/* BUTTON 2: ENTER WITHOUT SOUND */}
          <EntryButton
            id="btn-enter-without-sound"
            icon={<SoundOffIcon />}
            label="ENTER WITHOUT SOUND"
            sub="Enjoy the celebration silently."
            accent="#32C5C5"
            glow="rgba(50,197,197,0.35)"
            gradient="linear-gradient(135deg, rgba(84,33,140,0.3), rgba(50,197,197,0.18))"
            borderColor="rgba(50,197,197,0.55)"
            hoverBorder="rgba(50,197,197,0.95)"
            selected={queuedChoice?.withSound === false}
            isReady={isReady}
            disabled={transitioning}
            onClick={() => handleButtonClick(false)}
          />
        </div>

        {/* Bottom tagline */}
        <p style={{
          marginTop: '1.4rem',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          color: 'rgba(255,215,106,0.45)',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          ✦ &nbsp; Crafted with ❤️ by Karmveer Singh &nbsp; ✦
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   REUSABLE ENTRY BUTTON WITH PRE-SELECTION SUPPORT
───────────────────────────────────────────────────────── */
function EntryButton({
  id,
  icon,
  label,
  sub,
  accent,
  glow,
  gradient,
  borderColor,
  hoverBorder,
  selected,
  isReady,
  disabled,
  onClick
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      id={id}
      type="button"
      className="entry-btn"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 220px',
        maxWidth: '275px',
        minWidth: '205px',
        padding: 'clamp(0.9rem, 1.8vh, 1.3rem) clamp(1rem, 2vw, 1.4rem)',
        background: gradient,
        border: `1.5px solid ${selected ? '#FFD76A' : (hovered ? hoverBorder : borderColor)}`,
        borderRadius: '18px',
        cursor: disabled ? 'wait' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.55rem',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: selected
          ? `0 0 35px 6px ${glow}, 0 0 20px rgba(255,215,106,0.6)`
          : (hovered ? `0 0 28px 4px ${glow}, 0 6px 24px rgba(0,0,0,0.5)` : `0 4px 18px rgba(0,0,0,0.38)`),
        transform: hovered || selected ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        opacity: 1,
      }}
    >
      {/* Shimmer overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div
        style={{
          width: '50px', height: '50px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          border: `1.5px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
          transform: hovered ? 'scale(1.08) rotate(-3deg)' : 'scale(1) rotate(0deg)',
          transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: `0 0 14px ${glow}`,
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span style={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(0.88rem, 1.7vw, 1.02rem)',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: accent,
        lineHeight: 1.2,
      }}>
        {selected ? (isReady ? `ENTERING...` : `STARTING WITH SOUND...`) : label}
      </span>

      {/* Sub-text */}
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(0.7rem, 1.25vw, 0.8rem)',
          color: 'rgba(255,242,213,0.75)',
          lineHeight: 1.4,
          letterSpacing: '0.02em',
        }}
      >
        {selected ? 'Selection confirmed. Entering shortly...' : sub}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────── */
function SoundOnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="#FF9F1C" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#FFD76A" strokeWidth="2" strokeLinecap="round" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#FFD76A" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="#32C5C5" />
      <line x1="23" y1="9" x2="17" y2="15" stroke="#32C5C5" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="17" y1="9" x2="23" y2="15" stroke="#32C5C5" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
