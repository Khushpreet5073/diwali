import { useRef } from 'react';

function DiyaSVG({ size = 80, className = '' }) {
  const flameRef = useRef(null);

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 80 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 14px rgba(255, 183, 0, 0.55))' }}
    >
      {/* Diya base / bowl */}
      <ellipse cx="40" cy="72" rx="30" ry="14" fill="#C0392B" />
      <ellipse cx="40" cy="68" rx="28" ry="12" fill="#E74C3C" />
      <ellipse cx="40" cy="64" rx="26" ry="10" fill="#D44B3F" />
      {/* Rim */}
      <ellipse cx="40" cy="62" rx="27" ry="6" fill="none" stroke="#E8A92A" strokeWidth="1.5" />
      {/* Oil pool */}
      <ellipse cx="40" cy="62" rx="18" ry="4" fill="#8B1A1A" opacity="0.8" />
      {/* Wick */}
      <path d="M40 58 Q41 48 40 38" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
      {/* Flame outer */}
      <path
        ref={flameRef}
        d="M40 38 C37 32 34 22 40 14 C46 22 43 32 40 38Z"
        fill="url(#flameGrad)"
        style={{
          animation: 'diyaFlame 0.5s ease-in-out infinite alternate',
          transformOrigin: '40px 38px',
          willChange: 'transform',
        }}
      />
      {/* Flame inner */}
      <path
        d="M40 36 C38.5 30 37 23 40 18 C43 23 41.5 30 40 36Z"
        fill="url(#flameInner)"
        style={{
          animation: 'diyaFlame 0.4s ease-in-out infinite alternate-reverse',
          transformOrigin: '40px 36px',
        }}
      />
      {/* Flame tip */}
      <ellipse cx="40" cy="15" rx="2" ry="4" fill="white" opacity="0.9" />

      {/* Rangoli dots around diya */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const r = 36;
        const rad = (angle * Math.PI) / 180;
        const x = 40 + r * Math.cos(rad);
        const y = 66 + r * Math.sin(rad) * 0.35;
        const colors = ['#FFD76A', '#F04492', '#32C5C5', '#FF9F1C', '#FFD76A', '#C72C91', '#078C9E', '#FFB800'];
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={colors[i]}
            opacity="0.85"
          />
        );
      })}

      {/* Gradient defs */}
      <defs>
        <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#FFD76A" />
          <stop offset="40%" stopColor="#FF9F1C" />
          <stop offset="80%" stopColor="#FF4500" />
          <stop offset="100%" stopColor="#CC2200" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="flameInner" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FFD76A" />
          <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0" />
        </radialGradient>
      </defs>

      <style>{`
        @keyframes diyaFlame {
          from { transform: scaleX(1) scaleY(1) skewX(-3deg); }
          to   { transform: scaleX(0.92) scaleY(1.08) skewX(3deg); }
        }
      `}</style>
    </svg>
  );
}

// Small floating spark with CSS glow
function Spark({ style }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: '#FFD76A',
        boxShadow: '0 0 6px #FF9F1C',
        ...style,
      }}
    />
  );
}

export default function DiyaDecorations() {
  return (
    <div className="diya-corners" aria-hidden="true">
      {/* Bottom Left */}
      <div className="diya-corner diya-corner--bl">
        <div style={{ position: 'relative' }}>
          <DiyaSVG size={90} />
          <Spark style={{
            top: '5px', left: '35px',
            animation: 'sparkFloat1 1.2s ease-in-out infinite',
          }} />
          <Spark style={{
            top: '10px', left: '50px',
            animation: 'sparkFloat2 1.5s ease-in-out infinite 0.3s',
            background: '#FF9F1C',
          }} />
        </div>
      </div>

      {/* Bottom Right */}
      <div className="diya-corner diya-corner--br">
        <div style={{ position: 'relative' }}>
          <DiyaSVG size={90} />
          <Spark style={{
            top: '8px', left: '40px',
            animation: 'sparkFloat1 1.3s ease-in-out infinite 0.2s',
            background: '#F04492',
          }} />
          <Spark style={{
            top: '3px', left: '55px',
            animation: 'sparkFloat2 1.1s ease-in-out infinite 0.5s',
          }} />
        </div>
      </div>

      {/* Top Left (smaller) */}
      <div className="diya-corner diya-corner--tl">
        <DiyaSVG size={60} />
      </div>

      {/* Top Right (smaller) */}
      <div className="diya-corner diya-corner--tr">
        <DiyaSVG size={60} />
      </div>

      <style>{`
        @keyframes sparkFloat1 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
          50% { transform: translateY(-16px) translateX(3px) scale(0.6); opacity: 0; }
        }
        @keyframes sparkFloat2 {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-12px) translateX(-3px) scale(0.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
