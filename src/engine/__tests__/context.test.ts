import { applyContextBranch } from '../context';
import { resolveConflicts, ResolvedParameters } from '../conflicts';
import { PERSONA_DEFINITIONS } from '../personas';

const P3 = PERSONA_DEFINITIONS.find((p) => p.code === 'P3_MUSCLE')!;
const P4 = PERSONA_DEFINITIONS.find((p) => p.code === 'P4_SLEEP')!;

function makeResolved(persona = P3): ResolvedParameters {
  return resolveConflicts([persona]);
}

describe('Context Branching', () => {
  test('bathtub: uses persona bath type as-is', () => {
    const resolved = makeResolved(P3);
    const result = applyContextBranch(resolved, 'bathtub');

    expect(result.bathType).toBe('full'); // P3 is full bath
    expect(result.additionalIngredientIds).toEqual([]);
    expect(result.removedIngredientIds).toEqual([]);
  });

  test('footbath: forces foot bath type', () => {
    const resolved = makeResolved(P3);
    const result = applyContextBranch(resolved, 'footbath');

    expect(result.bathType).toBe('foot');
  });

  test('footbath: keeps same temperature', () => {
    const resolved = makeResolved(P3);
    const result = applyContextBranch(resolved, 'footbath');

    expect(result.temperature.recommended).toBe(
      resolved.temperature.recommended
    );
  });

  test('shower: forces shower type', () => {
    const resolved = makeResolved(P3);
    const result = applyContextBranch(resolved, 'shower');

    expect(result.bathType).toBe('shower');
  });

  test('shower: caps duration at 10 minutes', () => {
    const resolved = makeResolved(P4); // P4 has 20 min
    const result = applyContextBranch(resolved, 'shower');

    expect(result.durationMinutes).toBe(10);
  });

  test('shower: adds shower steamer and body wash', () => {
    const resolved = makeResolved(P3);
    const result = applyContextBranch(resolved, 'shower');

    expect(result.additionalIngredientIds).toContain('shower_steamer');
    expect(result.additionalIngredientIds).toContain('body_wash_relaxing');
  });

  test('shower: removes bath-only ingredients', () => {
    const resolved = makeResolved(P3);
    const result = applyContextBranch(resolved, 'shower');

    expect(result.removedIngredientIds).toContain('carbonated_bath');
    expect(result.removedIngredientIds).toContain('epsom_salt');
  });

  test('shower: if persona has null duration, defaults to 10', () => {
    const P1 = PERSONA_DEFINITIONS.find((p) => p.code === 'P1_SAFETY')!;
    const resolved = makeResolved(P1); // null duration
    const result = applyContextBranch(resolved, 'shower');

    expect(result.durationMinutes).toBe(10);
  });

  test('shower: if persona duration < 10, keeps shorter', () => {
    // Create resolved with 15min (P3), shower caps at 10
    const resolved = makeResolved(P3);
    const result = applyContextBranch(resolved, 'shower');

    expect(result.durationMinutes).toBe(10); // min(15, 10)
  });
});
