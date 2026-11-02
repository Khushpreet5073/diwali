import { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import React from 'react';
import gsap from 'gsap';
import Chakri3D from './Chakri3D';
import FireworksEngine from './FireworksEngine';
import FloatingParticles from './FloatingParticles';
import DiyaDecorations from './DiyaDecorations';

// Helper: check if WebGL is supported
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

// Error boundary to catch WebGL initialization crashes gracefully
class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('[HeroSection] WebGL rendering error caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Elegant 2D Fallback Chakri if WebGL is unavailable - shifted to right on desktop
function FallbackChakri({ onExplode }) {
  const [hovered, setHovered] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const colors = ['#FFD76A', '#FF9F1C', '#F04492', '#54218C', '#32C5C5', '#FFB800'];

  useEffect(() => {
    const timer = setInterval(() => {
      setColorIdx(c => (c + 1) % colors.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [colors.length]);

  return (
    <div
      onClick={onExplode}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: '50%',
        right: '12%',
        transform: `translateY(-50%) scale(${hovered ? 1.15 : 1})`,
        width: '300px',
        height: '300px',
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 5,
      }}
      title="Click the Chakri to ignite!"
    >
      <svg
        viewBox="0 0 200 200"
        style={{
          width: '100%',
          height: '100%',
          filter: `drop-shadow(0 0 25px ${colors[colorIdx]})`,
          animation: `spinChakri ${hovered ? '1.2s' : '3.5s'} linear infinite`,
        }}
      >
        <circle cx="100" cy="100" r="85" fill="none" stroke={colors[colorIdx]} strokeWidth="3" opacity="0.85" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="#FF9F1C" strokeWidth="2" opacity="0.7" />
        <circle cx="100" cy="100" r="25" fill="none" stroke="#FFD76A" strokeWidth="2" opacity="0.8" />
        <circle cx="100" cy="100" r="10" fill={colors[colorIdx]} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x2 = 100 + Math.cos(a) * 85;
          const y2 = 100 + Math.sin(a) * 85;
          const cx = 100 + Math.cos(a + 0.35) * 45;
          const cy = 100 + Math.sin(a + 0.35) * 45;
          return (
            <path
              key={i}
              d={`M 100 100 Q ${cx} ${cy} ${x2} ${y2}`}
              fill="none"
              stroke={colors[(colorIdx + i) % colors.length]}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <style>{`
        @keyframes spinChakri {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Optimized Background SVG Patterns
function BackgroundPatterns() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.12 }}
      >
        {/* Rays from center */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * 360;
          const rad = (angle * Math.PI) / 180;
          const cx = 720, cy = 450;
          const len = 700;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(rad) * len}
              y2={cy + Math.sin(rad) * len}
              stroke="#FFD76A"
              strokeWidth="1"
            />
          );
        })}
        {/* Decorative concentric circles */}
        <circle cx="720" cy="450" r="200" fill="none" stroke="#FFD76A" strokeWidth="0.5" />
        <circle cx="720" cy="450" r="300" fill="none" stroke="#F04492" strokeWidth="0.5" />
        <circle cx="720" cy="450" r="400" fill="none" stroke="#54218C" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// High-performance Three.js scene - shifted to the right side on desktop
function ChakraScene({ onExplode }) {
  const { viewport } = useThree();
  const isDesktop = viewport.width > 5.5;
  // Position Chakri prominently on the right side on desktop, centered on mobile
  const posX = isDesktop ? Math.min(2.5, Math.max(1.8, viewport.width * 0.28)) : 0;
  const posY = isDesktop ? 0.05 : -0.7;
  const chakriScale = isDesktop ? 1.15 : 0.85;

  return (
    <>
      <ambientLight intensity={0.9} color="#FFD76A" />
      <pointLight position={[posX, posY + 3, 3]} intensity={2.2} color="#FF9F1C" />
      <group position={[posX, posY, 0]} scale={chakriScale}>
        <Chakri3D onExplode={onExplode} />
      </group>
    </>
  );
}

export default function HeroSection({ isActive = true, fireworksLaunchRef }) {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const punjRef = useRef(null);
  const [, setExplodeCount] = useState(0);
  const [hasWebGL, setHasWebGL] = useState(() => isWebGLAvailable());
  const [inView, setInView] = useState(true);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  // Performance: Pause Three.js & canvas loops when HeroSection is out of view
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive || !titleRef.current || !subtitleRef.current || !punjRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(titleRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        '-=0.5'
      )
      .fromTo(punjRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      );

      // Launch welcoming celebratory fireworks upon entry
      if (fireworksLaunchRef?.current) {
        const launch = fireworksLaunchRef.current;
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            launch(
              window.innerWidth * (0.2 + Math.random() * 0.6),
              window.innerHeight * (0.15 + Math.random() * 0.35)
            );
          }, 150 + i * 250);
        }
      }
    }, heroRef);

    // Subtle parallax on mouse
    const handleMouse = (e) => {
      if (!titleRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      gsap.to(titleRef.current, {
        x: -x * 0.5,
        y: -y * 0.3,
        duration: 1.2,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [isActive, fireworksLaunchRef]);

  const handleChakraExplode = () => {
    setExplodeCount(c => c + 1);
    if (fireworksLaunchRef?.current) {
      const launch = fireworksLaunchRef.current;
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          launch(
            window.innerWidth * (0.15 + Math.random() * 0.7),
            window.innerHeight * (0.1 + Math.random() * 0.4),
          );
        }, i * 140);
      }
    }
  };

  return (
    <section className="hero-section" ref={heroRef} id="hero">
      {/* Background gradient */}
      <div className="hero-bg-gradient" />

      {/* Decorative SVG patterns */}
      <BackgroundPatterns />

      {/* Three.js canvas - automatically pauses when scrolled off-screen */}
      <div
        className="hero-canvas-container"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        {hasWebGL ? (
          <WebGLErrorBoundary fallback={<FallbackChakri onExplode={handleChakraExplode} />}>
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                stencil: false,
                depth: true,
              }}
              style={{ background: 'transparent' }}
              dpr={[1, 1.5]}
              frameloop={inView && isActive ? 'always' : 'never'}
            >
              <ChakraScene onExplode={handleChakraExplode} />
            </Canvas>
          </WebGLErrorBoundary>
        ) : (
          <FallbackChakri onExplode={handleChakraExplode} />
        )}
      </div>

      {/* Fireworks Canvas with inView pause */}
      <FireworksEngine intensity={1} onLaunch={fireworksLaunchRef} inView={inView} />

      {/* Floating petals with inView pause */}
      <FloatingParticles count={24} inView={inView} />

      {/* Diya corner decorations */}
      <DiyaDecorations />

      {/* Main typography */}
      <div className="hero-content" style={{ pointerEvents: 'none' }}>
        <div ref={titleRef} className="hero-title" style={{ opacity: 1 }}>
          <span>HAPPY</span>
          <span className="word-diwali">DIWALI</span>
        </div>

        <p ref={subtitleRef} className="hero-subtitle" style={{ opacity: 1 }}>
          May your life shine brighter than a thousand diyas.
        </p>

        <p ref={punjRef} className="hero-punjabi" style={{ opacity: 1 }}>
          Tuhanu te tuhade parivaar nu Diwali diyan lakh lakh vadhaiyan! 🪔
        </p>

        {/* Interactive hint */}
        <div className="hero-cta-hint" style={{ pointerEvents: 'auto' }}>
          <span className="cta-sparkle">✦</span>
          <span className="cta-text">CLICK THE CHAKRI TO IGNITE</span>
          <span className="cta-sparkle">✦</span>
        </div>

      </div>

      {/* Animated mouse scroll indicator */}
      <div className="hero-scroll-hint" style={{ pointerEvents: 'auto' }}>
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span className="scroll-text">SCROLL</span>
      </div>
    </section>
  );
}
