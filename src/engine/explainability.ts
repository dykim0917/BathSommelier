import { BathRecommendation } from './types';
import { copy } from '@/src/content/copy';

const BATH_TYPE_LABELS: Record<BathRecommendation['bathType'], string> = {
  full: '전신욕',
  half: '반신욕',
  foot: '족욕',
  shower: '샤워',
};

function formatDurationLabel(durationMinutes: number | null): string {
  if (durationMinutes === null) return '자유 시간';
  return `${durationMinutes}분`;
}

export function buildRecipeEvidenceLines(recommendation: BathRecommendation): {
  reasonLines: [string, string];
  safetyLine: string;
} {
  const reasonLine1 =
    recommendation.mode === 'trip'
      ? copy.routine.evidence.reasonTemplates.trip(
          recommendation.themeTitle ?? '오늘의'
        )
      : copy.routine.evidence.reasonTemplates.care(recommendation.persona);

  const reasonLine2 = copy.routine.evidence.reasonTemplates.params(
    BATH_TYPE_LABELS[recommendation.bathType],
    recommendation.temperature.recommended,
    formatDurationLabel(recommendation.durationMinutes)
  );

  const safetyLine =
    recommendation.safetyWarnings[0] ?? copy.routine.evidence.defaultSafety;

  return {
    reasonLines: [reasonLine1, reasonLine2],
    safetyLine,
  };
}
