import { ActiveState, BathEnvironment, FallbackStrategy, HomeSuggestionRank } from '@/src/engine/types';

interface CommonEventProperties {
  user_id: string;
  session_id: string;
  app_version: string;
  locale: string;
  time_context: 'late_night' | 'morning' | 'day' | 'evening';
  environment: BathEnvironment;
  partial_bath_subtype: 'low_leg' | 'footbath' | null;
  active_state: ActiveState;
  mode_type: 'sleep' | 'reset' | 'recovery' | 'trip';
  suggestion_id: string;
  suggestion_rank: HomeSuggestionRank;
  fallback_strategy_applied: FallbackStrategy;
  experiment_id: string;
  variant: string;
  ts: string;
}

export interface RecommendationCardEventPayload extends CommonEventProperties {
  engine_source: 'care' | 'trip';
}

export interface CommerceEventPayload extends CommonEventProperties {
  product_id: string;
  slot: 'A' | 'B' | 'C';
  price_tier: 'low' | 'mid' | 'high';
  sommelier_pick: boolean;
}

const REQUIRED_COMMON_KEYS: (keyof CommonEventProperties)[] = [
  'user_id',
  'session_id',
  'app_version',
  'locale',
  'time_context',
  'environment',
  'partial_bath_subtype',
  'active_state',
  'mode_type',
  'suggestion_id',
  'suggestion_rank',
  'fallback_strategy_applied',
  'experiment_id',
  'variant',
  'ts',
];

function validateCommonProperties(payload: CommonEventProperties): void {
  const missing = REQUIRED_COMMON_KEYS.filter((key) => payload[key] === undefined || payload[key] === null);
  if (missing.length > 0) {
    console.warn('[analytics] missing common_properties', missing.join(', '));
  }
}

function validateCommerceProperties(payload: CommerceEventPayload): void {
  validateCommonProperties(payload);
  if (!payload.product_id) {
    console.warn('[analytics] missing commerce property: product_id');
  }
}

function emit(eventName: string, payload: RecommendationCardEventPayload): void {
  validateCommonProperties(payload);
  if (__DEV__) {
    console.log(`[analytics] ${eventName}`, payload);
  }
}

function emitCommerce(eventName: string, payload: CommerceEventPayload): void {
  validateCommerceProperties(payload);
  if (__DEV__) {
    console.log(`[analytics] ${eventName}`, payload);
  }
}

export function trackRecommendationCardImpression(payload: RecommendationCardEventPayload): void {
  emit('recommendation_card_impression', payload);
}

export function trackRecommendationCardClick(payload: RecommendationCardEventPayload): void {
  emit('recommendation_card_click', payload);
}

export function trackRoutineStart(payload: RecommendationCardEventPayload): void {
  emit('routine_start', payload);
}

export function trackWhyExplainerExposed(payload: RecommendationCardEventPayload): void {
  emit('why_explainer_exposed', payload);
}

export function trackRoutineStartedAfterWhy(payload: RecommendationCardEventPayload): void {
  emit('routine_started_after_why', payload);
}

export function trackTripNarrativeEngaged(payload: RecommendationCardEventPayload): void {
  emit('trip_narrative_engaged', payload);
}

export function trackProductDetailView(payload: CommerceEventPayload): void {
  emitCommerce('product_detail_view', payload);
}

export function trackSommelierPickClick(payload: CommerceEventPayload): void {
  emitCommerce('sommelier_pick_click', payload);
}

export function trackAffiliateLinkClick(payload: CommerceEventPayload): void {
  emitCommerce('affiliate_link_click', payload);
}
