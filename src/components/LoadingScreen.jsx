import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function LoadingScreen({ progress = 0, onComplete }) {
  const screenRef = useRef(null);
  const canvasRef = useRef(null);
  const [displayPct, setDisplayPct] = useState(0);
  const currentPctRef = useRef(0);
  const isCompletingRef = useRef(false);

  // Background glowing embers/particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#FFD76A', '#FF9F1C', '#FFB800', '#F04492', '#FFF2D5'];
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 3,
      vy: -0.4 - Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.4,
      alpha: 0.2 + Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.pulse += 0.03;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.pulse) * 0.3;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Smoothly interpolate displayed percentage towards target `progress`
  useEffect(() => {
    const target = Math.min(100, Math.max(0, Math.round(progress)));
    let animationFrame;
    let lastTime = performance.now();

    const updateCounter = (now) => {
      const dt = Math.min(50, now - lastTime) / 1000;
      lastTime = now;

      if (currentPctRef.current < target) {
        // Smoothly pace progress so the festive bar animation is visually satisfying
        const maxRate = 85;
        const step = Math.min(maxRate * dt, Math.max(0.5, (target - currentPctRef.current) * 0.16));
        currentPctRef.current = Math.min(target, currentPctRef.current + step);
        setDisplayPct(Math.round(currentPctRef.current));
      }

      if (currentPctRef.current < target || target < 100) {
        animationFrame = requestAnimationFrame(updateCounter);
      } else if (target >= 100 && currentPctRef.current >= 100 && !isCompletingRef.current) {
        isCompletingRef.current = true;
        // Brief pause at 100%, then smooth cinematic fade-out into home page
        setTimeout(() => {
          if (!screenRef.current) {
            onComplete?.();
            return;
          }
          gsap.to(screenRef.current, {
            opacity: 0,
            scale: 1.02,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => onComplete?.(),
          });
        }, 220);
      }
    };

    animationFrame = requestAnimationFrame((now) => {
      lastTime = now;
      updateCounter(now);
    });

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [progress, onComplete]);

  // Overall emergency fallback timeout: ensure transition always occurs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCompletingRef.current) {
        isCompletingRef.current = true;
        setDisplayPct(100);
        if (screenRef.current) {
          gsap.to(screenRef.current, {
            opacity: 0,
            duration: 0.45,
            ease: 'power2.inOut',
            onComplete: () => onComplete?.(),
          });
        } else {
          onComplete?.();
        }
      }
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div ref={screenRef} className="loading-screen" aria-live="polite">
      {/* Sparkles Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Decorative center Rangoli halo */}
      <svg
        width="320"
        height="320"
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          opacity: 0.12,
          pointerEvents: 'none',
          animation: 'rotateHalo 40s linear infinite',
        }}
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke="#FFD76A" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="#FF9F1C" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="45" fill="none" stroke="#F04492" strokeWidth="1" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={100 + Math.cos(a) * 80}
              cy={100 + Math.sin(a) * 80}
              r="4"
              fill="#FFD76A"
            />
          );
        })}
      </svg>

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          textAlign: 'center',
        }}
      >
        {/* Animated Diya */}
        <div className="loading-diya">
          <div className="loading-flame" />
          <div className="loading-diya-body" />
        </div>

        {/* Text */}
        <div className="loading-text">
          <span style={{
            display: 'block',
            fontSize: '0.4em',
            letterSpacing: '0.4em',
            fontWeight: 600,
            color: 'rgba(255, 215, 106, 0.85)',
            marginBottom: '0.35rem',
            fontFamily: "'Outfit', sans-serif",
          }}>
            ✦ &nbsp; THE FESTIVAL OF LIGHTS &nbsp; ✦
          </span>
          HAPPY DIWALI
        </div>

        {/* Progress Bar Container */}
        <div className="loading-bar-container" role="progressbar" aria-valuenow={displayPct} aria-valuemin="0" aria-valuemax="100">
          <div
            className="loading-bar"
            style={{ width: `${displayPct}%` }}
          />
        </div>

        {/* Percentage */}
        <div className="loading-percentage">
          {displayPct}%
        </div>

        {/* Loading Message */}
        <p className="loading-status-msg">
          Preparing the celebration...
        </p>
      </div>

      <style>{`
        @keyframes rotateHalo {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
