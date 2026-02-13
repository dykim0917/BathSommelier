// --- Bath Environment ---
export type BathEnvironment = 'bathtub' | 'footbath' | 'shower';

// --- Recommendation Modes ---
export type RecommendationMode = 'care' | 'trip';

// --- Theme Catalog (Trip mode) ---
export type ThemeId =
  | 'kyoto_forest'
  | 'rainy_camping'
  | 'midnight_paris'
  | 'nordic_sauna'
  | 'desert_onsen'
  | 'ocean_dawn'
  | 'tea_house'
  | 'snow_cabin';

export type ThemeCoverStyleId =
  | 'kyoto'
  | 'rain'
  | 'paris'
  | 'nordic'
  | 'desert'
  | 'ocean'
  | 'tea'
  | 'snow';

// --- Health Conditions (Fixed Profile) ---
export type HealthCondition =
  | 'hypertension_heart'
  | 'pregnant'
  | 'diabetes'
  | 'sensitive_skin'
  | 'none';

// --- Daily Condition Tags ---
export type PhysicalTag =
  | 'muscle_pain'
  | 'swelling'
  | 'cold'
  | 'menstrual_pain'
  | 'hangover';

export type MentalTag = 'insomnia' | 'stress' | 'depression';

export type DailyTag = PhysicalTag | MentalTag;

// --- User Profile (persisted) ---
export interface UserProfile {
  bathEnvironment: BathEnvironment;
  healthConditions: HealthCondition[];
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Persona Codes ---
export type PersonaCode =
  | 'P1_SAFETY'
  | 'P2_CIRCULATION'
  | 'P3_MUSCLE'
  | 'P4_SLEEP';

// --- Temperature Range ---
export interface TemperatureRange {
  min: number;
  max: number;
  recommended: number;
}

// --- Ingredient ---
export interface Ingredient {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  purchaseUrl?: string;
  contraindications: HealthCondition[];
}

// --- Music Track ---
export interface MusicTrack {
  id: string;
  title: string;
  filename: string;
  durationSeconds: number;
  persona: PersonaCode[];
}

// --- Ambience Track (ASMR / Nature sounds) ---
export interface AmbienceTrack {
  id: string;
  title: string;
  filename: string;
  durationSeconds: number;
  persona: PersonaCode[];
}

// --- Theme Preset ---
export interface ThemePreset {
  id: ThemeId;
  coverStyleId: ThemeCoverStyleId;
  title: string;
  subtitle: string;
  baseTemp: number;
  colorHex: string;
  recScent: string;
  musicId: MusicTrack['id'];
  ambienceId: AmbienceTrack['id'];
  defaultBathType: 'full' | 'half' | 'foot' | 'shower';
  recommendedEnvironment: BathEnvironment;
  durationMinutes: number | null;
  lighting: string;
}

// --- Feedback ---
export type BathFeedback = 'good' | 'bad' | null;

// --- Active Session (ephemeral) ---
export interface BathSession {
  recommendationId: string;
  startedAt: string;
  completedAt?: string;
  feedback?: BathFeedback;
  actualDurationSeconds?: number;
}

// --- Bath Recommendation Output ---
export interface BathRecommendation {
  id: string;
  mode: RecommendationMode;
  themeId?: ThemeId;
  themeTitle?: string;
  persona: PersonaCode;
  environmentUsed: BathEnvironment;
  bathType: 'full' | 'half' | 'foot' | 'shower';
  temperature: TemperatureRange;
  durationMinutes: number | null;
  ingredients: Ingredient[];
  music: MusicTrack;
  ambience: AmbienceTrack;
  lighting: string;
  safetyWarnings: string[];
  colorHex: string;
  createdAt: string;
  feedback?: BathFeedback;
}

// --- Safety Rule ---
export interface SafetyRule {
  condition: HealthCondition | DailyTag;
  maxTemp?: number;
  bannedIngredientIds?: string[];
  forcedBathType?: BathRecommendation['bathType'];
  warningMessage: string;
  severity: 'block' | 'warn';
}
