import { describe, expect, test } from '@jest/globals';
import { toPersonaLabel } from '../personaLabel';

describe('toPersonaLabel', () => {
  test('maps known persona code to localized label', () => {
    expect(toPersonaLabel('P3_MUSCLE')).toBe('근육 케어');
  });

  test('returns fallback label for unknown persona code', () => {
    expect(toPersonaLabel('UNKNOWN_PERSONA')).toBe('맞춤 케어');
  });
});
