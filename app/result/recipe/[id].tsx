import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BathRecommendation } from '@/src/engine/types';
import { getRecommendationById } from '@/src/storage/history';
import { GradientBackground } from '@/src/components/GradientBackground';
import { PersonaCard } from '@/src/components/PersonaCard';
import { IngredientCarousel } from '@/src/components/IngredientCarousel';
import { BG, TEXT_PRIMARY, TEXT_SECONDARY, ACCENT } from '@/src/data/colors';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
        <Text style={{ color: TEXT_SECONDARY }}>로딩 중...</Text>
      </View>
    );
  }

  const handleStartBath = () => {
    router.replace(`/result/timer/${id}`);
  };

  return (
    <View style={styles.container}>
      <GradientBackground
        colorHex={recommendation.colorHex}
        style={StyleSheet.absoluteFillObject}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Top 30%: Persona Card */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.topSection}>
            <PersonaCard recommendation={recommendation} />
          </Animated.View>

          {/* Middle 50%: Ingredient Carousel */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.middleSection}
          >
            <IngredientCarousel
              ingredients={recommendation.ingredients}
              accentColor={recommendation.colorHex}
            />
          </Animated.View>

          {/* Bottom 20%: Start Button */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
            style={styles.bottomSection}
          >
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: recommendation.colorHex }]}
              onPress={handleStartBath}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>🛁 입욕 시작</Text>
            </TouchableOpacity>
          </Animated.View>
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
  topSection: {
    flex: 3,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  middleSection: {
    flex: 5,
    justifyContent: 'center',
  },
  bottomSection: {
    flex: 2,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 10,
  },
  startButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
