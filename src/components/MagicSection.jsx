import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MAGIC_ITEMS = [
  {
    icon: '🪔',
    title: 'Sacred Diyas',
    text: 'Thousands of clay lamps light up the night, symbolizing the triumph of light over darkness.',
  },
  {
    icon: '🎆',
    title: 'Fireworks',
    text: 'Spectacular bursts of colour illuminate the sky, filling hearts with wonder and joy.',
  },
  {
    icon: '🌸',
    title: 'Rangoli Art',
    text: 'Intricate patterns of vibrant colours welcome Lakshmi and celebrate life\'s beauty.',
  },
  {
    icon: '🍯',
    title: 'Mithaas',
    text: 'Sweet treats — ladoos, barfi and halwa — are shared with love and celebration.',
  },
  {
    icon: '🌼',
    title: 'Marigolds',
    text: 'Garlands of golden marigolds adorn every doorstep, filling the air with fragrance.',
  },
  {
    icon: '✨',
    title: 'Magic Moments',
    text: 'Families gather together, prayers are offered, and memories are made that last a lifetime.',
  },
  {
    icon: '🕊️',
    title: 'Bandi Chhor Divas',
    text: 'Commemorating the liberation of Guru Hargobind Sahib Ji & 52 kings, celebrated with grand illumination at Harmandir Sahib.',
  },
  {
    icon: '🙏',
    title: 'Laxmi Poojan',
    text: 'Sacred evening prayers welcoming Goddess Lakshmi & Lord Ganesha with diyas, prosperity, and heartfelt devotion.',
  },
];

export default function MagicSection({ diyaImageSrc }) {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Cards stagger - trigger on the rangoli divider so cards reveal immediately
      gsap.fromTo(
        '.magic-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.rangoli-divider',
            start: 'top 95%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    // Refresh ScrollTrigger calculations whenever the Diya image finishes loading
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [diyaImageSrc]);

  return (
    <section className="section magic-section" ref={sectionRef} id="magic">
      <div className="section-inner">
        <div ref={titleRef}>
          <div className="section-badge">✦ The Celebration ✦</div>
          <h2 className="section-title">The Magic of Diwali</h2>
          <p className="section-text">
            Diwali is not just a festival — it is a feeling. It is the warmth of diyas, the laughter 
            of family, the sweetness of mithaas, and the spectacle of fireworks painting the sky.
          </p>
        </div>

        {/* Diya image feature */}
        {diyaImageSrc && (
          <div
            style={{
              margin: '3rem 0',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            <div className="diya-image-card">
              <img
                src={diyaImageSrc}
                alt="Traditional diya with colourful rangoli"
                onLoad={() => ScrollTrigger.refresh()}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <div className="diya-image-overlay" />
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                  color: 'var(--golden)',
                  lineHeight: 1.5,
                  marginBottom: '1rem',
                }}
              >
                "The flame of a diya is never diminished by lighting another."
              </p>
              <p style={{ color: 'rgba(255, 242, 213, 0.7)', lineHeight: 1.7 }}>
                This beautifully decorated diya, surrounded by vibrant rangoli, 
                captures the heart of Diwali — a celebration of colour, light, 
                and the eternal victory of good over evil.
              </p>
            </div>
          </div>
        )}

        {/* Use a graceful CSS layout if image is unavailable */}
        {!diyaImageSrc && (
          <div
            style={{
              margin: '3rem 0',
              padding: '3rem',
              background: 'linear-gradient(135deg, rgba(255, 159, 28, 0.1), rgba(240, 68, 146, 0.1))',
              borderRadius: '20px',
              border: '1px solid rgba(255, 215, 106, 0.2)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🪔</div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                color: 'var(--golden)',
                lineHeight: 1.5,
              }}
            >
              "The flame of a diya is never diminished by lighting another."
            </p>
          </div>
        )}

        <div className="rangoli-divider">
          <div className="rangoli-line" />
          <span className="rangoli-center">🌸 ✦ 🌸</span>
          <div className="rangoli-line" />
        </div>

        <div className="magic-grid">
          {MAGIC_ITEMS.map((item, i) => (
            <div
              key={i}
              className="magic-card"
            >
              <span className="magic-card-icon" style={{ animationDelay: `${i * 0.2}s` }}>
                {item.icon}
              </span>
              <h3 className="magic-card-title">{item.title}</h3>
              <p className="magic-card-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
