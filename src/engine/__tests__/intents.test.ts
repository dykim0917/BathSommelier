import {
  CARE_INTENT_CARDS,
  CARE_SUBPROTOCOL_OPTIONS,
  TRIP_INTENT_CARDS,
  TRIP_SUBPROTOCOL_OPTIONS,
} from '@/src/data/intents';

describe('intents data integrity', () => {
  test('all care cards have 1~3 subprotocol options and default option exists', () => {
    CARE_INTENT_CARDS.forEach((card) => {
      const options = CARE_SUBPROTOCOL_OPTIONS[card.intent_id] ?? [];
      expect(options.length).toBeGreaterThanOrEqual(1);
      expect(options.length).toBeLessThanOrEqual(3);
      expect(options.some((option) => option.id === card.default_subprotocol_id)).toBe(true);
      expect(options.filter((option) => option.is_default).length).toBe(1);
    });
  });

  test('all trip cards have 1~3 subprotocol options and default option exists', () => {
    TRIP_INTENT_CARDS.forEach((card) => {
      const options = TRIP_SUBPROTOCOL_OPTIONS[card.intent_id] ?? [];
      expect(options.length).toBeGreaterThanOrEqual(1);
      expect(options.length).toBeLessThanOrEqual(3);
      expect(options.some((option) => option.id === card.default_subprotocol_id)).toBe(true);
      expect(options.filter((option) => option.is_default).length).toBe(1);
    });
  });
});
