import { trackRecommendationCardImpression } from '../events';

describe('analytics events', () => {
  beforeEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const basePayload = {
    user_id: 'u1',
    session_id: 's1',
    app_version: '1.0.0',
    locale: 'ko-KR',
    time_context: 'day' as const,
    environment: 'bathtub' as const,
    partial_bath_subtype: null,
    active_state: 'cant_sleep' as const,
    mode_type: 'sleep' as const,
    suggestion_id: 'suggestion_1',
    suggestion_rank: 'primary' as const,
    fallback_strategy_applied: 'none' as const,
    experiment_id: 'none',
    variant: 'default',
    ts: '2026-02-25T00:00:00.000Z',
    engine_source: 'care' as const,
  };

  test('does not warn when partial_bath_subtype is null', () => {
    trackRecommendationCardImpression(basePayload);

    expect(console.warn).not.toHaveBeenCalledWith(
      '[analytics] missing common_properties',
      expect.stringContaining('partial_bath_subtype')
    );
  });

  test('warns when required non-null property is missing', () => {
    trackRecommendationCardImpression({
      ...basePayload,
      suggestion_id: undefined as unknown as string,
    });

    expect(console.warn).toHaveBeenCalledWith(
      '[analytics] missing common_properties',
      expect.stringContaining('suggestion_id')
    );
  });
});
