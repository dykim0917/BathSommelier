import {
  UserProfile,
  DailyTag,
  BathRecommendation,
  Ingredient,
  BathEnvironment,
  ThemeId,
  PersonaCode,
} from './types';
import { PERSONA_DEFINITIONS, PersonaDefinition } from './personas';
import { applySafetyFilter, SafetyFilterResult } from './safety';
import { resolveConflicts } from './conflicts';
import { applyContextBranch, applyEnvironmentOverrides } from './context';
import { INGREDIENTS } from '@/src/data/ingredients';
import { MUSIC_TRACKS, AMBIENCE_TRACKS } from '@/src/data/music';
import { PERSONA_COLORS } from '@/src/data/colors';
import { THEME_BY_ID } from '@/src/data/themes';

export function generateRecommendation(
  profile: UserProfile,
  dailyTags: DailyTag[]
): BathRecommendation {
  return generateCareRecommendation(profile, dailyTags, profile.bathEnvironment);
}

export function generateCareRecommendation(
  profile: UserProfile,
  dailyTags: DailyTag[],
  environment: BathEnvironment
): BathRecommendation {
  const safety = applySafetyFilter(profile, dailyTags);

  let matchedPersonas = matchPersonas(dailyTags);
  if (shouldForceSafetyPersona(profile, safety)) {
    matchedPersonas = [
      PERSONA_DEFINITIONS.find((p) => p.code === 'P1_SAFETY')!,
    ];
  }
  if (matchedPersonas.length === 0) {
    matchedPersonas = [
      PERSONA_DEFINITIONS.find((p) => p.code === 'P4_SLEEP')!,
    ];
  }

  const resolved = resolveConflicts(matchedPersonas);
  applySafetyCeiling(resolved.temperature, safety);

  const context = applyContextBranch(
    {
      ...resolved,
      temperature: resolved.temperature,
    },
    environment
  );

  if (safety.forcedBathType) {
    context.bathType = safety.forcedBathType;
  }

  const ingredientIds = buildIngredientIds(
    resolved.mergedIngredientIds,
    context.additionalIngredientIds,
    context.removedIngredientIds,
    safety.bannedIngredientIds
  );

  const ingredients = resolveIngredients(profile, ingredientIds);

  const music =
    MUSIC_TRACKS.find((t) => t.persona.includes(resolved.primaryPersona.code)) ??
    MUSIC_TRACKS[0];

  const ambience =
    AMBIENCE_TRACKS.find((t) => t.persona.includes(resolved.primaryPersona.code)) ??
    AMBIENCE_TRACKS[0];

  return {
    id: `rec_${Date.now()}`,
    mode: 'care',
    persona: resolved.primaryPersona.code,
    environmentUsed: environment,
    bathType: context.bathType,
    temperature: context.temperature,
    durationMinutes: context.durationMinutes,
    ingredients,
    music,
    ambience,
    lighting: resolved.primaryPersona.lighting,
    safetyWarnings: safety.warnings,
    environmentHints: [],
    colorHex: PERSONA_COLORS[resolved.primaryPersona.code],
    createdAt: new Date().toISOString(),
  };
}

export function generateTripRecommendation(
  profile: UserProfile,
  themeId: ThemeId,
  environment: BathEnvironment
): BathRecommendation {
  const theme = THEME_BY_ID[themeId];
  const safety = applySafetyFilter(profile, []);

  const baseTemperature = {
    min: Math.max(35, theme.baseTemp - 1),
    max: theme.baseTemp + 1,
    recommended: theme.baseTemp,
  };

  applySafetyCeiling(baseTemperature, safety);

  const context = applyEnvironmentOverrides(
    {
      bathType: theme.defaultBathType,
      temperature: baseTemperature,
      durationMinutes: theme.durationMinutes,
    },
    environment
  );

  if (safety.forcedBathType) {
    context.bathType = safety.forcedBathType;
  }

  const persona = mapThemeToPersona(themeId);
  const ingredientIds = buildTripIngredientIds(theme.recScent, context);
  const ingredients = resolveIngredients(profile, ingredientIds);

  const music = MUSIC_TRACKS.find((track) => track.id === theme.musicId) ?? MUSIC_TRACKS[0];
  const ambience =
    AMBIENCE_TRACKS.find((track) => track.id === theme.ambienceId) ?? AMBIENCE_TRACKS[0];

  return {
    id: `rec_${Date.now()}`,
    mode: 'trip',
    themeId: theme.id,
    themeTitle: theme.title,
    persona,
    environmentUsed: environment,
    bathType: context.bathType,
    temperature: context.temperature,
    durationMinutes: context.durationMinutes,
    ingredients,
    music,
    ambience,
    lighting: theme.lighting,
    safetyWarnings: safety.warnings,
    environmentHints: [],
    colorHex: theme.colorHex,
    createdAt: new Date().toISOString(),
  };
}

function applySafetyCeiling(
  temperature: BathRecommendation['temperature'],
  safety: SafetyFilterResult
): void {
  if (safety.maxTempCeiling === null) return;
  temperature.max = Math.min(temperature.max, safety.maxTempCeiling);
  temperature.recommended = Math.min(
    temperature.recommended,
    safety.maxTempCeiling
  );
  temperature.min = Math.min(temperature.min, safety.maxTempCeiling);
}

function buildIngredientIds(
  mergedIngredientIds: string[],
  additionalIngredientIds: string[],
  removedIngredientIds: string[],
  bannedIngredientIds: string[]
): string[] {
  const ids = [
    ...mergedIngredientIds.filter((id) => !removedIngredientIds.includes(id)),
    ...additionalIngredientIds,
  ];

  return [...new Set(ids)].filter((id) => !bannedIngredientIds.includes(id));
}

function buildTripIngredientIds(
  scent: string,
  context: ReturnType<typeof applyEnvironmentOverrides>
): string[] {
  const scentMap: Record<string, string> = {
    히노끼: 'hinoki_oil',
    유칼립투스: 'eucalyptus_oil',
    로즈: 'lavender_oil',
    자작나무: 'chamomile_oil',
    샌달우드: 'marjoram_oil',
    시트러스: 'grapefruit_oil',
    베르가못: 'lavender_oil',
    시더우드: 'hinoki_oil',
  };

  return buildIngredientIds(
    [scentMap[scent] ?? 'lavender_oil'],
    context.additionalIngredientIds,
    context.removedIngredientIds,
    []
  );
}

function resolveIngredients(profile: UserProfile, ingredientIds: string[]): Ingredient[] {
  return ingredientIds
    .map((id) => INGREDIENTS.find((i) => i.id === id))
    .filter((i): i is Ingredient => i !== undefined)
    .filter(
      (i) =>
        !i.contraindications.some((c) =>
          profile.healthConditions.includes(c)
        )
    );
}

function matchPersonas(tags: DailyTag[]): PersonaDefinition[] {
  return PERSONA_DEFINITIONS.filter((persona) =>
    persona.triggerTags.some((trigger) => tags.includes(trigger))
  );
}

function shouldForceSafetyPersona(
  profile: UserProfile,
  _safety: SafetyFilterResult
): boolean {
  return profile.healthConditions.includes('hypertension_heart');
}

function mapThemeToPersona(themeId: ThemeId): PersonaCode {
  switch (themeId) {
    case 'rainy_camping':
    case 'nordic_sauna':
      return 'P2_CIRCULATION';
    case 'midnight_paris':
    case 'tea_house':
      return 'P4_SLEEP';
    case 'desert_onsen':
      return 'P3_MUSCLE';
    case 'ocean_dawn':
    case 'snow_cabin':
    case 'kyoto_forest':
    default:
      return 'P1_SAFETY';
  }
}
