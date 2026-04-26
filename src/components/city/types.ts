export interface Building {
  x: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  windows: Window3D[];
  signs: Sign[];
  tier: number;
}

export interface Window3D {
  x: number;
  y: number;
  w: number;
  h: number;
  lit: boolean;
  color: string;
  flickerRate: number;
  lastFlicker: number;
}

export interface Sign {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  glow: number;
  flickerRate: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

export const NEON_COLORS = [
  "#ff00ff", "#00ffff", "#ff0080", "#00ff88",
  "#ff6600", "#8800ff", "#00ccff", "#ff0044",
  "#ffcc00", "#44ff00",
];

export const SIGNS_TEXT = [
  "食堂", "酒吧", "NEON", "CYBER", "市场",
  "TECH", "電子", "ZONE", "科技", "NEXUS",
  "情報", "DATA", "NET", "SYN", "FLUX",
];
