import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GREETINGS = [
  (name) => `Dear ${name}, may the light of Diwali illuminate your life with happiness, prosperity, and love. Wishing you a magical festival full of joy! 🪔`,
  (name) => `To the wonderful ${name} — on this auspicious occasion of Diwali, may Goddess Lakshmi bless your home with wealth, health, and endless happiness! ✨`,
  (name) => `${name}, as the diyas light up the night, may your path always be bright. Wishing you a Diwali filled with laughter, family, and unforgettable memories! 🎆`,
  (name) => `Happy Diwali, ${name}! May every spark of firework bring you new hope, every diya bring clarity, and every sweet moment bring you closer to your dreams! 🌟`,
];

export default function GreetingGenerator({ fireworksLaunchRef }) {
  const sectionRef = useRef(null);
  const [name, setName] = useState('');
  const [generated, setGenerated] = useState(null);
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.greeting-section .section-inner > *', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const generateGreeting = () => {
    if (!name.trim()) return;
    const idx = greetingIndex % GREETINGS.length;
    setGenerated({
      text: GREETINGS[idx](name.trim()),
      name: name.trim(),
    });
    setGreetingIndex(i => i + 1);

    // Trigger small fireworks
    if (fireworksLaunchRef?.current) {
      const launch = fireworksLaunchRef.current;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          launch(
            window.innerWidth * (0.3 + Math.random() * 0.4),
            window.innerHeight * (0.2 + Math.random() * 0.3),
          );
        }, i * 200);
      }
    }
  };

  const getWhatsAppUrl = () => {
    if (!generated) return '#';
    const text = encodeURIComponent(
      `${generated.text}\n\n🪔 Diwali diyan lakh lakh vadhaiyan! 🪔\n\nShared with love from Karmveer Singh's Diwali Experience`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <section className="section greeting-section" ref={sectionRef} id="greetings">
      <div className="section-inner" style={{ textAlign: 'center' }}>
        <div className="section-badge">✦ Share the Joy ✦</div>
        <h2 className="section-title">Send Diwali Wishes</h2>
        <p className="section-text" style={{ margin: '0 auto' }}>
          Create a personalised Diwali greeting and share it with someone special.
        </p>

        <div className="greeting-container">
          <div className="greeting-input-wrapper">
            <input
              id="greeting-name-input"
              type="text"
              className="greeting-input"
              placeholder="Enter their name..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateGreeting()}
              maxLength={40}
            />
            <button
              id="generate-greeting-btn"
              className="btn-generate"
              onClick={generateGreeting}
              disabled={!name.trim()}
            >
              🎇 Generate
            </button>
          </div>

          {generated && (
            <div className="greeting-card" key={greetingIndex}>
              <p className="greeting-card-text">
                {generated.text.split(generated.name).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="greeting-name">{generated.name}</span>
                    )}
                  </span>
                ))}
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  id="whatsapp-share-btn"
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Share on WhatsApp
                </a>
                <button
                  id="new-greeting-btn"
                  className="btn-generate"
                  onClick={generateGreeting}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--cream)' }}
                >
                  🔄 New Greeting
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rangoli divider */}
        <div className="rangoli-divider" style={{ marginTop: '3rem' }}>
          <div className="rangoli-line" />
          <span className="rangoli-center">🎆 ✦ 🎆</span>
          <div className="rangoli-line" />
        </div>
      </div>
    </section>
  );
}
