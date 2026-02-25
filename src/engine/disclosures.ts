import { FallbackStrategy, HealthCondition, HomeModeType } from './types';
import { copy } from '@/src/content/copy';

interface DisclosureInput {
  fallbackStrategy: FallbackStrategy;
  selectedMode: HomeModeType;
  healthConditions: HealthCondition[];
  engineConflictResolved?: boolean;
}

export function buildDisclosureLines(input: DisclosureInput): string[] {
  const lines: string[] = [...copy.disclosure.baseLines];

  if (input.fallbackStrategy === 'SAFE_ROUTINE_ONLY') {
    lines.push(copy.disclosure.safeOnly);
  }

  if (
    input.fallbackStrategy === 'RESET_WITHOUT_COLD' ||
    input.selectedMode === 'reset'
  ) {
    lines.push(copy.disclosure.coldWarning);
  }

  if (input.engineConflictResolved) {
    lines.push(copy.disclosure.conflictResolved);
  }

  if (input.healthConditions.includes('diabetes')) {
    lines.push(copy.disclosure.diabetesCaution);
  }

  return lines;
}
