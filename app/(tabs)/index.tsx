import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import {
  ActiveState,
  BathEnvironment,
  BathRecommendation,
  DailyTag,
  HomeSuggestion,
  ThemeId,
  TimeContext,
  UserProfile,
} from '@/src/engine/types';
import {
  buildHomeOrchestration,
  buildSuggestionExplanation,
  normalizeEnvironmentInput,
  selectModeByPolicy,
} from '@/src/engine/homeOrchestration';
import {
  generateCareRecommendation,
  generateTripRecommendation,
} from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { saveRecommendation } from '@/src/storage/history';
import { loadLastEnvironment, saveLastEnvironment } from '@/src/storage/environment';
import { SafetyWarning } from '@/src/components/SafetyWarning';
import {
  ACCENT,
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  PASTEL_BG_BOTTOM,
  PASTEL_BG_TOP,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
  WARNING_COLOR,
} from '@/src/data/colors';
import {
  CommerceEventPayload,
  RecommendationCardEventPayload,
  trackAffiliateLinkClick,
  trackProductDetailView,
  trackRecommendationCardClick,
  trackRecommendationCardImpression,
  trackRoutineStart,
  trackSommelierPickClick,
  trackRoutineStartedAfterWhy,
  trackTripNarrativeEngaged,
  trackWhyExplainerExposed,
} from '@/src/analytics/events';
import { SuggestionDetailModal } from '@/src/components/SuggestionDetailModal';
import {
  buildProductMatchingSlots,
  ProductMatchItem,
} from '@/src/engine/productMatching';
import { ProductMatchingModal } from '@/src/components/ProductMatchingModal';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { buildDisclosureLines } from '@/src/engine/disclosures';

const ACTIVE_STATE_OPTIONS: { id: ActiveState; label: string }[] = [
  { id: 'tension', label: '긴장되어 있어요' },
  { id: 'heavy', label: '몸이 무거워요' },
  { id: 'cant_sleep', label: '잠이 안 와요' },
  { id: 'low_mood', label: '기분이 가라앉았어요' },
  { id: 'want_reset', label: '리셋하고 싶어요' },
];

const ENV_OPTIONS: { id: BathEnvironment; emoji: string; label: string }[] = [
  { id: 'bathtub', emoji: '🛁', label: '욕조' },
  { id: 'partial_bath', emoji: '🦶', label: '부분입욕' },
  { id: 'shower', emoji: '🚿', label: '샤워' },
];

const THEME_OPTIONS: { id: ThemeId; label: string }[] = [
  { id: 'kyoto_forest', label: 'Kyoto' },
  { id: 'rainy_camping', label: 'Rainy' },
  { id: 'midnight_paris', label: 'Paris' },
];

function getTimeContext(date = new Date()): TimeContext {
  const h = date.getHours();
  if (h >= 22 || h < 5) return 'late_night';
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 18) return 'day';
  return 'evening';
}

function toEngineEnvironment(environment: BathEnvironment): BathEnvironment {
  // Existing engine path still uses `footbath`; map `partial_bath` for compatibility.
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

function hasProductCandidates(
  mode: 'sleep' | 'recovery' | 'reset',
  environment: BathEnvironment
): boolean {
  if (environment === 'shower' && mode === 'sleep') return false;
  if (environment === 'partial_bath' && mode === 'reset') return false;
  return true;
}

function getFallbackHeadline(fallback: string): string {
  switch (fallback) {
    case 'DEFAULT_STARTER_RITUAL':
      return 'W02 • Starter Ritual 상태';
    case 'SAFE_ROUTINE_ONLY':
      return 'W03 • Safe Routine Only 상태';
    case 'RESET_WITHOUT_COLD':
      return 'W05 • Reset without Cold 상태';
    case 'ROUTINE_ONLY_NO_COMMERCE':
      return 'W06 • Routine Only 상태';
    default:
      return 'W01 • Home default 상태';
  }
}

export default function HomeOrchestrationScreen() {
  const { profile } = useUserProfile();
  const haptic = useHaptic();

  const [activeState, setActiveState] = useState<ActiveState>('cant_sleep');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('kyoto_forest');
  const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');

  const [warningVisible, setWarningVisible] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);
  const [pendingRecId, setPendingRecId] = useState<string | null>(null);
  const [pendingStartPayload, setPendingStartPayload] =
    useState<RecommendationCardEventPayload | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<HomeSuggestion | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<RecommendationCardEventPayload | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [pendingRecommendation, setPendingRecommendation] = useState<BathRecommendation | null>(null);

  const sessionIdRef = useRef(`session_${Date.now()}`);

  useEffect(() => {
    loadLastEnvironment().then((saved) => {
      if (saved) {
        setEnvironment(saved);
        return;
      }
      if (profile) {
        setEnvironment(normalizeEnvironmentInput(profile.bathEnvironment));
      }
    });
  }, [profile]);

  const timeContext = useMemo(() => getTimeContext(), []);

  const selectedMode = useMemo(
    () => selectModeByPolicy(activeState, timeContext),
    [activeState, timeContext]
  );

  const productCandidateAvailable = useMemo(
    () => hasProductCandidates(selectedMode, environment),
    [environment, selectedMode]
  );

  const orchestration = useMemo(
    () =>
      buildHomeOrchestration({
        activeState,
        timeContext,
        environment,
        healthConditions: profile?.healthConditions ?? ['none'],
        hasProfile: Boolean(profile),
        productCandidateAvailable,
        selectedThemeId: selectedTheme,
      }),
    [
      activeState,
      timeContext,
      environment,
      profile,
      productCandidateAvailable,
      selectedTheme,
    ]
  );

  const isLateNightSleepPriority =
    orchestration.fallbackStrategy === 'none' &&
    timeContext === 'late_night' &&
    orchestration.selectedMode === 'sleep';
  const isEngineConflictResolved = orchestration.engineConflictResolved;

  const suggestions = [
    orchestration.primarySuggestion,
    ...orchestration.secondarySuggestions,
  ];

  useEffect(() => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;

    suggestions.forEach((suggestion) => {
      trackRecommendationCardImpression({
        user_id: profile?.createdAt ?? 'anonymous',
        session_id: sessionIdRef.current,
        app_version: appVersion,
        locale,
        time_context: timeContext,
        environment,
        partial_bath_subtype: environment === 'partial_bath' ? 'footbath' : null,
        active_state: activeState,
        mode_type: suggestion.mode === 'trip' ? 'trip' : orchestration.selectedMode,
        suggestion_id: suggestion.id,
        suggestion_rank: suggestion.rank,
        fallback_strategy_applied: orchestration.fallbackStrategy,
        experiment_id: 'none',
        variant: 'default',
        ts: new Date().toISOString(),
        engine_source: suggestion.mode,
      });
    });
  }, [
    activeState,
    environment,
    orchestration.fallbackStrategy,
    orchestration.selectedMode,
    profile?.createdAt,
    suggestions,
    timeContext,
  ]);

  const handleSelectEnvironment = (next: BathEnvironment) => {
    haptic.light();
    setEnvironment(next);
    saveLastEnvironment(next);
  };

  const handleOpenSuggestion = async (suggestion: HomeSuggestion) => {
    haptic.medium();

    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;

    const eventPayload: RecommendationCardEventPayload = {
      user_id: runtimeProfile.createdAt,
      session_id: sessionIdRef.current,
      app_version: appVersion,
      locale,
      time_context: timeContext,
      environment,
      partial_bath_subtype: environment === 'partial_bath' ? 'footbath' : null,
      active_state: activeState,
      mode_type: suggestion.mode === 'trip' ? 'trip' : orchestration.selectedMode,
      suggestion_id: suggestion.id,
      suggestion_rank: suggestion.rank,
      fallback_strategy_applied: orchestration.fallbackStrategy,
      experiment_id: 'none',
      variant: 'default',
      ts: new Date().toISOString(),
      engine_source: suggestion.mode,
    };

    trackRecommendationCardClick(eventPayload);
    setSelectedSuggestion(suggestion);
    setSelectedPayload(eventPayload);
    setDetailVisible(true);
    trackWhyExplainerExposed(eventPayload);
    if (suggestion.mode === 'trip') {
      trackTripNarrativeEngaged(eventPayload);
    }
  };

  const handleStartFromDetail = async () => {
    if (!selectedSuggestion || !selectedPayload) return;

    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const recommendation =
      selectedSuggestion.mode === 'trip'
        ? generateTripRecommendation(
            runtimeProfile,
            selectedSuggestion.themeId ?? selectedTheme,
            toEngineEnvironment(environment)
          )
        : generateCareRecommendation(
            runtimeProfile,
            (selectedSuggestion.dailyTags ?? ['stress']) as DailyTag[],
            toEngineEnvironment(environment)
          );

    await saveRecommendation(recommendation);
    setDetailVisible(false);
    trackRoutineStartedAfterWhy(selectedPayload);

    if (orchestration.fallbackStrategy !== 'ROUTINE_ONLY_NO_COMMERCE') {
      setPendingRecommendation(recommendation);
      setProductModalVisible(true);
      return;
    }

    handleRouteWithSafety(recommendation, selectedPayload);
  };

  const handleRouteWithSafety = (
    recommendation: BathRecommendation,
    startPayload: RecommendationCardEventPayload
  ) => {
    if (recommendation.safetyWarnings.length > 0) {
      setPendingWarnings(recommendation.safetyWarnings);
      setPendingRecId(recommendation.id);
      setPendingStartPayload(startPayload);
      return setWarningVisible(true);
    }

    trackRoutineStart(startPayload);
    router.push(`/result/recipe/${recommendation.id}`);
  };

  const handleContinueAfterProducts = () => {
    if (!pendingRecommendation || !selectedPayload) return;
    setProductModalVisible(false);
    handleRouteWithSafety(pendingRecommendation, selectedPayload);
    setPendingRecommendation(null);
  };

  const handleWarningDismiss = () => {
    setWarningVisible(false);
    if (pendingStartPayload) {
      trackRoutineStart(pendingStartPayload);
      setPendingStartPayload(null);
    }
    if (pendingRecId) {
      router.push(`/result/recipe/${pendingRecId}`);
      setPendingRecId(null);
    }
  };

  const showCommerceNotice =
    orchestration.fallbackStrategy === 'ROUTINE_ONLY_NO_COMMERCE';
  const disclosureLines = useMemo(
    () =>
      buildDisclosureLines({
        fallbackStrategy: orchestration.fallbackStrategy,
        selectedMode: orchestration.selectedMode,
        healthConditions: profile?.healthConditions ?? ['none'],
        engineConflictResolved: orchestration.engineConflictResolved,
      }),
    [
      orchestration.engineConflictResolved,
      orchestration.fallbackStrategy,
      orchestration.selectedMode,
      profile?.healthConditions,
    ]
  );
  const productMatchItems = useMemo(
    () =>
      pendingRecommendation
        ? buildProductMatchingSlots(pendingRecommendation, environment)
        : [],
    [pendingRecommendation, environment]
  );

  const trackCommerceEvent = (item: ProductMatchItem): CommerceEventPayload | null => {
    if (!selectedPayload) return null;
    return {
      ...selectedPayload,
      product_id: item.ingredient.id,
      slot: item.slot,
      price_tier: item.priceTier,
      sommelier_pick: item.sommelierPick,
    };
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PASTEL_BG_TOP, PASTEL_BG_BOTTOM]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>오늘의 오케스트레이션</Text>
          <Text style={styles.subtitle}>오늘 신호: {orchestration.todaySignal}</Text>
          <Text style={styles.priorityText}>Resolution: {orchestration.priorityResolution}</Text>
        </View>

        <View style={styles.fallbackBanner}>
          <Text style={styles.fallbackTitle}>{getFallbackHeadline(orchestration.fallbackStrategy)}</Text>
          <Text style={styles.fallbackText}>{orchestration.insightStrip}</Text>
          {isEngineConflictResolved ? (
            <Text style={styles.lateNightBadge}>
              W13 • Engine conflict resolved (Primary only)
            </Text>
          ) : null}
          {isLateNightSleepPriority ? (
            <Text style={styles.lateNightBadge}>W04 • Late-night sleep priority 적용</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today Signal</Text>
          <View style={styles.chipWrap}>
            {ACTIVE_STATE_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.chip, activeState === option.id && styles.chipActive]}
                onPress={() => setActiveState(option.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    activeState === option.id && styles.chipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment</Text>
          <View style={styles.row}>
            {ENV_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.envChip, environment === option.id && styles.envChipActive]}
                onPress={() => handleSelectEnvironment(option.id)}
              >
                <Text style={styles.envText}>
                  {option.emoji} {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Theme (Secondary)</Text>
          <View style={styles.row}>
            {THEME_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.envChip, selectedTheme === option.id && styles.envChipActive]}
                onPress={() => setSelectedTheme(option.id)}
              >
                <Text style={styles.envText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion.id}
              style={[
                styles.suggestionCard,
                suggestion.rank === 'primary' && styles.primaryCard,
              ]}
              onPress={() => handleOpenSuggestion(suggestion)}
            >
              <Text style={styles.rankText}>{suggestion.rank}</Text>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text style={styles.suggestionSub}>{suggestion.subtitle}</Text>
              {orchestration.fallbackStrategy === 'RESET_WITHOUT_COLD' ? (
                <Text style={styles.safeHint}>냉수 단계는 안전 정책으로 비활성화됩니다.</Text>
              ) : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.row}>
            {orchestration.quickActions.map((action) => (
              <View key={action} style={styles.quickActionPill}>
                <Text style={styles.quickActionText}>{action}</Text>
              </View>
            ))}
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>{orchestration.insightStrip}</Text>
            {showCommerceNotice ? (
              <Text style={styles.commerceHiddenText}>
                상품 후보가 없어 W06 상태로 루틴 실행만 제공합니다.
              </Text>
            ) : null}
          </View>
        </View>

        <PersistentDisclosure
          style={styles.disclosureInline}
          lines={disclosureLines}
        />
      </ScrollView>

      <SafetyWarning
        visible={warningVisible}
        warnings={pendingWarnings}
        onDismiss={handleWarningDismiss}
      />

      <SuggestionDetailModal
        visible={detailVisible}
        suggestion={selectedSuggestion}
        explanation={
          selectedSuggestion
            ? buildSuggestionExplanation(
                selectedSuggestion,
                activeState,
                orchestration.selectedMode
              )
            : null
        }
        onClose={() => setDetailVisible(false)}
        onStart={handleStartFromDetail}
      />

      <ProductMatchingModal
        visible={productModalVisible}
        items={productMatchItems}
        onClose={() => {
          setProductModalVisible(false);
          setPendingRecommendation(null);
        }}
        onContinue={handleContinueAfterProducts}
        onProductPress={(item) => {
          const event = trackCommerceEvent(item);
          if (!event) return;
          trackProductDetailView(event);
          if (item.sommelierPick) {
            trackSommelierPickClick(event);
          }
        }}
        onPurchasePress={async (item) => {
          const event = trackCommerceEvent(item);
          if (event) {
            trackAffiliateLinkClick(event);
            if (item.sommelierPick) {
              trackSommelierPickClick(event);
            }
          }
          const url = item.ingredient.purchaseUrl;
          if (!url) return;
          await Linking.openURL(url);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
  },
  headerCard: {
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 18,
    padding: 16,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  title: {
    fontSize: TYPE_SCALE.headingMd,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  subtitle: {
    marginTop: 6,
    fontSize: TYPE_SCALE.body,
    color: TEXT_SECONDARY,
  },
  priorityText: {
    marginTop: 8,
    fontSize: TYPE_SCALE.caption,
    color: TEXT_SECONDARY,
  },
  fallbackBanner: {
    borderWidth: 1,
    borderColor: WARNING_COLOR,
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(240,165,92,0.12)',
    gap: 4,
  },
  fallbackTitle: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  fallbackText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
  },
  lateNightBadge: {
    marginTop: 4,
    color: WARNING_COLOR,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
  },
  section: {
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: TYPE_SCALE.title,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  chipActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(120,149,207,0.16)',
  },
  chipText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
  },
  chipTextActive: {
    color: TEXT_PRIMARY,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  envChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.84)',
  },
  envChipActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(120,149,207,0.14)',
  },
  envText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
  },
  suggestionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.88)',
    gap: 6,
  },
  primaryCard: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(120,149,207,0.12)',
  },
  rankText: {
    fontSize: TYPE_SCALE.caption,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  suggestionTitle: {
    fontSize: TYPE_SCALE.title,
    color: TEXT_PRIMARY,
    fontWeight: '700',
  },
  suggestionSub: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  safeHint: {
    marginTop: 2,
    color: WARNING_COLOR,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
  },
  quickActionPill: {
    backgroundColor: BTN_PRIMARY,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickActionText: {
    color: BTN_PRIMARY_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  insightCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    gap: 6,
  },
  insightText: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  commerceHiddenText: {
    fontSize: TYPE_SCALE.caption,
    color: WARNING_COLOR,
    fontWeight: '700',
  },
  disclosureInline: {
    marginTop: 2,
  },
});
