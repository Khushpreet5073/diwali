import { useEffect, useRef, useCallback } from 'react';
import { audioManager } from '../audio/AudioManager';

// Firework types
const TYPES = ['chrysanthemum', 'peony', 'willow', 'ring'];

const PALETTE = [
  '#FFD76A', '#FF9F1C', '#FFB800',
  '#F04492', '#C72C91',
  '#32C5C5', '#078C9E',
  '#FFFFFF',
  '#FF6B6B',
];

class Particle {
  constructor(x, y, vx, vy, color, size = 2, life = 1, trail = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.trail = trail;
    this.gravity = 0.05;
    this.drag = 0.965;
    this.history = trail ? [] : null;
    this.alpha = 1;
  }

  update(dt = 1) {
    if (this.trail && this.history) {
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > 5) this.history.shift();
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.vx *= Math.pow(this.drag, dt);
    this.vy *= Math.pow(this.drag, dt);
    this.life -= dt / 60;
    this.alpha = Math.max(0, this.life / this.maxLife);
  }

  // Fast glow drawing without slow shadowBlur
  draw(ctx) {
    if (this.alpha <= 0.02) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Simple trail
    if (this.trail && this.history && this.history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 1; i < this.history.length; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size * 0.7;
      ctx.globalAlpha = this.alpha * 0.35;
      ctx.stroke();
    }

    // Outer soft glow halo
    ctx.globalAlpha = this.alpha * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Inner bright particle core
    ctx.globalAlpha = this.alpha * 0.95;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  }
}

class Rocket {
  constructor(x, targetX, targetY, color) {
    this.x = x;
    this.startX = x;
    this.y = window.innerHeight;
    this.targetX = targetX;
    this.targetY = targetY;
    this.color = color;
    const dx = targetX - x;
    const dy = targetY - window.innerHeight;
    const speed = 13 + Math.random() * 5;
    const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy));
    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;
    this.trail = [];
    this.done = false;
    this.exploded = false;
    this.size = 2.5;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 10) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.12; // gravity deceleration

    if (this.y <= this.targetY || this.vy >= 0) {
      this.exploded = true;
      this.done = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Rocket trail
    if (this.trail.length > 1) {
      for (let i = 1; i < this.trail.length; i++) {
        const a = (i / this.trail.length) * 0.6;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Rocket tip
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();
  }
}

function createExplosion(x, y, type, particles) {
  const color1 = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const color2 = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const count = type === 'chrysanthemum' ? 55 :
                type === 'willow' ? 45 :
                type === 'ring' ? 36 : 48;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = type === 'chrysanthemum' ? (2 + Math.random() * 3.5) :
                  type === 'peony' ? (2.5 + Math.random() * 4) :
                  type === 'willow' ? (1 + Math.random() * 2.5) :
                  type === 'ring' ? 3.5 : (2 + Math.random() * 3);

    const vx = Math.cos(angle) * speed * (type === 'ring' ? 1 : (0.75 + Math.random() * 0.5));
    const vy = Math.sin(angle) * speed * (type === 'ring' ? 1 : (0.75 + Math.random() * 0.5));
    const color = i % 2 === 0 ? color1 : color2;
    const life = type === 'willow' ? (1.5 + Math.random() * 1.5) : (1.0 + Math.random() * 0.6);
    const trail = type === 'willow' || type === 'chrysanthemum';
    const size = type === 'peony' ? (1.8 + Math.random() * 1.5) : (1.2 + Math.random() * 1.2);

    particles.push(new Particle(x, y, vx, vy, color, size, life, trail));
  }
}

export default function FireworksEngine({ intensity = 1, onLaunch, inView = true }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rocketsRef = useRef([]);
  const animFrameRef = useRef(null);
  const launchIntervalRef = useRef(null);
  const inViewRef = useRef(inView);

  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);

  const launchFirework = useCallback((x, y, type) => {
    if (!canvasRef.current || !inViewRef.current) return;
    const canvas = canvasRef.current;
    const targetX = x ?? (canvas.width * 0.2 + Math.random() * canvas.width * 0.6);
    const targetY = y ?? (canvas.height * 0.1 + Math.random() * canvas.height * 0.4);
    const launchX = targetX + (Math.random() - 0.5) * 80;
    const fwType = type ?? TYPES[Math.floor(Math.random() * TYPES.length)];
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const rocket = new Rocket(launchX, targetX, targetY, color);
    rocket.explodeType = fwType;
    rocketsRef.current.push(rocket);
  }, []);

  // Expose launch function
  useEffect(() => {
    if (onLaunch) onLaunch.current = launchFirework;
  }, [onLaunch, launchFirework]);

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

    const loop = () => {
      if (inViewRef.current) {
        // Soft trail clear without turning the transparent canvas black:
        // Use 'destination-out' to gently reduce existing pixel opacity to transparent
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // If completely idle, clean up fully so zero artifacts remain
        if (particlesRef.current.length === 0 && rocketsRef.current.length === 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Update rockets
        rocketsRef.current.forEach(rocket => {
          rocket.update();
          rocket.draw(ctx);

          if (rocket.exploded) {
            createExplosion(rocket.x, rocket.y, rocket.explodeType, particlesRef.current);
            audioManager.play('firecracker', { minInterval: 3000 });
          }
        });
        rocketsRef.current = rocketsRef.current.filter(r => !r.done);

        // Update particles
        particlesRef.current.forEach(p => {
          p.update();
          p.draw(ctx);
        });
        particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    // Auto-launch fireworks with intelligent scheduling
    const scheduleNext = () => {
      const delay = (1600 + Math.random() * 2200) / intensity;
      launchIntervalRef.current = setTimeout(() => {
        if (inViewRef.current) {
          launchFirework();
        }
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(launchIntervalRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [intensity, launchFirework]);

  return (
    <canvas
      ref={canvasRef}
      className="fireworks-canvas"
      style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 2 }}
    />
  );
}
