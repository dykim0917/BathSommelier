import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { BathRecommendation } from '@/src/engine/types';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { getRecommendationById } from '@/src/storage/history';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { copy } from '@/src/content/copy';
import { formatTemperature } from '@/src/utils/temperature';
import { formatDuration } from '@/src/utils/time';
import {
  APP_BG_BASE,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY,
  TYPE_CAPTION,
  TYPE_HEADING_MD,
  TYPE_TITLE,
} from '@/src/data/colors';

const BATH_TYPE_LABELS: Record<string, string> = {
  full: '전신욕',
  half: '반신욕',
  foot: '족욕',
  shower: '샤워',
};

const HERO_HEIGHT = 116;

export default function RecipeScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const [recommendation, setRecommendation] =
    useState<BathRecommendation | null>(null);

  useEffect(() => {
    if (!id) return;
    getRecommendationById(id).then((rec) => {
      if (rec) setRecommendation(rec);
    });
  }, [id]);

  if (!recommendation) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: TEXT_SECONDARY }}>{copy.completion.loading}</Text>
      </View>
    );
  }

  const handleStartBath = () => {
    const navigateToTimer = () => router.replace(`/result/timer/${id}`);

    if (source === 'history') {
      Alert.alert(
        '루틴 다시 시작',
        '이 루틴을 다시 시작하면 새 기록이 추가됩니다. 진행할까요?',
        [
          { text: '취소', style: 'cancel' },
          { text: '진행', style: 'default', onPress: navigateToTimer },
        ]
      );
      return;
    }

    navigateToTimer();
  };

  const persona = PERSONA_DEFINITIONS.find((p) => p.code === recommendation.persona);
  const recipeTitle =
    recommendation.mode === 'trip'
      ? (recommendation.themeTitle ?? 'Trip 테마')
      : (persona?.nameKo ?? '맞춤 케어');

  const modeLabel =
    recommendation.mode === 'trip'
      ? '트립 · 분위기 전환 루틴'
      : '케어 · 몸 상태에 맞춘 루틴';

  const heroGradient: [string, string] = [
    recommendation.colorHex,
    recommendation.colorHex + 'BB',
  ];

  return (
    <View style={styles.container}>
      {/* Hero section */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={heroGradient}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.hero}
          >
            <SafeAreaView style={styles.heroSafeArea}>
              <View style={styles.heroNavRow}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="angle-left" size={22} color={TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.navCenterTitle} numberOfLines={1}>
                  {recipeTitle}
                </Text>
                <View style={styles.modeChip}>
                  <Text style={styles.modeChipText}>{copy.routine.stepPrep}</Text>
                </View>
              </View>
            </SafeAreaView>

            <Animated.View entering={FadeIn.duration(450)} style={styles.heroContent}>
              <Text style={styles.heroModeLabel}>{modeLabel}</Text>
            </Animated.View>
          </LinearGradient>
        </View>
      </View>

      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(80)}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatTemperature(recommendation.temperature)}
            </Text>
            <Text style={styles.statLabel}>수온</Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: recommendation.colorHex + '40' }]}
          />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatDuration(recommendation.durationMinutes)}
            </Text>
            <Text style={styles.statLabel}>시간</Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: recommendation.colorHex + '40' }]}
          />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {BATH_TYPE_LABELS[recommendation.bathType]}
            </Text>
            <Text style={styles.statLabel}>입욕 방법</Text>
          </View>
        </Animated.View>

        {/* Lighting row */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(130)}
          style={styles.lightingRow}
        >
          <Text style={styles.lightingLabel}>💡 조명</Text>
          <Text style={styles.lightingValue}>{recommendation.lighting}</Text>
        </Animated.View>

        {/* Ingredients track list */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
          <Text style={styles.sectionTitle}>준비물</Text>
          <Text style={styles.sectionSubtitle}>
            {recommendation.ingredients.length}가지 재료를 준비해주세요
          </Text>
          {recommendation.ingredients.map((ingredient, index) => (
            <View key={ingredient.id} style={styles.trackRow}>
              <View
                style={[
                  styles.trackCircle,
                  {
                    backgroundColor: recommendation.colorHex + '20',
                    borderColor: recommendation.colorHex + '55',
                  },
                ]}
              >
                <Text style={styles.trackEmoji}>🧴</Text>
              </View>
              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>{ingredient.nameKo}</Text>
                <Text style={styles.trackDesc} numberOfLines={1}>
                  {ingredient.description}
                </Text>
              </View>
              <Text style={styles.trackIndex}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Safety block */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(240)}
          style={styles.safetyBlock}
        >
          <Text style={styles.safetyTitle}>⚠️ {copy.routine.safetyTitle}</Text>
          {copy.routine.safetyLines.map((line) => (
            <Text key={line} style={styles.safetyText}>
              • {line}
            </Text>
          ))}
        </Animated.View>

        <View style={styles.disclosureWrap}>
          <PersistentDisclosure />
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Fixed bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: recommendation.colorHex }]}
          onPress={handleStartBath}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>
            {source === 'history' ? '다시 시작하기' : copy.routine.startCta}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG_BASE,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Hero
  heroWrapper: {
    overflow: 'hidden',
  },
  heroContainer: {
    height: HERO_HEIGHT,
  },
  hero: {
    flex: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  heroSafeArea: {
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  heroNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCenterTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPE_BODY,
    fontWeight: '700',
    color: BTN_PRIMARY_TEXT,
    letterSpacing: 0.2,
    paddingHorizontal: 4,
  },
  modeChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  modeChipText: {
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  heroTitle: {
    fontSize: TYPE_TITLE,
    fontWeight: '800',
    color: BTN_PRIMARY_TEXT,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 0,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroModeLabel: {
    fontSize: TYPE_CAPTION,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Stats card
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_SURFACE,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: TYPE_CAPTION,
    color: TEXT_SECONDARY,
  },
  statDivider: {
    width: 1,
    height: 38,
  },
  // Lighting
  lightingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_SURFACE,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginBottom: 20,
    gap: 8,
  },
  lightingLabel: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  lightingValue: {
    fontSize: TYPE_BODY,
    color: TEXT_PRIMARY,
    flex: 1,
  },
  // Track list
  sectionTitle: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
    gap: 14,
  },
  trackCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackEmoji: {
    fontSize: 20,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  trackDesc: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
  },
  trackIndex: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  // Safety
  safetyBlock: {
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_SURFACE,
    padding: 14,
    gap: 4,
  },
  safetyTitle: {
    fontSize: TYPE_BODY,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  safetyText: {
    fontSize: TYPE_CAPTION,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  disclosureWrap: {
    marginTop: 16,
  },
  bottomSpacer: {
    height: 16,
  },
  // Bottom CTA
  bottomCTA: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: APP_BG_BASE,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
  },
  startButton: {
    borderRadius: 38,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: BTN_PRIMARY_TEXT,
    letterSpacing: 0.5,
  },
});
