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
import { clearSession } from '@/src/storage/session';
import { getTimeBasedMessage } from '@/src/utils/messages';
import { GradientBackground } from '@/src/components/GradientBackground';
import {
  BG,
  SURFACE,
  GLASS_BORDER,
  GLASS_SHADOW,
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

  useEffect(() => {
    if (!id) return;

    getRecommendationById(id).then((rec) => {
      if (rec) setRecommendation(rec);
    });

    const now = new Date();
    getMonthlyCount(now.getFullYear(), now.getMonth() + 1).then(setMonthlyCount);
  }, [id]);

  const handleFeedback = async (value: 'good' | 'bad') => {
    if (!id || feedback) return;
    setFeedback(value);
    await updateRecommendationFeedback(id, value);
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

  return (
    <View style={styles.container}>
      <GradientBackground
        colorHex={recommendation.colorHex}
        style={StyleSheet.absoluteFillObject}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Celebration emoji with bounce */}
            <Animated.Text
              entering={BounceIn.duration(800)}
              style={styles.celebrationEmoji}
            >
              🎉
            </Animated.Text>

            {/* Time-based message */}
            <Animated.View entering={FadeIn.duration(600).delay(400)}>
              <Text style={styles.mainMessage}>{timeMessage}</Text>
            </Animated.View>

            {/* Monthly stats */}
            <Animated.View
              entering={FadeIn.duration(600).delay(600)}
              style={styles.statsCard}
            >
              <Text style={styles.statsEmoji}>📊</Text>
              <Text style={styles.statsText}>
                이번 달 <Text style={[styles.statsHighlight, { color: recommendation.colorHex }]}>{monthlyCount}번째</Text> 입욕이에요
              </Text>
            </Animated.View>

            {/* Feedback */}
            <Animated.View
              entering={FadeIn.duration(600).delay(800)}
              style={styles.feedbackSection}
            >
              <Text style={styles.feedbackTitle}>오늘의 목욕은 어떠셨나요?</Text>
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

            {/* Home button */}
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
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
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
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
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
