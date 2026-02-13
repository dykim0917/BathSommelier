import { BathEnvironment, BathRecommendation, TemperatureRange } from './types';
import { ResolvedParameters } from './conflicts';

export interface ContextOverrides {
  bathType: BathRecommendation['bathType'];
  temperature: TemperatureRange;
  durationMinutes: number | null;
  additionalIngredientIds: string[];
  removedIngredientIds: string[];
}

export interface EnvironmentBase {
  bathType: BathRecommendation['bathType'];
  temperature: TemperatureRange;
  durationMinutes: number | null;
}

/**
 * Adapts recommendation based on the selected bath environment.
 * - bathtub: keep base values
 * - footbath: force foot bath
 * - shower: force shower, cap duration to 10 min, replace incompatible ingredients
 */
export function applyEnvironmentOverrides(
  base: EnvironmentBase,
  environment: BathEnvironment
): ContextOverrides {
  switch (environment) {
    case 'footbath':
      return {
        bathType: 'foot',
        temperature: { ...base.temperature },
        durationMinutes: base.durationMinutes,
        additionalIngredientIds: [],
        removedIngredientIds: [],
      };

    case 'shower':
      return {
        bathType: 'shower',
        temperature: { ...base.temperature },
        durationMinutes:
          base.durationMinutes !== null ? Math.min(base.durationMinutes, 10) : 10,
        additionalIngredientIds: ['shower_steamer', 'body_wash_relaxing'],
        removedIngredientIds: ['carbonated_bath', 'epsom_salt'],
      };

    case 'bathtub':
    default:
      return {
        bathType: base.bathType,
        temperature: { ...base.temperature },
        durationMinutes: base.durationMinutes,
        additionalIngredientIds: [],
        removedIngredientIds: [],
      };
  }
}

export function applyContextBranch(
  resolved: ResolvedParameters,
  environment: BathEnvironment
): ContextOverrides {
  return applyEnvironmentOverrides(
    {
      bathType: resolved.primaryPersona.bathType,
      temperature: resolved.temperature,
      durationMinutes: resolved.durationMinutes,
    },
    environment
  );
}
