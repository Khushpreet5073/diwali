import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { audioManager } from '../audio/AudioManager';

gsap.registerPlugin(ScrollTrigger);

export default function GrandFinale({ fireworksLaunchRef }) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const btnRef = useRef(null);
  const messageRef = useRef(null);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([titleRef.current, btnRef.current], {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: 'power3.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleCelebrate = () => {
    if (celebrating) return;
    setCelebrating(true);

    // Play sounds
    audioManager.play('firecracker', { minInterval: 0 });
    setTimeout(() => audioManager.play('dhol', { minInterval: 0 }), 400);
    setTimeout(() => audioManager.play('firecracker', { minInterval: 0 }), 1500);

    // Massive fireworks sequence
    if (fireworksLaunchRef?.current) {
      const launch = fireworksLaunchRef.current;
      const sequence = [
        { delay: 0, x: 0.5, y: 0.3 },
        { delay: 200, x: 0.2, y: 0.4 },
        { delay: 300, x: 0.8, y: 0.35 },
        { delay: 500, x: 0.35, y: 0.2 },
        { delay: 600, x: 0.65, y: 0.25 },
        { delay: 800, x: 0.15, y: 0.3 },
        { delay: 900, x: 0.85, y: 0.4 },
        { delay: 1100, x: 0.5, y: 0.15 },
        { delay: 1200, x: 0.3, y: 0.5 },
        { delay: 1300, x: 0.7, y: 0.45 },
        { delay: 1500, x: 0.5, y: 0.3 },
        { delay: 1600, x: 0.4, y: 0.2 },
        { delay: 1700, x: 0.6, y: 0.35 },
        { delay: 1900, x: 0.25, y: 0.45 },
        { delay: 2000, x: 0.75, y: 0.2 },
      ];

      sequence.forEach(({ delay, x, y }) => {
        setTimeout(() => {
          launch(
            window.innerWidth * x,
            window.innerHeight * y,
          );
        }, delay);
      });
    }

    // Show message
    if (messageRef.current) {
      setTimeout(() => {
        gsap.fromTo(messageRef.current,
          { opacity: 0, scale: 0.5, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'back.out(1.7)' }
        );
      }, 600);
    }

    // Animate the title
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut',
      });
    }

    setTimeout(() => setCelebrating(false), 4000);
  };

  return (
    <section className="section finale-section" ref={sectionRef} id="finale">
      <div className="finale-content">
        <p className="finale-subtitle">✦ The Grand Finale ✦</p>

        <h2 ref={titleRef} className="finale-title">
          HAPPY<br />DIWALI
        </h2>

        <button
          ref={btnRef}
          id="celebrate-btn"
          className="finale-btn"
          onClick={handleCelebrate}
          disabled={celebrating}
          aria-label="Launch grand celebration"
        >
          <span className="finale-btn-icon">🚀</span>
          {celebrating ? 'Celebrating...' : "LET'S CELEBRATE!"}
          <span className="finale-btn-icon" style={{ transform: 'rotate(45deg)', display: 'inline-block' }}>✨</span>
        </button>

        {/* Final message */}
        <div
          ref={messageRef}
          style={{
            marginTop: '3rem',
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.2rem, 3vw, 2rem)',
              color: 'var(--cream)',
              fontStyle: 'italic',
              lineHeight: 1.6,
              marginBottom: '1rem',
            }}
          >
            "From Karmveer Singh with love — 
            <br />
            <span style={{ color: 'var(--golden)' }}>
              Wishing you a Diwali as bright as a thousand diyas! 🪔
            </span>"
          </p>
          <p
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              color: 'rgba(255, 215, 106, 0.8)',
              letterSpacing: '0.1em',
            }}
          >
            Tuhanu te tuhade parivaar nu Diwali diyan lakh lakh vadhaiyan! 🎆🪔🎆
          </p>
        </div>

        {/* Bottom decorative row */}
        <div
          style={{
            marginTop: '4rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            fontSize: '1.8rem',
            filter: 'drop-shadow(0 0 10px rgba(255, 183, 0, 0.5))',
          }}
        >
          {['🪔', '🎆', '🌸', '✨', '🎇', '🌼', '🎉', '🌸', '🎆', '🪔'].map((e, i) => (
            <span
              key={i}
              style={{
                animation: `iconFloat 2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                display: 'inline-block',
              }}
            >
              {e}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
