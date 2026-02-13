import {
  UserProfile,
  DailyTag,
  BathRecommendation,
  Ingredient,
} from './types';
import { PERSONA_DEFINITIONS, PersonaDefinition } from './personas';
import { applySafetyFilter, SafetyFilterResult } from './safety';
import { resolveConflicts } from './conflicts';
import { applyContextBranch } from './context';
import { INGREDIENTS } from '@/src/data/ingredients';
import { MUSIC_TRACKS } from '@/src/data/music';
import { PERSONA_COLORS } from '@/src/data/colors';

/**
 * Main recommendation pipeline:
 * UserProfile + DailyTag[] → Persona Selection → Safety Filter
 * → Conflict Resolution → Context Branch → BathRecommendation
 */
export function generateRecommendation(
  profile: UserProfile,
  dailyTags: DailyTag[]
): BathRecommendation {
  // Step 1: Safety filter
  const safety = applySafetyFilter(profile, dailyTags);

  // Step 2: Match personas from daily tags
  let matchedPersonas = matchPersonas(dailyTags);

  // Step 3: If safety requires P1 (hypertension forces safety persona)
  if (shouldForceSafetyPersona(profile, safety)) {
    matchedPersonas = [
      PERSONA_DEFINITIONS.find((p) => p.code === 'P1_SAFETY')!,
    ];
  }

  // Step 4: Fallback if no match → default to P4_SLEEP (general relaxation)
  if (matchedPersonas.length === 0) {
    matchedPersonas = [
      PERSONA_DEFINITIONS.find((p) => p.code === 'P4_SLEEP')!,
    ];
  }

  // Step 5: Resolve conflicts between matched personas
  const resolved = resolveConflicts(matchedPersonas);

  // Step 6: Apply safety ceiling to temperature
  if (safety.maxTempCeiling !== null) {
    resolved.temperature.max = Math.min(
      resolved.temperature.max,
      safety.maxTempCeiling
    );
    resolved.temperature.recommended = Math.min(
      resolved.temperature.recommended,
      safety.maxTempCeiling
    );
    resolved.temperature.min = Math.min(
      resolved.temperature.min,
      safety.maxTempCeiling
    );
  }

  // Step 7: Context branching (adapt to environment)
  const context = applyContextBranch(resolved, profile.bathEnvironment);

  // Override bath type if safety forces it
  if (safety.forcedBathType) {
    context.bathType = safety.forcedBathType;
  }

  // Step 8: Build ingredient list
  let ingredientIds = [
    ...resolved.mergedIngredientIds.filter(
      (id) => !context.removedIngredientIds.includes(id)
    ),
    ...context.additionalIngredientIds,
  ];

  // Remove banned ingredients (safety)
  ingredientIds = ingredientIds.filter(
    (id) => !safety.bannedIngredientIds.includes(id)
  );

  // Also filter by sensitive skin contraindication
  const ingredients = [...new Set(ingredientIds)]
    .map((id) => INGREDIENTS.find((i) => i.id === id))
    .filter((i): i is Ingredient => i !== undefined)
    .filter(
      (i) =>
        !i.contraindications.some((c) =>
          profile.healthConditions.includes(c)
        )
    );

  // Step 9: Select music track
  const music =
    MUSIC_TRACKS.find((t) =>
      t.persona.includes(resolved.primaryPersona.code)
    ) ?? MUSIC_TRACKS[0];

  // Step 10: Build final recommendation
  return {
    id: `rec_${Date.now()}`,
    persona: resolved.primaryPersona.code,
    bathType: context.bathType,
    temperature: context.temperature,
    durationMinutes: context.durationMinutes,
    ingredients,
    music,
    lighting: resolved.primaryPersona.lighting,
    safetyWarnings: safety.warnings,
    colorHex: PERSONA_COLORS[resolved.primaryPersona.code],
    createdAt: new Date().toISOString(),
  };
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
