import { PersonaCode } from '@/src/engine/types';

// === v3.2 Reference UI Palette ===
export const APP_BG_BASE = '#F6FAFF';
export const APP_BG_TOP = '#F2F7FF';
export const APP_BG_BOTTOM = '#F8EFF6';
export const APP_BLOOM_BLUE = 'rgba(120, 149, 207, 0.25)';
export const APP_BLOOM_PINK = 'rgba(248, 208, 208, 0.22)';

// === Cards / Surfaces ===
export const CARD_SURFACE = 'rgba(255,255,255,0.82)';
export const CARD_SURFACE_SOFT = 'rgba(255,255,255,0.74)';
export const CARD_BORDER = 'rgba(150, 170, 205, 0.28)';
export const CARD_BORDER_STRONG = 'rgba(103, 133, 184, 0.42)';
export const CARD_SHADOW = 'rgba(39, 62, 102, 0.12)';

// === Typography scale ===
export const TYPE_HEADING_LG = 30;
export const TYPE_HEADING_MD = 22;
export const TYPE_TITLE = 18;
export const TYPE_BODY = 14;
export const TYPE_CAPTION = 12;

export const TYPE_SCALE = {
  headingLg: TYPE_HEADING_LG,
  headingMd: TYPE_HEADING_MD,
  title: TYPE_TITLE,
  body: TYPE_BODY,
  caption: TYPE_CAPTION,
} as const;

// === Text ===
export const TEXT_PRIMARY = '#2A3E64';
export const TEXT_SECONDARY = '#617493';
export const TEXT_MUTED = '#8FA0BA';

// === Controls ===
export const BTN_PRIMARY = '#7895CF';
export const BTN_PRIMARY_TEXT = '#FDFEFF';
export const BTN_DISABLED = '#C8D4EA';
export const PILL_BG = 'rgba(255,255,255,0.78)';
export const PILL_BORDER = 'rgba(120,149,207,0.35)';
export const PILL_ACTIVE_BG = '#E6EEFB';

// === Accent / Semantic ===
export const ACCENT = '#7895CF';
export const ACCENT_LIGHT = '#ECF1FC';
export const WARNING_COLOR = '#F0A55C';
export const DANGER_COLOR = '#E96F7F';

// === Persona Colors (Pastel compatible) ===
export const PERSONA_COLORS: Record<PersonaCode, string> = {
  P1_SAFETY: '#8CB59C',
  P2_CIRCULATION: '#D6A77A',
  P3_MUSCLE: '#7FA0D8',
  P4_SLEEP: '#A89DDB',
} as const;

export const PERSONA_GRADIENTS: Record<PersonaCode, [string, string]> = {
  P1_SAFETY: ['#D8ECDE', '#A4C9B1'],
  P2_CIRCULATION: ['#F0D5BC', '#D7AD85'],
  P3_MUSCLE: ['#DCE6F8', '#9AB5E5'],
  P4_SLEEP: ['#E8E1F9', '#B9ACE6'],
} as const;

// === Compatibility aliases (keep old imports stable) ===
export const BG = APP_BG_BASE;
export const SURFACE = CARD_SURFACE;
export const GLASS_BORDER = CARD_BORDER;
export const GLASS_SHADOW = CARD_SHADOW;
export const OVERLAY = CARD_SURFACE_SOFT;

export const CARD_GLASS = CARD_SURFACE;
export const CARD_BORDER_SOFT = CARD_BORDER;
export const CARD_SHADOW_SOFT = CARD_SHADOW;

export const PASTEL_BG_TOP = APP_BG_TOP;
export const PASTEL_BG_BOTTOM = APP_BG_BOTTOM;
export const PASTEL_BLOOM_BLUE = APP_BLOOM_BLUE;
export const PASTEL_BLOOM_PINK = APP_BLOOM_PINK;

export const DARK_BG = APP_BG_BASE;
export const DARK_SURFACE = CARD_SURFACE;
export const DARK_CARD = CARD_SURFACE;
