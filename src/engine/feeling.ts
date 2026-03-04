import { FeelingScore, RecommendationMode } from './types';

export function inferFeelingBefore(
  intentId?: string,
  mode?: RecommendationMode
): FeelingScore {
  if (!intentId) return 3;

  if (intentId === 'hangover_relief') return 1;

  if (
    [
      'sleep_ready',
      'muscle_relief',
      'edema_relief',
      'cold_relief',
      'menstrual_relief',
      'stress_relief',
    ].includes(intentId)
  ) {
    return 2;
  }

  if (intentId === 'mood_lift') return 3;

  if (
    mode === 'trip' ||
    ['kyoto_forest', 'nordic_sauna', 'rainy_camping', 'snow_cabin'].includes(
      intentId
    )
  ) {
    return 3;
  }

  return 3;
}

export function mapFeedbackToFeelingAfter(
  feedback: 'good' | 'bad' | null
): FeelingScore {
  if (feedback === 'good') return 4;
  if (feedback === 'bad') return 2;
  return 3;
}
