import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { audioManager } from '../audio/AudioManager';

gsap.registerPlugin(ScrollTrigger);

// SVG Phulkari pattern
function PhulkariPattern({ style }) {
  return (
    <svg
      style={{ position: 'absolute', opacity: 0.15, pointerEvents: 'none', ...style }}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Geometric phulkari-inspired motif */}
      <g fill="none" stroke="#FFD76A" strokeWidth="1.5">
        <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" />
        <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" />
        <circle cx="100" cy="100" r="30" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r1 = 40, r2 = 60;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * r1}
              y1={100 + Math.sin(a) * r1}
              x2={100 + Math.cos(a) * r2}
              y2={100 + Math.sin(a) * r2}
            />
          );
        })}
        {/* Petal shapes */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const cx = 100 + Math.cos(a) * 70;
          const cy = 100 + Math.sin(a) * 70;
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx="8"
              ry="14"
              transform={`rotate(${(a * 180) / Math.PI + 90}, ${cx}, ${cy})`}
              fill="#FF9F1C"
              fillOpacity="0.6"
            />
          );
        })}
      </g>
      {/* Center dot */}
      <circle cx="100" cy="100" r="8" fill="#FFD76A" opacity="0.8" />
    </svg>
  );
}

// Particle burst effect on dhol hit
function DholParticles({ active, x, y }) {
  if (!active) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360;
        const colors = ['#FFD76A', '#FF9F1C', '#F04492', '#32C5C5', '#FFB800'];
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 10px ${color}`,
              animation: `dholSpark 0.6s ease-out forwards`,
              '--angle': `${angle}deg`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes dholSpark {
          0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-60px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function PunjabiSection({ dholImageSrc }) {
  const sectionRef = useRef(null);
  const dholRef = useRef(null);
  const textRef = useRef(null);
  const [dholHit, setDholHit] = useState(false);
  const [particleActive, setParticleActive] = useState(false);
  const hitTimeoutRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        x: -60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });

      gsap.from(dholRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        x: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });

      // Floating parallax on dhol
      gsap.to(dholRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        y: -40,
        ease: 'none',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleDholClick = useCallback(() => {
    audioManager.play('dhol', { minInterval: 500 });

    // Animate dhol
    setDholHit(true);
    setParticleActive(true);

    if (dholRef.current) {
      gsap.timeline()
        .to(dholRef.current, { scale: 1.08, rotate: -4, duration: 0.1 })
        .to(dholRef.current, { scale: 0.97, rotate: 3, duration: 0.1 })
        .to(dholRef.current, { scale: 1.03, rotate: -2, duration: 0.1 })
        .to(dholRef.current, { scale: 1, rotate: 0, duration: 0.15 });
    }

    clearTimeout(hitTimeoutRef.current);
    hitTimeoutRef.current = setTimeout(() => {
      setDholHit(false);
      setParticleActive(false);
    }, 700);
  }, []);

  return (
    <section className="section punjabi-section" ref={sectionRef} id="punjabi">
      {/* Phulkari pattern decorations */}
      <PhulkariPattern style={{ top: '-50px', right: '-50px', width: '250px', height: '250px' }} />
      <PhulkariPattern style={{ bottom: '-50px', left: '-50px', width: '200px', height: '200px' }} />

      <div className="section-inner">
        <div className="punjabi-content">
          {/* Text side */}
          <div className="punjabi-text-side" ref={textRef}>
            <div className="section-badge">✦ Punjabi Celebrations ✦</div>
            <h2 className="section-title">The Beat of Punjab</h2>
            <p className="section-text">
              No Punjabi Diwali is complete without the thunderous rhythm of the dhol. 
              The beat fills the air with energy, joy, and the spirit of celebration.
            </p>
            <div className="punjabi-greeting">
              "Khushiyan, roshni te mithaas naal bhari hove tuhadi Diwali!"
            </div>
            <div className="punjabi-greeting-2">
              "Tuhanu te tuhade parivaar nu Diwali diyan lakh lakh vadhaiyan!"
            </div>

            {/* Decorative badges */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              {['🥁 Dhol', '🎉 Bhangra', '🌼 Phulkari', '🍬 Mithaas', '🎇 Patakhe'].map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '0.4rem 0.9rem',
                    background: 'rgba(255, 215, 106, 0.1)',
                    border: '1px solid rgba(255, 215, 106, 0.3)',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 242, 213, 0.8)',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Dhol visual side */}
          <div className="dhol-visual-side">
            <div
              ref={dholRef}
              className="dhol-wrapper"
              onClick={handleDholClick}
              role="button"
              aria-label="Click to play dhol beat"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleDholClick()}
              style={{ transformOrigin: 'center' }}
            >
              <div className="dhol-glow-ring" />

              {dholImageSrc ? (
                <img
                  src={dholImageSrc}
                  alt="Traditional Punjabi dhol on phulkari fabric"
                  className={`dhol-image${dholHit ? ' dhol-hit' : ''}`}
                  draggable={false}
                />
              ) : (
                /* Fallback if dhol.png is unavailable */
                <div
                  style={{
                    width: '300px',
                    height: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8rem',
                    filter: 'drop-shadow(0 20px 60px rgba(255, 159, 28, 0.4))',
                    animation: dholHit ? 'dholBeat 0.3s ease-in-out' : 'none',
                  }}
                >
                  🥁
                </div>
              )}

              <DholParticles active={particleActive} />

              <div className="dhol-click-hint">
                🎵 Click to beat the dhol 🎵
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
