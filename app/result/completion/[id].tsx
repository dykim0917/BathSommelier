import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';
import { BathRecommendation, BathFeedback } from '@/src/engine/types';
import { getRecommendationById, getMonthlyCount, updateRecommendationFeedback } from '@/src/storage/history';
import { clearSession, loadSession } from '@/src/storage/session';
import { applyFeedbackToThemePreference, saveCompletionMemory } from '@/src/storage/memory';
import { getTimeBasedMessage } from '@/src/utils/messages';
import { GradientBackground } from '@/src/components/GradientBackground';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import {
  BG,
  CARD_BORDER_SOFT,
  CARD_GLASS,
  CARD_SHADOW_SOFT,
  PASTEL_BG_BOTTOM,
  PASTEL_BG_TOP,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ACCENT,
} from '@/src/data/colors';

export default function CompletionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] =
    useState<BathRecommendation | null>(null);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [feedback, setFeedback] = useState<BathFeedback>(null);
  const [memoryNarrative, setMemoryNarrative] = useState<string | null>(null);
  const [themeWeight, setThemeWeight] = useState<number | null>(null);
  const [snapshotLine, setSnapshotLine] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    getRecommendationById(id).then(async (rec) => {
      if (!rec) return;
      setRecommendation(rec);
      const session = await loadSession();
      const actualDurationMinutes =
        session?.recommendationId === id && session.actualDurationSeconds !== undefined
          ? Math.max(1, Math.round(session.actualDurationSeconds / 60))
          : rec.durationMinutes;

      const memory = await saveCompletionMemory(rec, null, {
        completedAt:
          session?.recommendationId === id && session.completedAt
            ? session.completedAt
            : undefined,
        durationMinutes: actualDurationMinutes,
      });
      setMemoryNarrative(memory.narrativeRecallCard);
      if (memory.themeId) {
        setThemeWeight(memory.themePreferenceWeight);
      }
      setSnapshotLine(
        `${memory.completionSnapshot.temperatureRecommended}°C · ${
          memory.completionSnapshot.durationMinutes !== null
            ? `${memory.completionSnapshot.durationMinutes}분`
            : '시간 자유'
        } · ${memory.completionSnapshot.environment} · ${new Date(
          memory.completionSnapshot.completedAt
        ).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 완료`
      );
    });

    const now = new Date();
    getMonthlyCount(now.getFullYear(), now.getMonth() + 1).then(setMonthlyCount);
  }, [id]);

  const handleFeedback = async (value: 'good' | 'bad') => {
    if (!id || feedback) return;
    setFeedback(value);
    await updateRecommendationFeedback(id, value);
    if (recommendation?.themeId) {
      const next = await applyFeedbackToThemePreference(recommendation.themeId, value);
      setThemeWeight(next);
    }
  };

  const handleGoHome = async () => {
    await clearSession();
    router.replace('/(tabs)');
  };

  if (!recommendation) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: TEXT_SECONDARY }}>로딩 중...</Text>
      </View>
    );
  }

  const timeMessage = getTimeBasedMessage();
  const feedbackTitle = recommendation.themeTitle
    ? `오늘의 ${recommendation.themeTitle} 어떠셨나요?`
    : '오늘의 목욕은 어떠셨나요?';

  return (
    <View style={styles.container}>
      <GradientBackground
        colorHex={PASTEL_BG_TOP}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.softOverlay} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Animated.Text
              entering={BounceIn.duration(800)}
              style={styles.celebrationEmoji}
            >
              🎉
            </Animated.Text>

            <Animated.View entering={FadeIn.duration(600).delay(400)}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 3 • 마무리</Text>
              </View>
              <Text style={styles.mainMessage}>{timeMessage}</Text>
            </Animated.View>

            <Animated.View
              entering={FadeIn.duration(600).delay(600)}
              style={styles.statsCard}
            >
              <Text style={styles.statsEmoji}>📊</Text>
              <Text style={styles.statsText}>
                이번 달 <Text style={[styles.statsHighlight, { color: recommendation.colorHex }]}>{monthlyCount}번째</Text> 힐링 완료
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeIn.duration(600).delay(800)}
              style={styles.feedbackSection}
            >
              <Text style={styles.feedbackTitle}>{feedbackTitle}</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={[
                    styles.feedbackButton,
                    feedback === 'good' && {
                      backgroundColor: recommendation.colorHex + '20',
                      borderColor: recommendation.colorHex,
                    },
                  ]}
                  onPress={() => handleFeedback('good')}
                  activeOpacity={0.7}
                  disabled={feedback !== null}
                >
                  <Text style={styles.feedbackEmoji}>👍</Text>
                  <Text style={styles.feedbackLabel}>좋아요</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.feedbackButton,
                    feedback === 'bad' && {
                      backgroundColor: '#FEE2E2',
                      borderColor: '#EF4444',
                    },
                  ]}
                  onPress={() => handleFeedback('bad')}
                  activeOpacity={0.7}
                  disabled={feedback !== null}
                >
                  <Text style={styles.feedbackEmoji}>👎</Text>
                  <Text style={styles.feedbackLabel}>별로예요</Text>
                </TouchableOpacity>
              </View>
              {feedback && (
                <Animated.Text
                  entering={FadeIn.duration(300)}
                  style={styles.feedbackThanks}
                >
                  피드백 감사합니다!
                </Animated.Text>
              )}
            </Animated.View>

            {(memoryNarrative || themeWeight !== null) && (
              <Animated.View
                entering={FadeIn.duration(600).delay(900)}
                style={styles.memoryCard}
              >
                <Text style={styles.memoryTitle}>Memory Contract</Text>
                <Text style={styles.memoryLine}>
                  completion_snapshot: {snapshotLine ?? `${recommendation.temperature.recommended}°C · ${recommendation.durationMinutes ?? '자유'}분 · ${recommendation.environmentUsed}`}
                </Text>
                {themeWeight !== null && recommendation.themeTitle ? (
                  <Text style={styles.memoryLine}>
                    theme_preference_weight: {recommendation.themeTitle} = {themeWeight}
                  </Text>
                ) : null}
                {memoryNarrative ? (
                  <Text style={styles.memoryLine}>narrative_recall_card: {memoryNarrative}</Text>
                ) : null}
              </Animated.View>
            )}

            <PersistentDisclosure style={styles.disclosureInline} />

            <Animated.View entering={FadeIn.duration(500).delay(1000)}>
              <TouchableOpacity
                style={styles.homeButton}
                onPress={handleGoHome}
                activeOpacity={0.8}
              >
                <Text style={styles.homeButtonText}>홈으로</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  softOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PASTEL_BG_BOTTOM + '88',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  celebrationEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  mainMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
  },
  stepBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_GLASS,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  statsEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  statsText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  statsHighlight: {
    fontWeight: '800',
    fontSize: 18,
  },
  feedbackSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    alignItems: 'center',
    backgroundColor: CARD_GLASS,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  feedbackLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  feedbackThanks: {
    marginTop: 12,
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  memoryCard: {
    width: '100%',
    backgroundColor: CARD_GLASS,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
    gap: 4,
  },
  memoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  memoryLine: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 16,
  },
  disclosureInline: {
    width: '100%',
    marginBottom: 14,
  },
  homeButton: {
    backgroundColor: ACCENT,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 60,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
