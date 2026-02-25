// --- Bath Environment ---
// `footbath` is kept for backward compatibility with existing stored/profile values.
export type BathEnvironment = 'bathtub' | 'shower' | 'partial_bath' | 'footbath';
export type CanonicalBathEnvironment = 'bathtub' | 'shower' | 'partial_bath';
export type PartialBathSubtype = 'low_leg' | 'footbath';

// --- Home Orchestration ---
export type ActiveState =
  | 'tension'
  | 'heavy'
  | 'cant_sleep'
  | 'low_mood'
  | 'want_reset';

export type TimeContext = 'late_night' | 'morning' | 'day' | 'evening';
export type HomeModeType = 'sleep' | 'recovery' | 'reset';
export type PriorityResolution = 'CARE_PRIMARY__TRIP_SECONDARY';
export type HomeSuggestionRank = 'primary' | 'secondary_1' | 'secondary_2';
export type FallbackStrategy =
  | 'none'
  | 'DEFAULT_STARTER_RITUAL'
  | 'SAFE_ROUTINE_ONLY'
  | 'RESET_WITHOUT_COLD'
  | 'ROUTINE_ONLY_NO_COMMERCE';

export interface HomeSuggestion {
  id: string;
  rank: HomeSuggestionRank;
  mode: RecommendationMode;
  title: string;
  subtitle: string;
  dailyTags?: DailyTag[];
  themeId?: ThemeId;
}

export interface SuggestionExplanation {
  stateLabel: string;
  whySummary: string;
  routineParams: string;
  expectedGoal: string;
  alternativeRoutine: string;
  narrativeHeadline?: string;
  atmosphereChips?: string[];
}

export interface HomeOrchestrationContract {
  todaySignal: string;
  baseMode: HomeModeType;
  selectedMode: HomeModeType;
  engineConflictResolved: boolean;
  primarySuggestion: HomeSuggestion;
  secondarySuggestions: HomeSuggestion[];
  quickActions: string[];
  insightStrip: string;
  fallbackStrategy: FallbackStrategy;
  priorityResolution: PriorityResolution;
}

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

export interface CompletionSnapshot {
  recommendationId: string;
  completedAt: string;
  mode: RecommendationMode;
  environment: BathEnvironment;
  temperatureRecommended: number;
  durationMinutes: number | null;
  feedback: BathFeedback;
}

export interface TripMemoryRecord {
  recommendationId: string;
  themeId: ThemeId | null;
  themeTitle: string | null;
  completionSnapshot: CompletionSnapshot;
  themePreferenceWeight: number;
  narrativeRecallCard: string;
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
