import { applySafetyFilter, SafetyFilterResult } from '../safety';
import { UserProfile, DailyTag } from '../types';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    bathEnvironment: 'bathtub',
    healthConditions: ['none'],
    onboardingComplete: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('Safety Filter', () => {
  test('no conditions returns no restrictions', () => {
    const profile = makeProfile();
    const result = applySafetyFilter(profile, []);

    expect(result.maxTempCeiling).toBeNull();
    expect(result.bannedIngredientIds).toEqual([]);
    expect(result.forcedBathType).toBeNull();
    expect(result.warnings).toEqual([]);
  });

  test('hypertension caps temperature at 38°C', () => {
    const profile = makeProfile({
      healthConditions: ['hypertension_heart'],
    });
    const result = applySafetyFilter(profile, ['muscle_pain']);

    expect(result.maxTempCeiling).toBe(38);
  });

  test('pregnancy bans rosemary, peppermint, clary sage', () => {
    const profile = makeProfile({
      healthConditions: ['pregnant'],
    });
    const result = applySafetyFilter(profile, []);

    expect(result.bannedIngredientIds).toContain('rosemary_oil');
    expect(result.bannedIngredientIds).toContain('peppermint_oil');
    expect(result.bannedIngredientIds).toContain('clary_sage_oil');
  });

  test('pregnancy also caps temperature at 38°C', () => {
    const profile = makeProfile({
      healthConditions: ['pregnant'],
    });
    const result = applySafetyFilter(profile, []);

    expect(result.maxTempCeiling).toBe(38);
  });

  test('hangover forces foot bath type', () => {
    const profile = makeProfile();
    const result = applySafetyFilter(profile, ['hangover']);

    expect(result.forcedBathType).toBe('foot');
    expect(result.maxTempCeiling).toBe(38);
  });

  test('hangover shows warning message', () => {
    const profile = makeProfile();
    const result = applySafetyFilter(profile, ['hangover']);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('음주');
  });

  test('diabetes adds warning but no temp cap', () => {
    const profile = makeProfile({
      healthConditions: ['diabetes'],
    });
    const result = applySafetyFilter(profile, []);

    expect(result.maxTempCeiling).toBeNull();
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain('당뇨');
  });

  test('sensitive skin adds warning', () => {
    const profile = makeProfile({
      healthConditions: ['sensitive_skin'],
    });
    const result = applySafetyFilter(profile, []);

    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain('민감성');
  });

  test('multiple conditions stack correctly', () => {
    const profile = makeProfile({
      healthConditions: ['hypertension_heart', 'pregnant'],
    });
    const result = applySafetyFilter(profile, []);

    // Both cap at 38, so ceiling should be 38
    expect(result.maxTempCeiling).toBe(38);
    // Pregnancy bans should be present
    expect(result.bannedIngredientIds).toContain('peppermint_oil');
    // Two warnings
    expect(result.warnings.length).toBe(2);
  });

  test('hypertension + hangover: temp capped and foot bath forced', () => {
    const profile = makeProfile({
      healthConditions: ['hypertension_heart'],
    });
    const result = applySafetyFilter(profile, ['hangover']);

    expect(result.maxTempCeiling).toBe(38);
    expect(result.forcedBathType).toBe('foot');
    expect(result.warnings.length).toBe(2);
  });

  test('banned ingredients are deduplicated', () => {
    const profile = makeProfile({
      healthConditions: ['pregnant'],
    });
    // Even if rules overlap, no duplicate bans
    const result = applySafetyFilter(profile, []);
    const uniqueBans = new Set(result.bannedIngredientIds);
    expect(result.bannedIngredientIds.length).toBe(uniqueBans.size);
  });
});
