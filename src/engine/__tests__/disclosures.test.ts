import { buildDisclosureLines } from '../disclosures';
import { copy } from '@/src/content/copy';

describe('disclosures', () => {
  test('includes base legal lines always', () => {
    const lines = buildDisclosureLines({
      fallbackStrategy: 'none',
      selectedMode: 'recovery',
      healthConditions: ['none'],
    });

    expect(lines[0]).toContain(copy.disclosure.baseLines[0]);
    expect(lines[1]).toContain(copy.disclosure.baseLines[1]);
  });

  test('includes reset cold contraindication line when reset mode/fallback', () => {
    const lines = buildDisclosureLines({
      fallbackStrategy: 'RESET_WITHOUT_COLD',
      selectedMode: 'reset',
      healthConditions: ['none'],
    });

    expect(lines.some((line) => line.includes(copy.disclosure.coldWarning))).toBe(true);
  });

  test('includes conflict resolution line when engine conflict resolved', () => {
    const lines = buildDisclosureLines({
      fallbackStrategy: 'none',
      selectedMode: 'sleep',
      healthConditions: ['none'],
      engineConflictResolved: true,
    });

    expect(lines.some((line) => line.includes(copy.disclosure.conflictResolved))).toBe(true);
  });
});
