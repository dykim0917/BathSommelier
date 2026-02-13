// --- Bath Environment ---
export type BathEnvironment = 'bathtub' | 'footbath' | 'shower';

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

// --- Bath Recommendation Output ---
export interface BathRecommendation {
  id: string;
  persona: PersonaCode;
  bathType: 'full' | 'half' | 'foot' | 'shower';
  temperature: TemperatureRange;
  durationMinutes: number | null;
  ingredients: Ingredient[];
  music: MusicTrack;
  lighting: string;
  safetyWarnings: string[];
  colorHex: string;
  createdAt: string;
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
