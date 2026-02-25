import { buildDisclosureLines } from '../disclosures';

describe('disclosures', () => {
  test('includes base legal lines always', () => {
    const lines = buildDisclosureLines({
      fallbackStrategy: 'none',
      selectedMode: 'recovery',
      healthConditions: ['none'],
    });

    expect(lines[0]).toContain('의료 진단 또는 치료');
    expect(lines[1]).toContain('전문의 상담');
  });

  test('includes reset cold contraindication line when reset mode/fallback', () => {
    const lines = buildDisclosureLines({
      fallbackStrategy: 'RESET_WITHOUT_COLD',
      selectedMode: 'reset',
      healthConditions: ['none'],
    });

    expect(lines.some((line) => line.includes('냉수 샤워 금기군'))).toBe(true);
  });

  test('includes conflict resolution line when engine conflict resolved', () => {
    const lines = buildDisclosureLines({
      fallbackStrategy: 'none',
      selectedMode: 'sleep',
      healthConditions: ['none'],
      engineConflictResolved: true,
    });

    expect(lines.some((line) => line.includes('Primary 제안 1개'))).toBe(true);
  });
});
