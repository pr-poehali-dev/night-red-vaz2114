import { Building, RainDrop, Window3D, Sign, NEON_COLORS, SIGNS_TEXT } from "./types";

export function randomColor() {
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
}

export function createBuilding(x: number, canvasH: number, tier: number): Building {
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

export function createRain(canvas: HTMLCanvasElement): RainDrop[] {
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

export function generateCity(w: number, h: number): Building[] {
  const buildings: Building[] = [];
  let bx = -60;
  while (bx < w + 60) {
    buildings.push(createBuilding(bx, h, 2));
    bx += 50 + Math.random() * 60;
  }
  bx = -40;
  while (bx < w + 40) {
    buildings.push(createBuilding(bx, h, 1));
    bx += 70 + Math.random() * 70;
  }
  bx = -30;
  while (bx < w + 30) {
    buildings.push(createBuilding(bx, h, 0));
    bx += 90 + Math.random() * 80;
  }
  return buildings;
}
