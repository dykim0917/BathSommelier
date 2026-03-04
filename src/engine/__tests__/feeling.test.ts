import { describe, expect, test } from '@jest/globals';
import { inferFeelingBefore, mapFeedbackToFeelingAfter } from '../feeling';

describe('feeling mapping', () => {
  test('maps hangover to lowest before feeling', () => {
    expect(inferFeelingBefore('hangover_relief', 'care')).toBe(1);
  });

  test('maps recovery intents to 2', () => {
    expect(inferFeelingBefore('sleep_ready', 'care')).toBe(2);
    expect(inferFeelingBefore('muscle_relief', 'care')).toBe(2);
  });

  test('maps mood and trip intents to neutral 3', () => {
    expect(inferFeelingBefore('mood_lift', 'care')).toBe(3);
    expect(inferFeelingBefore('kyoto_forest', 'trip')).toBe(3);
  });

  test('maps feedback to after feeling score', () => {
    expect(mapFeedbackToFeelingAfter('good')).toBe(4);
    expect(mapFeedbackToFeelingAfter('bad')).toBe(2);
    expect(mapFeedbackToFeelingAfter(null)).toBe(3);
  });
});
