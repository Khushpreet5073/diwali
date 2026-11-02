import { useEffect, useRef } from 'react';

const PETAL_COLORS = ['#FFD76A', '#FF9F1C', '#FFB800', '#F04492', '#FF6B35', '#FFF2D5'];

class FloatingPetal {
  constructor(canvas) {
    this.reset(canvas);
    this.y = Math.random() * canvas.height;
  }

  reset(canvas) {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.size = 3.5 + Math.random() * 6;
    this.speed = 0.4 + Math.random() * 1.2;
    this.drift = (Math.random() - 0.5) * 0.6;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.04;
    this.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.alpha = 0.35 + Math.random() * 0.45;
    this.type = Math.random() < 0.6 ? 'petal' : 'spark';
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.02 + Math.random() * 0.03;
  }

  update(canvas) {
    this.y += this.speed;
    this.wobble += this.wobbleSpeed;
    this.x += this.drift + Math.sin(this.wobble) * 0.4;
    this.rotation += this.rotationSpeed;

    if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
      this.reset(canvas);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;

    if (this.type === 'petal') {
      this.drawPetal(ctx);
    } else {
      this.drawSpark(ctx);
    }
    ctx.restore();
  }

  // Fast petal drawing without shadowBlur
  drawPetal(ctx) {
    const s = this.size;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, -s / 2, s / 2.5, s / 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s / 3, s / 4, s / 2.5, s / 1.5, Math.PI / 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fast spark drawing without shadowBlur
  drawSpark(ctx) {
    const s = this.size * 0.45;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const outerX = Math.cos(angle) * s;
      const outerY = Math.sin(angle) * s;
      const innerX = Math.cos(angle + Math.PI / 4) * s * 0.3;
      const innerY = Math.sin(angle + Math.PI / 4) * s * 0.3;
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
  }
}

export default function FloatingParticles({ count = 24, inView = true }) {
  const canvasRef = useRef(null);
  const petalsRef = useRef([]);
  const animRef = useRef(null);
  const inViewRef = useRef(inView);

  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d', { alpha: true });
    petalsRef.current = Array.from({ length: count }, () => new FloatingPetal(canvas));

    const loop = () => {
      if (inViewRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petalsRef.current.forEach(p => {
          p.update(canvas);
          p.draw(ctx);
        });
      }

      animRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="particles-canvas"
      style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 3 }}
    />
  );
}
