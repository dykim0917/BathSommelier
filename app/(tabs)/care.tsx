import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import {
  BathEnvironment,
  BathRecommendation,
  DailyTag,
  FallbackStrategy,
  HomeSuggestionRank,
  IntentCard,
  SubProtocolOption,
  ThemeId,
  TimeContext,
  UserProfile,
} from '@/src/engine/types';
import { generateCareRecommendation } from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { saveRecommendation } from '@/src/storage/history';
import { loadLastEnvironment, saveLastEnvironment } from '@/src/storage/environment';
import { SafetyWarning } from '@/src/components/SafetyWarning';
import {
  ACCENT,
  APP_BG_BASE,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  CATEGORY_CARD_COLORS,
  CATEGORY_CARD_EMOJI,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
} from '@/src/data/colors';
import { CategoryCard } from '@/src/components/CategoryCard';
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
  getEnvironmentSubtitle,
} from '@/src/data/intents';
import { applySubProtocolOverrides } from '@/src/engine/subprotocol';

const ENV_OPTIONS: { id: BathEnvironment; emoji: string; label: string }[] = [
  { id: 'bathtub', emoji: '🛁', label: '욕조' },
  { id: 'partial_bath', emoji: '🦶', label: '부분입욕' },
  { id: 'shower', emoji: '🚿', label: '샤워' },
];

// P0: 미구현 4종 placeholder 카드 (allowed_environments 비워서 항상 disabled)
const CARE_PLACEHOLDER_CARDS: IntentCard[] = [
  {
    id: 'care_cold_relief',
    domain: 'care',
    intent_id: 'cold_relief',
    mapped_mode: 'recovery',
    allowed_environments: [],
    copy_title: '감기 기운이 느껴질 때',
    copy_subtitle_by_environment: { bathtub: '준비 중이에요', shower: '준비 중이에요', partial_bath: '준비 중이에요' },
    default_subprotocol_id: '',
    card_position: 5,
  },
  {
    id: 'care_menstrual_relief',
    domain: 'care',
    intent_id: 'menstrual_relief',
    mapped_mode: 'recovery',
    allowed_environments: [],
    copy_title: '생리통이 있을 때',
    copy_subtitle_by_environment: { bathtub: '준비 중이에요', shower: '준비 중이에요', partial_bath: '준비 중이에요' },
    default_subprotocol_id: '',
    card_position: 6,
  },
  {
    id: 'care_stress_relief',
    domain: 'care',
    intent_id: 'stress_relief',
    mapped_mode: 'recovery',
    allowed_environments: [],
    copy_title: '스트레스를 풀고 싶을 때',
    copy_subtitle_by_environment: { bathtub: '준비 중이에요', shower: '준비 중이에요', partial_bath: '준비 중이에요' },
    default_subprotocol_id: '',
    card_position: 7,
  },
  {
    id: 'care_mood_lift',
    domain: 'care',
    intent_id: 'mood_lift',
    mapped_mode: 'recovery',
    allowed_environments: [],
    copy_title: '기분 전환이 필요할 때',
    copy_subtitle_by_environment: { bathtub: '준비 중이에요', shower: '준비 중이에요', partial_bath: '준비 중이에요' },
    default_subprotocol_id: '',
    card_position: 8,
  },
];

const ALL_CARE_CARDS = [...CARE_INTENT_CARDS, ...CARE_PLACEHOLDER_CARDS];

const SCREEN_HORIZONTAL_PADDING = 22;
const SECTION_GAP = 18;
const CARD_GAP = 12;
const CARD_MIN_HEIGHT_REGULAR = 142;

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

function buildRuntimeProfile(profile: UserProfile | null, environment: BathEnvironment): UserProfile {
  const now = new Date().toISOString();
  if (profile) {
    return { ...profile, bathEnvironment: toEngineEnvironment(environment) };
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
    case 'muscle_relief': return ['muscle_pain'];
    case 'sleep_ready': return ['insomnia'];
    case 'hangover_relief': return ['hangover'];
    case 'edema_relief': return ['swelling'];
    default: return ['stress'];
  }
}

function mapCardPositionToRank(position: number): HomeSuggestionRank {
  if (position === 1) return 'primary';
  if (position === 2) return 'secondary_1';
  return 'secondary_2';
}

function hasHighRiskCondition(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((c) => ['hypertension_heart', 'pregnant'].includes(c));
}

function hasResetContraindication(conditions: UserProfile['healthConditions']): boolean {
  return conditions.some((c) => ['hypertension_heart', 'pregnant', 'diabetes'].includes(c));
}

function resolveFallback(intent: IntentCard, healthConditions: UserProfile['healthConditions']): FallbackStrategy {
  if (hasHighRiskCondition(healthConditions)) return 'SAFE_ROUTINE_ONLY';
  if (intent.intent_id === 'hangover_relief' && hasResetContraindication(healthConditions)) {
    return 'RESET_WITHOUT_COLD';
  }
  return 'none';
}

export default function CareScreen() {
  const { profile } = useUserProfile();
  const haptic = useHaptic();
  const { width: screenWidth, fontScale } = useWindowDimensions();

  const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');
  const [warningVisible, setWarningVisible] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);
  const [pendingRecId, setPendingRecId] = useState<string | null>(null);
  const [pendingStartPayload, setPendingStartPayload] = useState<RecommendationCardEventPayload | null>(null);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<IntentCard | null>(null);
  const [selectedIntentPayload, setSelectedIntentPayload] = useState<RecommendationCardEventPayload | null>(null);

  const sessionIdRef = useRef(`session_${Date.now()}`);
  const timeContext = useMemo(() => getTimeContext(), []);

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
  }, [profile]);

  const normalizedEnvironment = normalizeEnvironmentInput(environment);

  const useSingleColumn = screenWidth < 380 || fontScale >= 1.15;
  const gridColumns = useSingleColumn ? 1 : 2;
  const sectionInnerWidth = Math.max(220, screenWidth - SCREEN_HORIZONTAL_PADDING * 2 - 32);
  const intentCardWidth = gridColumns === 2 ? (sectionInnerWidth - CARD_GAP) / 2 : sectionInnerWidth;

  useEffect(() => {
    const appVersion = Constants.expoConfig?.version ?? 'unknown';
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const healthConditions = profile?.healthConditions ?? ['none'];

    CARE_INTENT_CARDS.forEach((intent) => {
      const payload: RecommendationCardEventPayload = {
        user_id: profile?.createdAt ?? 'anonymous',
        session_id: sessionIdRef.current,
        app_version: appVersion,
        locale,
        time_context: timeContext,
        environment,
        partial_bath_subtype: environment === 'partial_bath' ? 'footbath' : null,
        active_state: 'low_mood',
        mode_type: intent.mapped_mode,
        suggestion_id: intent.id,
        suggestion_rank: mapCardPositionToRank(intent.card_position),
        fallback_strategy_applied: resolveFallback(intent, healthConditions),
        experiment_id: 'none',
        variant: 'default',
        ts: new Date().toISOString(),
        engine_source: intent.domain,
        intent_id: intent.intent_id,
        intent_domain: intent.domain,
        section_order: 'care_first',
        card_position: intent.card_position,
      };
      trackIntentCardImpression(payload);
    });
  }, [environment, profile?.createdAt, profile?.healthConditions, timeContext]);

  const disclosureLines = useMemo(() => {
    const healthConditions = profile?.healthConditions ?? ['none'];
    const fallback = hasHighRiskCondition(healthConditions) ? 'SAFE_ROUTINE_ONLY' as const : 'none' as const;
    return buildDisclosureLines({
      fallbackStrategy: fallback,
      selectedMode: 'recovery',
      healthConditions,
    });
  }, [profile?.healthConditions]);

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
      active_state: 'low_mood',
      mode_type: intent.mapped_mode,
      suggestion_id: intent.id,
      suggestion_rank: mapCardPositionToRank(intent.card_position),
      fallback_strategy_applied: resolveFallback(intent, healthConditions),
      experiment_id: 'none',
      variant: 'default',
      ts: new Date().toISOString(),
      engine_source: intent.domain,
      intent_id: intent.intent_id,
      intent_domain: intent.domain,
      section_order: 'care_first',
      card_position: intent.card_position,
    };

    trackIntentCardClick(payload);
    trackSubprotocolModalOpen(payload);
    setSelectedIntent(intent);
    setSelectedIntentPayload(payload);
    setSubModalVisible(true);
  };

  const handleSelectSubProtocol = async (option: SubProtocolOption) => {
    if (!selectedIntent || !selectedIntentPayload) return;

    haptic.medium();
    const runtimeProfile = buildRuntimeProfile(profile, environment);
    const baseRecommendation = generateCareRecommendation(
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

    if (recommendation.safetyWarnings.length > 0) {
      setPendingWarnings(recommendation.safetyWarnings);
      setPendingRecId(recommendation.id);
      setPendingStartPayload(payloadWithSub);
      setWarningVisible(true);
      return;
    }

    trackRoutineStart(payloadWithSub);
    trackRoutineStartAfterSubprotocol(payloadWithSub);
    router.push(`/result/recipe/${recommendation.id}?source=care`);
  };

  const handleWarningDismiss = () => {
    setWarningVisible(false);
    if (pendingStartPayload) {
      trackRoutineStart(pendingStartPayload);
      trackRoutineStartAfterSubprotocol(pendingStartPayload);
      setPendingStartPayload(null);
    }
    if (pendingRecId) {
      router.push(`/result/recipe/${pendingRecId}?source=care`);
      setPendingRecId(null);
    }
  };

  const subOptions = selectedIntent
    ? (CARE_SUBPROTOCOL_OPTIONS[selectedIntent.intent_id] ?? [])
    : [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>케어 루틴</Text>
          <Text style={styles.subtitle}>증상과 컨디션에 맞춰 루틴을 골라보세요.</Text>
        </View>

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

        <View>
          <Text style={styles.sectionTitle}>케어 루틴</Text>
          <View style={[styles.gridWrap, { columnGap: CARD_GAP, rowGap: CARD_GAP }]}>
            {ALL_CARE_CARDS.map((intent) => {
              const isPlaceholder = intent.allowed_environments.length === 0;
              const disabled = isPlaceholder || !intent.allowed_environments.includes(normalizedEnvironment);
              return (
                <CategoryCard
                  key={intent.id}
                  title={intent.copy_title}
                  subtitle={isPlaceholder ? '곧 추가될 예정이에요' : getEnvironmentSubtitle(intent, normalizedEnvironment)}
                  emoji={CATEGORY_CARD_EMOJI[intent.intent_id] ?? '🛁'}
                  bgColor={CATEGORY_CARD_COLORS[intent.intent_id] ?? '#C5D9FC'}
                  disabled={disabled}
                  disabledText={isPlaceholder ? '준비 중이에요' : '현재 환경에선 제한적으로 추천돼요'}
                  onPress={() => handleOpenSubProtocol(intent)}
                  width={intentCardWidth}
                  minHeight={CARD_MIN_HEIGHT_REGULAR}
                />
              );
            })}
          </View>
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
        options={subOptions}
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
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontWeight: '800',
    fontSize: TYPE_SCALE.title,
    marginBottom: 12,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  disclosureInline: {
    marginTop: 4,
  },
});
