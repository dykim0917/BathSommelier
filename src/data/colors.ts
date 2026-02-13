import { PersonaCode } from '@/src/engine/types';

// === Persona Colors (Pastel) ===
export const PERSONA_COLORS: Record<PersonaCode, string> = {
  P1_SAFETY: '#86EFAC',
  P2_CIRCULATION: '#FDBA74',
  P3_MUSCLE: '#93C5FD',
  P4_SLEEP: '#C4B5FD',
} as const;

export const PERSONA_GRADIENTS: Record<PersonaCode, [string, string]> = {
  P1_SAFETY: ['#86EFAC', '#BBF7D0'],
  P2_CIRCULATION: ['#FDBA74', '#FED7AA'],
  P3_MUSCLE: ['#93C5FD', '#BFDBFE'],
  P4_SLEEP: ['#C4B5FD', '#DDD6FE'],
} as const;

// === Liquid Glass Base ===
export const BG = '#F2F0F7';
export const SURFACE = 'rgba(255,255,255,0.72)';
export const GLASS_BORDER = 'rgba(255,255,255,0.5)';
export const GLASS_SHADOW = 'rgba(0,0,0,0.06)';
export const OVERLAY = 'rgba(255,255,255,0.85)';

// === Text ===
export const TEXT_PRIMARY = '#1C1C1E';
export const TEXT_SECONDARY = '#6E6E73';

// === Accent ===
export const ACCENT = '#7C3AED';
export const ACCENT_LIGHT = '#EDE9FE';

// === Semantic ===
export const WARNING_COLOR = '#FF9F0A';
export const DANGER_COLOR = '#FF6B6B';

// === Legacy aliases (기존 import 호환) ===
export const DARK_BG = BG;
export const DARK_SURFACE = SURFACE;
export const DARK_CARD = SURFACE;
