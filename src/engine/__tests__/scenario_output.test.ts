import { generateCareRecommendation, generateTripRecommendation } from '../recommend';
import { UserProfile, BathEnvironment } from '../types';

function makeProfile(env: BathEnvironment, conditions: UserProfile['healthConditions']): UserProfile {
  const now = '2026-02-26T00:00:00.000Z';
  return { bathEnvironment: env, healthConditions: conditions, onboardingComplete: true, createdAt: now, updatedAt: now };
}

describe('SCENARIO OUTPUT — raw data', () => {
  it('builds all 8 persona outputs with stable policy invariants', () => {
    const results: Record<string, object> = {};
    // P01
    const p01 = generateCareRecommendation(makeProfile('bathtub', ['none']), ['muscle_pain'], 'bathtub');
    results['P01'] = { persona: p01.persona, bathType: p01.bathType, temp: p01.temperature, duration: p01.durationMinutes, ingredients: p01.ingredients.map(i => i.id), warnings: p01.safetyWarnings, lighting: p01.lighting, color: p01.colorHex };
    // P02
    const p02 = generateCareRecommendation(makeProfile('shower', ['pregnant']), ['insomnia'], 'shower');
    results['P02'] = { persona: p02.persona, bathType: p02.bathType, temp: p02.temperature, duration: p02.durationMinutes, ingredients: p02.ingredients.map(i => i.id), warnings: p02.safetyWarnings, lighting: p02.lighting, color: p02.colorHex };
    // P03
    const p03 = generateCareRecommendation(makeProfile('footbath', ['hypertension_heart']), ['cold', 'swelling'], 'footbath');
    results['P03'] = { persona: p03.persona, bathType: p03.bathType, temp: p03.temperature, duration: p03.durationMinutes, ingredients: p03.ingredients.map(i => i.id), warnings: p03.safetyWarnings, lighting: p03.lighting, color: p03.colorHex };
    // P04
    const p04 = generateCareRecommendation(makeProfile('bathtub', ['none']), ['hangover'], 'bathtub');
    results['P04'] = { persona: p04.persona, bathType: p04.bathType, temp: p04.temperature, duration: p04.durationMinutes, ingredients: p04.ingredients.map(i => i.id), warnings: p04.safetyWarnings, lighting: p04.lighting, color: p04.colorHex };
    // P05
    const p05 = generateCareRecommendation(makeProfile('partial_bath', ['sensitive_skin']), ['stress', 'insomnia'], 'partial_bath');
    results['P05'] = { persona: p05.persona, bathType: p05.bathType, temp: p05.temperature, duration: p05.durationMinutes, ingredients: p05.ingredients.map(i => i.id), warnings: p05.safetyWarnings, lighting: p05.lighting, color: p05.colorHex };
    // P06
    const p06 = generateCareRecommendation(makeProfile('bathtub', ['diabetes']), ['muscle_pain'], 'bathtub');
    results['P06'] = { persona: p06.persona, bathType: p06.bathType, temp: p06.temperature, duration: p06.durationMinutes, ingredients: p06.ingredients.map(i => i.id), warnings: p06.safetyWarnings, lighting: p06.lighting, color: p06.colorHex };
    // P07
    const p07 = generateCareRecommendation(makeProfile('shower', ['none']), ['swelling', 'muscle_pain'], 'shower');
    results['P07'] = { persona: p07.persona, bathType: p07.bathType, temp: p07.temperature, duration: p07.durationMinutes, ingredients: p07.ingredients.map(i => i.id), warnings: p07.safetyWarnings, lighting: p07.lighting, color: p07.colorHex };
    // P08
    const p08 = generateTripRecommendation(makeProfile('bathtub', ['hypertension_heart', 'diabetes']), 'kyoto_forest', 'bathtub');
    results['P08'] = { persona: p08.persona, bathType: p08.bathType, temp: p08.temperature, duration: p08.durationMinutes, ingredients: p08.ingredients.map(i => i.id), warnings: p08.safetyWarnings, lighting: p08.lighting, color: p08.colorHex, themeTitle: p08.themeTitle };

    expect(Object.keys(results)).toHaveLength(8);
    expect((results.P04 as any).persona).toBe('P1_SAFETY');
    expect((results.P06 as any).temp.recommended).toBeLessThanOrEqual(40);
    expect((results.P08 as any).temp.recommended).toBeLessThanOrEqual(38);
  });
});
