import { PersonaDefinition } from './personas';
import { TemperatureRange } from './types';

export interface ResolvedParameters {
  temperature: TemperatureRange;
  durationMinutes: number | null;
  mergedIngredientIds: string[];
  primaryPersona: PersonaDefinition;
}

/**
 * Resolves conflicts when multiple personas are matched.
 * Safety First principle:
 * - Temperature: take the LOWEST recommended temp (not average)
 * - Duration: take the shortest
 * - Ingredients: merge all unique
 * - Primary persona: highest priority (lowest number)
 */
export function resolveConflicts(
  matchedPersonas: PersonaDefinition[]
): ResolvedParameters {
  if (matchedPersonas.length === 0) {
    throw new Error('No personas matched — this should never happen');
  }

  if (matchedPersonas.length === 1) {
    const p = matchedPersonas[0];
    return {
      temperature: { ...p.temperature },
      durationMinutes: p.durationMinutes,
      mergedIngredientIds: [...p.ingredientIds],
      primaryPersona: p,
    };
  }

  // Sort by priority (lower number = higher priority)
  const sorted = [...matchedPersonas].sort((a, b) => a.priority - b.priority);
  const primary = sorted[0];

  // Temperature: take the LOWEST recommended temp (Safety First)
  const lowestRecommended = Math.min(
    ...matchedPersonas.map((p) => p.temperature.recommended)
  );
  const minTemp = Math.min(...matchedPersonas.map((p) => p.temperature.min));
  const maxTemp = Math.min(
    ...matchedPersonas.map((p) => p.temperature.max)
  );

  // Duration: take the shorter duration (safety-first)
  const durations = matchedPersonas
    .map((p) => p.durationMinutes)
    .filter((d): d is number => d !== null);
  const durationMinutes = durations.length > 0 ? Math.min(...durations) : null;

  // Ingredients: merge all, deduplicate
  const mergedIngredientIds = [
    ...new Set(matchedPersonas.flatMap((p) => p.ingredientIds)),
  ];

  return {
    temperature: {
      min: minTemp,
      max: maxTemp,
      recommended: lowestRecommended,
    },
    durationMinutes,
    mergedIngredientIds,
    primaryPersona: primary,
  };
}
