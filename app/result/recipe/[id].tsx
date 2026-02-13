import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BathRecommendation } from '@/src/engine/types';
import { getRecommendationById } from '@/src/storage/history';
import { GradientBackground } from '@/src/components/GradientBackground';
import { PersonaCard } from '@/src/components/PersonaCard';
import { IngredientCarousel } from '@/src/components/IngredientCarousel';
import {
  BG,
  CARD_BORDER_SOFT,
  CARD_GLASS,
  CARD_SHADOW_SOFT,
  PASTEL_BG_BOTTOM,
  PASTEL_BG_TOP,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/src/data/colors';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] =
    useState<BathRecommendation | null>(null);
  const { height } = useWindowDimensions();

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

  const modeLabel = recommendation.mode === 'trip' ? 'Trip Mode' : 'Care Mode';
  const compact = height < 780;

  return (
    <View style={styles.container}>
      <GradientBackground
        colorHex={compact ? PASTEL_BG_TOP : recommendation.colorHex}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.bloomLayer} />
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Animated.View entering={FadeIn.duration(450)} style={styles.modeRow}>
            <View style={[styles.modeBadge, { borderColor: recommendation.colorHex }]}>
              <Text style={[styles.modeBadgeText, { color: recommendation.colorHex }]}>{modeLabel}</Text>
            </View>
            {recommendation.themeTitle ? (
              <Text style={styles.themeText}>{recommendation.themeTitle}</Text>
            ) : null}
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(500)}
            style={[styles.topSection, compact && styles.topSectionCompact]}
          >
            <PersonaCard recommendation={recommendation} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(550).delay(150)}
            style={[styles.middleSection, compact && styles.middleSectionCompact]}
          >
            <IngredientCarousel
              ingredients={recommendation.ingredients}
              accentColor={recommendation.colorHex}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(280)}
            style={[styles.bottomSection, compact && styles.bottomSectionCompact]}
          >
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: recommendation.colorHex }]}
              onPress={handleStartBath}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>입욕 시작</Text>
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
  bloomLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PASTEL_BG_BOTTOM + '66',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 12,
    marginRight: 8,
  },
  closeText: {
    fontSize: 22,
    color: TEXT_PRIMARY,
    fontWeight: '300',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
    gap: 10,
  },
  modeBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: CARD_GLASS,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '600',
  },
  topSection: {
    flex: 2.7,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  topSectionCompact: {
    flex: 2.3,
  },
  middleSection: {
    flex: 4.9,
    justifyContent: 'center',
    paddingTop: 8,
  },
  middleSectionCompact: {
    flex: 4.3,
  },
  bottomSection: {
    flex: 1.8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  bottomSectionCompact: {
    flex: 1.5,
    paddingBottom: 8,
  },
  startButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
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
