import { resolveConflicts } from '../conflicts';
import { PERSONA_DEFINITIONS } from '../personas';

const P2 = PERSONA_DEFINITIONS.find((p) => p.code === 'P2_CIRCULATION')!;
const P3 = PERSONA_DEFINITIONS.find((p) => p.code === 'P3_MUSCLE')!;
const P4 = PERSONA_DEFINITIONS.find((p) => p.code === 'P4_SLEEP')!;

describe('Conflict Resolution', () => {
  test('single persona returns unmodified parameters', () => {
    const result = resolveConflicts([P3]);

    expect(result.temperature.recommended).toBe(41);
    expect(result.temperature.min).toBe(40);
    expect(result.temperature.max).toBe(42);
    expect(result.durationMinutes).toBe(15);
    expect(result.mergedIngredientIds).toEqual(['epsom_salt', 'peppermint_oil']);
    expect(result.primaryPersona.code).toBe('P3_MUSCLE');
  });

  test('muscle_pain + insomnia: lowest temp wins (Safety First)', () => {
    // P3_MUSCLE: recommended=41, P4_SLEEP: recommended=37
    const result = resolveConflicts([P3, P4]);

    expect(result.temperature.recommended).toBe(37); // lowest wins
    expect(result.temperature.max).toBe(38); // min of max values (42, 38) = 38
  });

  test('conflict takes shortest duration', () => {
    // P3=15min, P4=20min
    const result = resolveConflicts([P3, P4]);
    expect(result.durationMinutes).toBe(15);
  });

  test('merged ingredients are deduplicated', () => {
    const result = resolveConflicts([P3, P4]);
    const uniqueIds = new Set(result.mergedIngredientIds);
    expect(result.mergedIngredientIds.length).toBe(uniqueIds.size);
    expect(result.mergedIngredientIds).toContain('epsom_salt');
    expect(result.mergedIngredientIds).toContain('peppermint_oil');
    expect(result.mergedIngredientIds).toContain('lavender_oil');
    expect(result.mergedIngredientIds).toContain('hinoki_oil');
  });

  test('primary persona is the one with highest priority (lowest number)', () => {
    // P3 priority=1, P4 priority=1, P2 priority=2
    const result = resolveConflicts([P2, P4]);
    // P4 has priority 1 which is lower than P2's priority 2
    expect(result.primaryPersona.code).toBe('P4_SLEEP');
  });

  test('P2 + P3: lowest temp wins', () => {
    // P2: recommended=39, P3: recommended=41
    const result = resolveConflicts([P2, P3]);
    expect(result.temperature.recommended).toBe(39);
  });

  test('three personas: takes lowest of all', () => {
    const result = resolveConflicts([P2, P3, P4]);
    // P2=39, P3=41, P4=37 → lowest is 37
    expect(result.temperature.recommended).toBe(37);
    // Duration: min(20, 15, 20) = 15
    expect(result.durationMinutes).toBe(15);
  });

  test('throws error when no personas provided', () => {
    expect(() => resolveConflicts([])).toThrow();
  });

  test('null duration is handled (persona with no limit)', () => {
    const P1 = PERSONA_DEFINITIONS.find((p) => p.code === 'P1_SAFETY')!;
    // P1 has durationMinutes=null
    const result = resolveConflicts([P1]);
    expect(result.durationMinutes).toBeNull();
  });

  test('null + number duration: takes the number', () => {
    const P1 = PERSONA_DEFINITIONS.find((p) => p.code === 'P1_SAFETY')!;
    // P1=null, P4=20 → should take 20
    const result = resolveConflicts([P1, P4]);
    expect(result.durationMinutes).toBe(20);
  });
});
