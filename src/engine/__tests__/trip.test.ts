import { generateTripRecommendation } from '../recommend';
import { UserProfile } from '../types';

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

describe('Trip Recommendation', () => {
  test('returns trip mode metadata', () => {
    const profile = makeProfile();
    const result = generateTripRecommendation(profile, 'kyoto_forest', 'bathtub');

    expect(result.mode).toBe('trip');
    expect(result.themeId).toBe('kyoto_forest');
    expect(result.themeTitle).toBeTruthy();
    expect(result.environmentUsed).toBe('bathtub');
  });

  test('hypertension caps trip temperature at 38C', () => {
    const profile = makeProfile({
      healthConditions: ['hypertension_heart'],
    });
    const result = generateTripRecommendation(profile, 'rainy_camping', 'footbath');

    expect(result.temperature.recommended).toBeLessThanOrEqual(38);
    expect(result.temperature.max).toBeLessThanOrEqual(38);
    expect(result.safetyWarnings.length).toBeGreaterThan(0);
  });

  test('shower environment forces shower mode and max 10m', () => {
    const profile = makeProfile();
    const result = generateTripRecommendation(profile, 'midnight_paris', 'shower');

    expect(result.bathType).toBe('shower');
    expect(result.durationMinutes).toBeLessThanOrEqual(10);
  });
});
