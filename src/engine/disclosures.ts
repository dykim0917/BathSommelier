import { FallbackStrategy, HealthCondition, HomeModeType } from './types';

interface DisclosureInput {
  fallbackStrategy: FallbackStrategy;
  selectedMode: HomeModeType;
  healthConditions: HealthCondition[];
  engineConflictResolved?: boolean;
}

export function buildDisclosureLines(input: DisclosureInput): string[] {
  const lines: string[] = [
    'BathSommelier는 의료 진단 또는 치료 서비스를 제공하지 않습니다.',
    '개인 건강 상태에 따라 전문의 상담을 권장합니다.',
  ];

  if (input.fallbackStrategy === 'SAFE_ROUTINE_ONLY') {
    lines.push('고위험군 감지로 안전 루틴만 제공됩니다. 어지러움/심박 이상 시 즉시 중단하세요.');
  }

  if (
    input.fallbackStrategy === 'RESET_WITHOUT_COLD' ||
    input.selectedMode === 'reset'
  ) {
    lines.push('냉수 샤워 금기군(조절되지 않는 고혈압/부정맥/뇌혈관 병력)은 냉수 단계를 회피하세요.');
  }

  if (input.engineConflictResolved) {
    lines.push('엔진 충돌이 해소되어 Primary 제안 1개만 노출됩니다.');
  }

  if (input.healthConditions.includes('diabetes')) {
    lines.push('당뇨 사용자는 말초 감각 저하 가능성이 있어 온도 체감에 주의하세요.');
  }

  return lines;
}
