import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import {
  BathEnvironment,
  BathRecommendation,
  DailyTag,
  FallbackStrategy,
  HomeModeType,
  HomeSuggestionRank,
  IntentCard,
  SubProtocolOption,
  ThemeId,
  TimeContext,
  UserProfile,
} from '@/src/engine/types';
import { generateCareRecommendation, generateTripRecommendation } from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { loadHistory, saveRecommendation } from '@/src/storage/history';
import { loadLastEnvironment, saveLastEnvironment } from '@/src/storage/environment';
import { SafetyWarning } from '@/src/components/SafetyWarning';
import {
  ACCENT,
  APP_BG_BASE,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
  WARNING_COLOR,
} from '@/src/data/colors';
import { CategoryCard } from '@/src/components/CategoryCard';
import { TripThemeCard } from '@/src/components/TripThemeCard';
import { CATEGORY_CARD_COLORS, CATEGORY_CARD_EMOJI } from '@/src/data/colors';
import {
  RecommendationCardEventPayload,
  trackIntentCardClick,
  trackIntentCardImpression,
  trackRoutineStart,
  trackRoutineStartAfterSubprotocol,
  trackSubprotocolModalOpen,
  trackSubprotocolSelected,
} from '@/src/analytics/events';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { buildDisclosureLines } from '@/src/engine/disclosures';
import { SubProtocolPickerModal } from '@/src/components/SubProtocolPickerModal';
import {
  CARE_INTENT_CARDS,
  CARE_SUBPROTOCOL_OPTIONS,
  getEnvironmentFitLabel,
  getEnvironmentSubtitle,
  getSectionOrderByContext,
  TRIP_INTENT_CARDS,
  TRIP_SUBPROTOCOL_OPTIONS,
} from '@/src/data/intents';
import { applySubProtocolOverrides } from '@/src/engine/subprotocol';
import { copy } from '@/src/content/copy';

const ENV_OPTIONS: { id: BathEnvironment; emoji: string; label: string }[] = [
  { id: 'bathtub', emoji: '🛁', label: '욕조' },
  { id: 'partial_bath', emoji: '🦶', label: '부분입욕' },
  { id: 'shower', emoji: '🚿', label: '샤워' },
];

const ENV_LABEL: Record<string, string> = {
  bathtub: '욕조',
  partial_bath: '부분입욕',
  shower: '샤워',
};

const SCREEN_HORIZONTAL_PADDING = 22;
const SECTION_GAP = 18;
const CARD_GAP = 12;
const CARD_MIN_HEIGHT_COMPACT = 126;
const CARD_MIN_HEIGHT_REGULAR = 142;
const HOME_PREVIEW_CARD_LIMIT = 4;

function getTimeContext(date = new Date()): TimeContext {
  const h = date.getHours();
  if (h >= 22 || h < 5) return 'late_night';
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 18) return 'day';
  return 'evening';
}

function normalizeEnvironmentInput(environment: BathEnvironment): 'bathtub' | 'partial_bath' | 'shower' {
  if (environment === 'footbath') return 'partial_bath';
  return environment;
}

function toEngineEnvironment(environment: BathEnvironment): BathEnvironment {
  if (environment === 'partial_bath') return 'footbath';
  return environment;
}

function buildRuntimeProfile(
  profile: UserProfile | null,
  environment: BathEnvironment
): UserProfile {
  const now = new Date().toISOString();
  if (profile) {
    return {
      ...profile,
      bathEnvironment: toEngineEnvironment(environment),
    };
  }

  return {
    bathEnvironment: toEngineEnvironment(environment),
    healthConditions: ['none'],
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
  };
}

function mapIntentToTags(intentId: string): DailyTag[] {
  switch (intentId) {
    case 'muscle_relief':
      return ['muscle_pain'];
    case 'sleep_ready':
      return ['insomnia'];
    case 'hangover_relief':
      return ['hangover'];
    case 'edema_relief':
      return ['swelling'];
    default:
      return ['stress'];
  }
}

function mapIntentToTheme(intentId: string): ThemeId {
  switch (intentId) {
    case 'kyoto_forest':
    case 'nordic_sauna':
    case 'rainy_camping':
    case 'snow_cabin':
      return intentId;
    default:
      return 'kyoto_forest';
  }
}

function mapIntentToActiveState(intentId: string): RecommendationCardEventPayload['active_state'] {
  switch (intentId) {
    case 'sleep_ready':
      return 'cant_sleep';
    case 'hangover_relief':
      return 'want_reset';
    case 'muscle_relief':
    case 'edema_relief':
      return 'heavy';
    default:
      return 'low_mood';
  }
}

function mapCardPositionToRank(position: number): HomeSuggestionRank {
  if (position === 1) return 'primary';
  if (position === 2) return 'secondary_1';
  return 'secondary_2';
}

function hasHighRiskCondition(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((condition) => ['hypertension_heart', 'pregnant'].includes(condition));
}

function hasResetContraindication(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((condition) => ['hypertension_heart', 'pregnant', 'diabetes'].includes(condition));
}

function resolveFallback(intent: IntentCard, healthConditions: UserProfile['healthConditions']): FallbackStrategy {
  if (hasHighRiskCondition(healthConditions)) return 'SAFE_ROUTINE_ONLY';
  if (intent.intent_id === 'hangover_relief' && hasResetContraindication(healthConditions)) {
    return 'RESET_WITHOUT_COLD';
  }
  return 'none';
}

function buildHeadlineMessage(timeContext: TimeContext, recent: BathRecommendation[]): string {
  if (timeContext === 'late_night') {
    return '지금은 잠들기 준비 시간이네요.';
  }

  const latest = recent[0];
  if (latest?.mode === 'trip') {
    return '오늘은 분위기 전환 루틴부터 시작해볼까요?';
  }

  if (timeContext === 'day' || timeContext === 'evening') {
    return '지금 컨디션에 맞는 루틴을 바로 시작해볼까요?';
  }

  return '오늘 아침, 가볍게 몸을 깨워볼까요?';
}

function modeFromIntent(intent: IntentCard): RecommendationCardEventPayload['mode_type'] {
  if (intent.domain === 'trip') return 'trip';
  return intent.mapped_mode;
}

function hasSafetyPriorityFallback(fallback: FallbackStrategy): boolean {
  return fallback === 'SAFE_ROUTINE_ONLY' || fallback === 'RESET_WITHOUT_COLD';
}

export default function HomeIntentScreen() {
  const { profile } = useUserProfile();
  const haptic = useHaptic();
  const { width: screenWidth } = useWindowDimensions();

  const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');
  const [recentRoutines, setRecentRoutines] = useState<BathRecommendation[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  const [warningVisible, setWarningVisible] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);
  const [pendingRecId, setPendingRecId] = useState<string | null>(null);
  const [pendingStartPayload, setPendingStartPayload] =
    useState<RecommendationCardEventPayload | null>(null);

  const [subModalVisible, setSubModalVisible] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<IntentCard | null>(null);
  const [selectedIntentPayload, setSelectedIntentPayload] =
    useState<RecommendationCardEventPayload | null>(null);

  const sessionIdRef = useRef(`session_${Date.now()}`);

  useEffect(() => {
    loadLastEnvironment().then((saved) => {
      if (saved) {
        setEnvironment(normalizeEnvironmentInput(saved));
        return;
      }
      if (profile) {
        setEnvironment(normalizeEnvironmentInput(profile.bathEnvironment));
      }
    });

    setIsHistoryLoaded(false);
    loadHistory()
      .then((history) => {
        setRecentRoutines(history.slice(0, 8));
      })
      .finally(() => {
        setIsHistoryLoaded(true);
      });
  }, [profile]);

  const timeContext = useMemo(() => getTimeContext(), []);
  const sectionOrder = useMemo(() => getSectionOrderByContext(timeContext), [timeContext]);

  const headlineMessage = useMemo(
    () => buildHeadlineMessage(timeContext, recentRoutines),
    [recentRoutines, timeContext]
  );

  const normalizedEnvironment = normalizeEnvironmentInput(environment);
  const careCards = CARE_INTENT_CARDS;
  const tripCards = TRIP_INTENT_CARDS;
  const previewCareCards = useMemo(
    () => careCards.slice(0, HOME_PREVIEW_CARD_LIMIT),
    [careCards]
  );
  const previewTripCards = useMemo(
    () => tripCards.slice(0, HOME_PREVIEW_CARD_LIMIT),
    [tripCards]
  );

  const sortedSections = useMemo(() => {
    const care = {
      key: 'care' as const,
      title: '케어 루틴',
      cards: previewCareCards,
      route: '/(tabs)/care' as const,
    };
    const trip = {
      key: 'trip' as const,
      title: '트립 루틴',
      cards: previewTripCards,
      route: '/(tabs)/trip' as const,
    };
    return sectionOrder === 'care_first' ? [care, trip] : [trip, care];
  }, [previewCareCards, previewTripCards, sectionOrder]);

  const useSingleColumn = screenWidth < 340;
  const gridColumns = useSingleColumn ? 1 : 2;
  const sectionInnerWidth = Math.max(220, screenWidth - SCREEN_HORIZONTAL_PADDING * 2);
  const intentCardWidth =
    gridColumns === 2 ? (sectionInnerWidth - CARD_GAP) / 2 : sectionInnerWidth;
  const intentCardMinHeight = useSingleColumn
    ? CARD_MIN_HEIGHT_COMPACT
    : CARD_MIN_HEIGHT_REGULAR;

  useEffect(() => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const healthConditions = profile?.healthConditions ?? ['none'];

    [...careCards, ...tripCards].forEach((intent) => {
      const payload: RecommendationCardEventPayload = {
        user_id: profile?.createdAt ?? 'anonymous',
        session_id: sessionIdRef.current,
        app_version: appVersion,
        locale,
        time_context: timeContext,
        environment,
        partial_bath_subtype: environment === 'partial_bath' ? 'footbath' : null,
        active_state: mapIntentToActiveState(intent.intent_id),
        mode_type: modeFromIntent(intent),
        suggestion_id: intent.id,
        suggestion_rank: mapCardPositionToRank(intent.card_position),
        fallback_strategy_applied: resolveFallback(intent, healthConditions),
        experiment_id: 'none',
        variant: 'default',
        ts: new Date().toISOString(),
        engine_source: intent.domain,
        intent_id: intent.intent_id,
        intent_domain: intent.domain,
        section_order: sectionOrder,
        card_position: intent.card_position,
      };
      trackIntentCardImpression(payload);
    });
  }, [careCards, environment, profile?.createdAt, profile?.healthConditions, sectionOrder, timeContext, tripCards]);

  const disclosureLines = useMemo(() => {
    const healthConditions = profile?.healthConditions ?? ['none'];
    const fallback = hasHighRiskCondition(healthConditions)
      ? 'SAFE_ROUTINE_ONLY' as const
      : 'none' as const;
    const hasResetIntent = careCards.some((c) => c.mapped_mode === 'reset');
    return buildDisclosureLines({
      fallbackStrategy: fallback,
      selectedMode: hasResetIntent ? 'reset' : 'recovery',
      healthConditions,
    });
  }, [careCards, profile?.healthConditions]);

  const handleSelectEnvironment = (next: BathEnvironment) => {
    haptic.light();
    setEnvironment(next);
    saveLastEnvironment(next);
  };

  const handleOpenSubProtocol = (intent: IntentCard) => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const healthConditions = profile?.healthConditions ?? ['none'];

    const payload: RecommendationCardEventPayload = {
      user_id: profile?.createdAt ?? 'anonymous',
      session_id: sessionIdRef.current,
      app_version: appVersion,
      locale,
      time_context: timeContext,
      environment,
      partial_bath_subtype: environment === 'partial_bath' ? 'footbath' : null,
      active_state: mapIntentToActiveState(intent.intent_id),
      mode_type: modeFromIntent(intent),
      suggestion_id: intent.id,
      suggestion_rank: mapCardPositionToRank(intent.card_position),
      fallback_strategy_applied: resolveFallback(intent, healthConditions),
      experiment_id: 'none',
      variant: 'default',
      ts: new Date().toISOString(),
      engine_source: intent.domain,
      intent_id: intent.intent_id,
      intent_domain: intent.domain,
      section_order: sectionOrder,
      card_position: intent.card_position,
    };

    trackIntentCardClick(payload);
    trackSubprotocolModalOpen(payload);
    setSelectedIntent(intent);
    setSelectedIntentPayload(payload);
    setSubModalVisible(true);
  };

  const resolveSubOptions = (intent: IntentCard | null): SubProtocolOption[] => {
    if (!intent) return [];
    if (intent.domain === 'trip') {
      return TRIP_SUBPROTOCOL_OPTIONS[intent.intent_id] ?? [];
    }
    return CARE_SUBPROTOCOL_OPTIONS[intent.intent_id] ?? [];
  };

  const handleRouteWithSafety = (
    recommendation: BathRecommendation,
    startPayload: RecommendationCardEventPayload
  ) => {
    if (recommendation.safetyWarnings.length > 0) {
      setPendingWarnings(recommendation.safetyWarnings);
      setPendingRecId(recommendation.id);
      setPendingStartPayload(startPayload);
      setWarningVisible(true);
      return;
    }

    trackRoutineStart(startPayload);
    trackRoutineStartAfterSubprotocol(startPayload);
    router.push(`/result/recipe/${recommendation.id}`);
  };

  const handleSelectSubProtocol = async (option: SubProtocolOption) => {
    if (!selectedIntent || !selectedIntentPayload) return;

    haptic.medium();
    const runtimeProfile = buildRuntimeProfile(profile, environment);

    const baseRecommendation =
      selectedIntent.domain === 'trip'
        ? generateTripRecommendation(
            runtimeProfile,
            mapIntentToTheme(selectedIntent.intent_id),
            toEngineEnvironment(environment)
          )
        : generateCareRecommendation(
            runtimeProfile,
            mapIntentToTags(selectedIntent.intent_id),
            toEngineEnvironment(environment)
          );

    const recommendation = applySubProtocolOverrides(
      baseRecommendation,
      option,
      environment,
      selectedIntent.intent_id
    );

    await saveRecommendation(recommendation);
    setSubModalVisible(false);
    setSelectedIntent(null);
    setSelectedIntentPayload(null);

    const payloadWithSub: RecommendationCardEventPayload = {
      ...selectedIntentPayload,
      subprotocol_id: option.id,
    };

    trackSubprotocolSelected(payloadWithSub);
    handleRouteWithSafety(recommendation, payloadWithSub);
  };

  const handleWarningDismiss = () => {
    setWarningVisible(false);
    if (pendingStartPayload) {
      trackRoutineStart(pendingStartPayload);
      trackRoutineStartAfterSubprotocol(pendingStartPayload);
      setPendingStartPayload(null);
    }
    if (pendingRecId) {
      router.push(`/result/recipe/${pendingRecId}`);
      setPendingRecId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>{headlineMessage}</Text>
          <Text style={styles.subtitle}>지금 환경에 맞춰 루틴을 준비했어요.</Text>
          {isHistoryLoaded && recentRoutines.length === 0 ? (
            <Text style={styles.beginnerGuide}>{copy.home.beginnerGuide}</Text>
          ) : null}
        </View>

        {/* ── Environment selector ───────────────────────────────────── */}
        <View style={styles.environmentRow}>
          {ENV_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.envChip, environment === option.id && styles.envChipActive]}
              onPress={() => handleSelectEnvironment(option.id)}
            >
              <Text style={[styles.envText, environment === option.id && styles.envTextActive]} numberOfLines={1}>
                {option.emoji} {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Intent sections ────────────────────────────────────────── */}
        {sortedSections.map((section) => (
          <View key={section.key}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Pressable onPress={() => router.push(section.route)}>
                <Text style={styles.moreText}>더보기</Text>
              </Pressable>
            </View>

            <View style={[styles.gridWrap, { columnGap: CARD_GAP, rowGap: CARD_GAP }]}>
              {section.cards.map((intent) => {
                const disabled = !intent.allowed_environments.includes(normalizedEnvironment);
                const fallback = resolveFallback(intent, profile?.healthConditions ?? ['none']);
                const safetyBadge = hasSafetyPriorityFallback(fallback)
                  ? copy.home.safetyPriorityBadge
                  : undefined;
                if (section.key === 'trip') {
                  return (
                    <TripThemeCard
                      key={intent.id}
                      intentId={intent.intent_id}
                      title={intent.copy_title}
                      subtitle={getEnvironmentSubtitle(intent, normalizedEnvironment)}
                      fitLabel={getEnvironmentFitLabel(intent, normalizedEnvironment)}
                      safetyBadge={safetyBadge}
                      disabled={disabled}
                      disabledText="현재 환경에선 제한적으로 추천돼요"
                      onPress={() => handleOpenSubProtocol(intent)}
                      width={intentCardWidth}
                      minHeight={intentCardMinHeight}
                    />
                  );
                }
                return (
                  <CategoryCard
                    key={intent.id}
                    title={intent.copy_title}
                    subtitle={getEnvironmentSubtitle(intent, normalizedEnvironment)}
                    emoji={CATEGORY_CARD_EMOJI[intent.intent_id] ?? '🛁'}
                    bgColor={CATEGORY_CARD_COLORS[intent.intent_id] ?? '#C5D9FC'}
                    fitLabel={getEnvironmentFitLabel(intent, normalizedEnvironment)}
                    safetyBadge={safetyBadge}
                    disabled={disabled}
                    disabledText="현재 환경에선 제한적으로 추천돼요"
                    onPress={() => handleOpenSubProtocol(intent)}
                    width={intentCardWidth}
                    minHeight={intentCardMinHeight}
                  />
                );
              })}
            </View>
          </View>
        ))}

        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>최근 루틴</Text>
            <Pressable onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.moreText}>더보기</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {recentRoutines.length === 0 ? (
              <View style={styles.recentEmptyCard}>
                <Text style={styles.recentEmptyText}>최근 기록이 아직 없어요</Text>
              </View>
            ) : (
              recentRoutines.slice(0, 8).map((routine) => (
                <Pressable
                  key={routine.id}
                  style={styles.recentCard}
                  onPress={() => router.push(`/result/recipe/${routine.id}`)}
                >
                  <View style={[styles.recentColorDot, { backgroundColor: routine.colorHex }]} />
                  <Text style={styles.recentTitle} numberOfLines={1}>{routine.themeTitle ?? '맞춤 케어'}</Text>
                  <Text style={styles.recentSub} numberOfLines={2}>
                    {routine.temperature.recommended}°C · {routine.durationMinutes ?? 10}분 · {ENV_LABEL[normalizeEnvironmentInput(routine.environmentUsed)] ?? '욕조'}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        <PersistentDisclosure style={styles.disclosureInline} lines={disclosureLines} />
      </ScrollView>

      <SafetyWarning
        visible={warningVisible}
        warnings={pendingWarnings}
        onDismiss={handleWarningDismiss}
      />

      <SubProtocolPickerModal
        visible={subModalVisible}
        title={selectedIntent?.copy_title ?? ''}
        domain={selectedIntent?.domain}
        options={resolveSubOptions(selectedIntent)}
        onClose={() => {
          setSubModalVisible(false);
          setSelectedIntent(null);
          setSelectedIntentPayload(null);
        }}
        onSelect={handleSelectSubProtocol}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG_BASE,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 32,
    gap: SECTION_GAP,
  },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: TYPE_SCALE.headingMd,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    lineHeight: 32,
  },
  subtitle: {
    marginTop: 6,
    fontSize: TYPE_SCALE.body,
    color: TEXT_MUTED,
    lineHeight: 21,
  },
  beginnerGuide: {
    marginTop: 8,
    fontSize: TYPE_SCALE.caption,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    fontWeight: '600',
  },

  // ── Environment selector ────────────────────────────────────────────
  environmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
  },
  envChip: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EAEEF5',
  },
  envChipActive: {
    backgroundColor: ACCENT,
  },
  envText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
  },
  envTextActive: {
    color: '#FFFFFF',
  },

  // ── Section title ───────────────────────────────────────────────────
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontWeight: '800',
    fontSize: TYPE_SCALE.title,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moreText: {
    color: ACCENT,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
  },

  // ── Category card grid ──────────────────────────────────────────────
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  // ── Recent routines ─────────────────────────────────────────────────
  recentRow: {
    gap: 12,
    paddingRight: 8,
    paddingVertical: 2,
  },
  recentCard: {
    width: 180,
    borderRadius: 16,
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
    minHeight: 100,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  recentColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentTitle: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    lineHeight: 21,
  },
  recentSub: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
  },
  recentEmptyCard: {
    width: 240,
    borderRadius: 16,
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 100,
    justifyContent: 'center',
  },
  recentEmptyText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    lineHeight: 20,
  },
  disclosureInline: {
    marginTop: 4,
  },
});
