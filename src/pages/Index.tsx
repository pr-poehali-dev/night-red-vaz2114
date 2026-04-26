import { useEffect, useRef, useState } from "react";

interface Building {
  x: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  windows: Window3D[];
  signs: Sign[];
  tier: number;
}

interface Window3D {
  x: number;
  y: number;
  w: number;
  h: number;
  lit: boolean;
  color: string;
  flickerRate: number;
  lastFlicker: number;
}

interface Sign {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  glow: number;
  flickerRate: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

const NEON_COLORS = [
  "#ff00ff", "#00ffff", "#ff0080", "#00ff88",
  "#ff6600", "#8800ff", "#00ccff", "#ff0044",
  "#ffcc00", "#44ff00",
];

const SIGNS_TEXT = [
  "食堂", "酒吧", "NEON", "CYBER", "市场",
  "TECH", "電子", "ZONE", "科技", "NEXUS",
  "情報", "DATA", "NET", "SYN", "FLUX",
];

function randomColor() {
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
}

function createBuilding(x: number, canvasH: number, tier: number): Building {
  const width = 60 + Math.random() * 80;
  const height = (120 + Math.random() * 380) * (tier === 0 ? 1.2 : tier === 1 ? 1 : 0.7);
  const depth = 20 + Math.random() * 30;
  const color = `hsl(${220 + Math.random() * 40}, 20%, ${6 + Math.random() * 8}%)`;

  const windows: Window3D[] = [];
  const cols = Math.floor(width / 18);
  const rows = Math.floor(height / 20);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.15) {
        windows.push({
          x: c * 18 + 6,
          y: r * 20 + 8,
          w: 10,
          h: 12,
          lit: Math.random() > 0.3,
          color: Math.random() > 0.8 ? randomColor() : `hsl(${40 + Math.random() * 30}, 80%, 70%)`,
          flickerRate: 0.001 + Math.random() * 0.005,
          lastFlicker: Math.random() * 1000,
        });
      }
    }
  }

  const signs: Sign[] = [];
  const signCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < signCount; i++) {
    signs.push({
      x: Math.random() * (width - 40) + 10,
      y: Math.random() * (height * 0.7) + height * 0.1,
      text: SIGNS_TEXT[Math.floor(Math.random() * SIGNS_TEXT.length)],
      color: randomColor(),
      size: 10 + Math.random() * 14,
      glow: 8 + Math.random() * 16,
      flickerRate: Math.random() * 0.02,
    });
  }

  return { x, width, height, depth, color, windows, signs, tier };
}

function createRain(canvas: HTMLCanvasElement): RainDrop[] {
  const drops: RainDrop[] = [];
  for (let i = 0; i < 200; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 8 + Math.random() * 12,
      length: 15 + Math.random() * 25,
      opacity: 0.1 + Math.random() * 0.3,
    });
  }
  return drops;
}

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const buildingsRef = useRef<Building[]>([]);
  const rainRef = useRef<RainDrop[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      buildingsRef.current = generateCity(canvas.width, canvas.height);
      rainRef.current = createRain(canvas);
    };

    const generateCity = (w: number, h: number): Building[] => {
      const buildings: Building[] = [];
      // Background tier (far)
      let bx = -60;
      while (bx < w + 60) {
        buildings.push(createBuilding(bx, h, 2));
        bx += 50 + Math.random() * 60;
      }
      // Mid tier
      bx = -40;
      while (bx < w + 40) {
        buildings.push(createBuilding(bx, h, 1));
        bx += 70 + Math.random() * 70;
      }
      // Front tier
      bx = -30;
      while (bx < w + 30) {
        buildings.push(createBuilding(bx, h, 0));
        bx += 90 + Math.random() * 80;
      }
      return buildings;
    };

    resize();
    window.addEventListener("resize", resize);

    const spawnParticle = () => {
      const c = canvas;
      particlesRef.current.push({
        x: Math.random() * c.width,
        y: c.height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(0.5 + Math.random() * 2),
        life: 1,
        maxLife: 100 + Math.random() * 200,
        color: randomColor(),
        size: 1 + Math.random() * 2,
      });
    };

    const drawGround = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const groundY = h * 0.75;
      const grad = ctx.createLinearGradient(0, groundY, 0, h);
      grad.addColorStop(0, "#0a0a14");
      grad.addColorStop(1, "#05050e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Wet road reflections
      const reflect = ctx.createLinearGradient(0, groundY, 0, h);
      reflect.addColorStop(0, "rgba(0,200,255,0.06)");
      reflect.addColorStop(0.5, "rgba(255,0,128,0.04)");
      reflect.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = reflect;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Road lines
      ctx.strokeStyle = "rgba(0,200,255,0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = groundY + (h - groundY) * (i / 5) * 0.8 + 10;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Neon puddle reflections
      const colors = ["#ff00ff", "#00ffff", "#ff0080"];
      colors.forEach((c, i) => {
        const rx = w * 0.2 + i * w * 0.25 + Math.sin(t * 0.001 + i) * 20;
        const ry = groundY + 30 + i * 20;
        const rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, 80);
        rg.addColorStop(0, c.replace(")", ",0.15)").replace("rgb", "rgba").replace("#", "rgba(").replace("rgba(ff00ff", "rgba(255,0,255").replace("rgba(00ffff", "rgba(0,255,255").replace("rgba(ff0080", "rgba(255,0,128"));
        // simpler approach:
        ctx.save();
        ctx.globalAlpha = 0.08 + Math.sin(t * 0.002 + i) * 0.03;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 80 + Math.sin(t * 0.001) * 10, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const drawBuilding = (ctx: CanvasRenderingContext2D, b: Building, h: number, t: number) => {
      const groundY = h * 0.75;
      const by = groundY - b.height;
      const scale = b.tier === 2 ? 0.6 : b.tier === 1 ? 0.8 : 1;
      const alpha = b.tier === 2 ? 0.5 : b.tier === 1 ? 0.75 : 1;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Side face (3D depth)
      ctx.fillStyle = `hsl(220, 15%, ${3 + b.tier * 2}%)`;
      ctx.beginPath();
      ctx.moveTo(b.x + b.width, by);
      ctx.lineTo(b.x + b.width + b.depth * scale, by - b.depth * 0.4 * scale);
      ctx.lineTo(b.x + b.width + b.depth * scale, groundY - b.depth * 0.4 * scale);
      ctx.lineTo(b.x + b.width, groundY);
      ctx.closePath();
      ctx.fill();

      // Top face
      ctx.fillStyle = `hsl(220, 20%, ${5 + b.tier * 2}%)`;
      ctx.beginPath();
      ctx.moveTo(b.x, by);
      ctx.lineTo(b.x + b.width, by);
      ctx.lineTo(b.x + b.width + b.depth * scale, by - b.depth * 0.4 * scale);
      ctx.lineTo(b.x + b.depth * scale, by - b.depth * 0.4 * scale);
      ctx.closePath();
      ctx.fill();

      // Main facade
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, by, b.width, b.height);

      // Facade gradient overlay
      const faceGrad = ctx.createLinearGradient(b.x, by, b.x + b.width, by);
      faceGrad.addColorStop(0, "rgba(0,200,255,0.03)");
      faceGrad.addColorStop(0.5, "rgba(0,0,0,0)");
      faceGrad.addColorStop(1, "rgba(255,0,128,0.03)");
      ctx.fillStyle = faceGrad;
      ctx.fillRect(b.x, by, b.width, b.height);

      // Windows
      b.windows.forEach((win) => {
        if (t - win.lastFlicker > 1000 / win.flickerRate) {
          if (Math.random() > 0.97) win.lit = !win.lit;
          win.lastFlicker = t;
        }
        if (!win.lit) return;
        const wx = b.x + win.x;
        const wy = by + win.y;
        ctx.save();
        ctx.shadowColor = win.color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = win.color;
        ctx.globalAlpha = alpha * (0.6 + Math.sin(t * 0.003 + wx) * 0.1);
        ctx.fillRect(wx, wy, win.w, win.h);
        ctx.restore();
      });

      // Neon signs
      b.signs.forEach((sign) => {
        const flicker = Math.sin(t * sign.flickerRate * 100) > -0.3 ? 1 : 0.1;
        const sx = b.x + sign.x;
        const sy = by + sign.y;
        ctx.save();
        ctx.shadowColor = sign.color;
        ctx.shadowBlur = sign.glow * flicker;
        ctx.fillStyle = sign.color;
        ctx.globalAlpha = alpha * flicker * (0.85 + Math.sin(t * 0.002 + sx) * 0.15);
        ctx.font = `bold ${sign.size * scale}px Orbitron, monospace`;
        ctx.fillText(sign.text, sx, sy);
        // Double glow layer
        ctx.shadowBlur = sign.glow * 2 * flicker;
        ctx.globalAlpha = alpha * flicker * 0.3;
        ctx.fillText(sign.text, sx, sy);
        ctx.restore();
      });

      // Edge neon strip
      const edgeColor = randomColor();
      ctx.save();
      ctx.shadowColor = b.tier === 0 ? "#00ffff" : "#ff00ff";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = b.tier === 0 ? "rgba(0,255,255,0.4)" : "rgba(255,0,255,0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, by, b.width, b.height);
      ctx.restore();

      ctx.restore();
    };

    const drawRain = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.save();
      ctx.strokeStyle = "rgba(150,200,255,0.25)";
      ctx.lineWidth = 0.8;
      rainRef.current.forEach((drop) => {
        ctx.globalAlpha = drop.opacity;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.length * 0.15, drop.y + drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        drop.x -= drop.speed * 0.15;
        if (drop.y > h) {
          drop.y = -drop.length;
          drop.x = Math.random() * w;
        }
      });
      ctx.restore();
    };

    const drawParticles = (ctx: CanvasRenderingContext2D) => {
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / p.maxLife;
        ctx.save();
        ctx.globalAlpha = p.life * 0.8;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const drawAtmosphere = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      // Fog layers
      const fogGrad = ctx.createLinearGradient(0, h * 0.4, 0, h * 0.78);
      fogGrad.addColorStop(0, "rgba(0,0,20,0)");
      fogGrad.addColorStop(0.7, "rgba(0,10,30,0.4)");
      fogGrad.addColorStop(1, "rgba(0,5,20,0.7)");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, h * 0.4, w, h * 0.4);

      // Scan line effect
      ctx.save();
      ctx.globalAlpha = 0.03;
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = y % 6 === 0 ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)";
        ctx.fillRect(0, y, w, 1);
      }
      ctx.restore();

      // Vignette
      const vign = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8);
      vign.addColorStop(0, "rgba(0,0,0,0)");
      vign.addColorStop(1, "rgba(0,0,20,0.7)");
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, w, h);
    };

    const drawSky = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.78);
      sky.addColorStop(0, "#000005");
      sky.addColorStop(0.3, "#02000f");
      sky.addColorStop(0.7, "#05001a");
      sky.addColorStop(1, "#080020");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Stars
      ctx.save();
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 137.5 + t * 0.005) % w);
        const sy = (i * 71.3) % (h * 0.45);
        const sa = 0.3 + Math.sin(t * 0.002 + i) * 0.2;
        ctx.globalAlpha = sa;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.restore();

      // Distant glow on horizon
      const horizGrad = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.78);
      horizGrad.addColorStop(0, "rgba(255,0,128,0.08)");
      horizGrad.addColorStop(0.5, "rgba(0,128,255,0.06)");
      horizGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = horizGrad;
      ctx.fillRect(0, h * 0.45, w, h * 0.33);

      // Moon / light source
      const moonX = w * 0.82;
      const moonY = h * 0.12;
      ctx.save();
      ctx.shadowColor = "#88aaff";
      ctx.shadowBlur = 40;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "#c0d8ff";
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 80;
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#8899ff";
      ctx.beginPath();
      ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawHUD = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      ctx.save();
      ctx.font = "700 11px Orbitron, monospace";
      ctx.fillStyle = "#00ffff";
      ctx.globalAlpha = 0.7;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 10;

      const sec = Math.floor(t / 1000);
      const min = Math.floor(sec / 60).toString().padStart(2, "0");
      const s = (sec % 60).toString().padStart(2, "0");

      ctx.fillText(`НЕЙРО-ГОРОД v2.0  ${min}:${s}`, 20, 28);
      ctx.fillText(`КАДР: ${Math.floor(t / 16).toString().padStart(6, "0")}`, w - 200, 28);

      // Corner decorations
      const corners = [[0, 0], [w, 0], [0, h], [w, h]];
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 1.5;
      corners.forEach(([cx, cy]) => {
        const sx = cx === 0 ? 10 : w - 10;
        const sy = cy === 0 ? 10 : h - 10;
        const dx = cx === 0 ? 1 : -1;
        const dy = cy === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + dx * 30, sy);
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + dy * 30);
        ctx.stroke();
      });

      ctx.restore();
    };

    const loop = (timestamp: number) => {
      const t = timestamp;
      timeRef.current = t;

      const w = canvas.width;
      const h = canvas.height;

      // Spawn particles
      if (Math.random() > 0.85) spawnParticle();

      ctx.clearRect(0, 0, w, h);

      drawSky(ctx, w, h, t);
      drawGround(ctx, w, h, t);

      // Sort buildings by tier (far to near)
      const sorted = [...buildingsRef.current].sort((a, b) => a.tier - b.tier);
      sorted.forEach((b) => drawBuilding(ctx, b, h, t));

      drawRain(ctx, w, h);
      drawParticles(ctx);
      drawAtmosphere(ctx, w, h, t);
      drawHUD(ctx, w, h, t);

      setElapsed(Math.floor(t / 1000));
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000005",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Orbitron', monospace",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {/* Title overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: "clamp(28px, 5vw, 64px)",
            fontWeight: 900,
            letterSpacing: "0.15em",
            background: "linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #ff0080 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 30px rgba(0,255,255,0.5))",
            marginBottom: "8px",
            textTransform: "uppercase",
          }}
        >
          НЕЙРО СИТИ
        </div>
        <div
          style={{
            fontSize: "clamp(10px, 1.5vw, 14px)",
            color: "rgba(0,255,255,0.6)",
            letterSpacing: "0.4em",
            textShadow: "0 0 10px #00ffff",
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 300,
          }}
        >
          КИБЕРПАНК · {minutes}:{seconds} · АНИМАЦИЯ
        </div>
      </div>

      {/* Side info panels */}
      <div
        style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          pointerEvents: "none",
        }}
      >
        {["ДОЖДЬ: 78%", "ТУМАН: ВКЛ", "НЕОН: 100%", "НОЧЬ: 03:47"].map((item, i) => (
          <div
            key={i}
            style={{
              fontSize: "9px",
              color: i % 2 === 0 ? "#00ffff" : "#ff00ff",
              textShadow: i % 2 === 0 ? "0 0 8px #00ffff" : "0 0 8px #ff00ff",
              letterSpacing: "0.2em",
              opacity: 0.7,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
