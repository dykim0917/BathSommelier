import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { BathRecommendation } from '@/src/engine/types';
import { getRecommendationById } from '@/src/storage/history';
import { GradientBackground } from '@/src/components/GradientBackground';
import { PersonaCard } from '@/src/components/PersonaCard';
import { PreparationList } from '@/src/components/PreparationList';
import { BathTimer } from '@/src/components/BathTimer';
import { MusicPlayer } from '@/src/components/MusicPlayer';
import { BG, TEXT_PRIMARY, TEXT_SECONDARY, WARNING_COLOR } from '@/src/data/colors';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] =
    useState<BathRecommendation | null>(null);
  const [showContent, setShowContent] = useState(false);

  // Water fill animation
  const waterLevel = useSharedValue(100); // percentage from bottom (100 = not visible)
  const waterOpacity = useSharedValue(0);

  const waterStyle = useAnimatedStyle(() => ({
    height: `${100 - waterLevel.value}%`,
    opacity: waterOpacity.value,
  }));

  useEffect(() => {
    if (!id) return;
    getRecommendationById(id).then((rec) => {
      if (rec) {
        setRecommendation(rec);
        // Start water fill animation
        waterOpacity.value = withTiming(1, { duration: 300 });
        waterLevel.value = withTiming(30, {
          duration: 2000,
          easing: Easing.out(Easing.cubic),
        });
        // Show content after animation
        setTimeout(() => setShowContent(true), 1800);
      }
    });
  }, [id]);

  if (!recommendation) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: TEXT_SECONDARY }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Water fill background animation */}
      <Animated.View
        style={[
          styles.waterFill,
          { backgroundColor: recommendation.colorHex + '30' },
          waterStyle,
        ]}
      />

      <GradientBackground
        colorHex={recommendation.colorHex}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          {showContent ? (
            <Animated.View entering={FadeIn.duration(600)} style={styles.flex}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <PersonaCard recommendation={recommendation} />

                <PreparationList
                  ingredients={recommendation.ingredients}
                  accentColor={recommendation.colorHex}
                />

                <BathTimer
                  durationMinutes={recommendation.durationMinutes}
                  accentColor={recommendation.colorHex}
                />

                <MusicPlayer
                  track={recommendation.music}
                  accentColor={recommendation.colorHex}
                />

                {recommendation.safetyWarnings.length > 0 && (
                  <View style={styles.warningsSection}>
                    {recommendation.safetyWarnings.map((w, i) => (
                      <Text key={i} style={styles.warningText}>
                        {w}
                      </Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingEmoji}>🛁</Text>
              <Text style={styles.loadingText}>
                나만의 레시피를 준비하고 있어요...
              </Text>
            </View>
          )}
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
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
    marginRight: 8,
  },
  closeText: {
    fontSize: 22,
    color: TEXT_PRIMARY,
    fontWeight: '300',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  warningsSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WARNING_COLOR + '40',
    backgroundColor: WARNING_COLOR + '10',
  },
  warningText: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
    marginBottom: 6,
  },
});
