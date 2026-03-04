import { copy } from '@/src/content/copy';

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

export function buildSafetyChecklist(warnings: string[]): string[] {
  const merged = warnings.join(' ').toLowerCase();
  const items: string[] = [];

  if (includesAny(merged, ['고혈압', '심장'])) {
    items.push('수온을 38°C 이하로 맞췄는지 확인하세요.');
    items.push('어지럼·두근거림이 느껴지면 즉시 중단하세요.');
  }

  if (includesAny(merged, ['임신'])) {
    items.push('자극 가능 오일이 제외되었는지 확인하세요.');
    items.push('10분 내 짧게 진행하고 무리하지 마세요.');
  }

  if (includesAny(merged, ['음주', '숙취'])) {
    items.push('전신욕 대신 미온수 족욕으로 진행하세요.');
    items.push('입욕 전후로 물을 충분히 마셔주세요.');
  }

  if (includesAny(merged, ['당뇨'])) {
    items.push('손목이나 온도계로 수온을 다시 확인하세요.');
    items.push('감각이 둔해졌다면 즉시 중단하세요.');
  }

  if (includesAny(merged, ['민감성'])) {
    items.push('자극 성분이 없는지 확인하고 진행하세요.');
    items.push('따가움이 느껴지면 즉시 헹궈주세요.');
  }

  if (items.length === 0) {
    items.push(...copy.routine.checklist.fallback);
  }

  return [...new Set(items)];
}
