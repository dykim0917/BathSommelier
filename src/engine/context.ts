import { BathEnvironment, BathRecommendation, TemperatureRange } from './types';
import { ResolvedParameters } from './conflicts';

export interface ContextOverrides {
  bathType: BathRecommendation['bathType'];
  temperature: TemperatureRange;
  durationMinutes: number | null;
  additionalIngredientIds: string[];
  removedIngredientIds: string[];
}

/**
 * Adapts recommendation based on the user's bath environment.
 * - Bathtub: use persona's recommended bath type as-is
 * - Foot bath: force foot type, keep temp, recommend aroma oils
 * - Shower: force shower type, cap duration at 10min, recommend shower steamer
 */
export function applyContextBranch(
  resolved: ResolvedParameters,
  environment: BathEnvironment
): ContextOverrides {
  switch (environment) {
    case 'footbath':
      return {
        bathType: 'foot',
        temperature: { ...resolved.temperature },
        durationMinutes: resolved.durationMinutes,
        additionalIngredientIds: [],
        removedIngredientIds: [],
      };

    case 'shower':
      return {
        bathType: 'shower',
        temperature: { ...resolved.temperature },
        durationMinutes:
          resolved.durationMinutes !== null
            ? Math.min(resolved.durationMinutes, 10)
            : 10,
        additionalIngredientIds: ['shower_steamer', 'body_wash_relaxing'],
        removedIngredientIds: ['carbonated_bath', 'epsom_salt'],
      };

    case 'bathtub':
    default:
      return {
        bathType: resolved.primaryPersona.bathType,
        temperature: { ...resolved.temperature },
        durationMinutes: resolved.durationMinutes,
        additionalIngredientIds: [],
        removedIngredientIds: [],
      };
  }
}
