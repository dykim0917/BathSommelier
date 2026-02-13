import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { BathEnvironment } from '@/src/engine/types';
import { useHaptic } from '@/src/hooks/useHaptic';
import {
  BG,
  SURFACE,
  GLASS_BORDER,
  GLASS_SHADOW,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ACCENT,
  ACCENT_LIGHT,
} from '@/src/data/colors';

const ENVIRONMENTS: {
  id: BathEnvironment;
  emoji: string;
  labelKo: string;
  desc: string;
}[] = [
  {
    id: 'bathtub',
    emoji: '🛁',
    labelKo: '욕조',
    desc: '전신욕, 반신욕 가능',
  },
  {
    id: 'footbath',
    emoji: '🦶',
    labelKo: '족욕 (대야)',
    desc: '족욕 전용',
  },
  {
    id: 'shower',
    emoji: '🚿',
    labelKo: '샤워부스',
    desc: '샤워 스티머 활용',
  },
];

export default function OnboardingEnvironment() {
  const [selected, setSelected] = useState<BathEnvironment | null>(null);
  const haptic = useHaptic();

  const handleSelect = (env: BathEnvironment) => {
    haptic.light();
    setSelected(env);
  };

  const handleNext = () => {
    if (!selected) return;
    haptic.medium();
    router.push({
      pathname: '/onboarding/health',
      params: { environment: selected },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.step}>1 / 2</Text>
          <Text style={styles.title}>나의 목욕 환경을{'\n'}알려주세요</Text>
          <Text style={styles.subtitle}>
            환경에 맞는 최적의 레시피를 추천해드립니다
          </Text>
        </View>

        <View style={styles.cards}>
          {ENVIRONMENTS.map((env) => (
            <TouchableOpacity
              key={env.id}
              activeOpacity={0.7}
              onPress={() => handleSelect(env.id)}
              style={[
                styles.card,
                selected === env.id && styles.cardSelected,
              ]}
            >
              <Text style={styles.emoji}>{env.emoji}</Text>
              <Text
                style={[
                  styles.cardLabel,
                  selected === env.id && styles.cardLabelSelected,
                ]}
              >
                {env.labelKo}
              </Text>
              <Text style={styles.cardDesc}>{env.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNext}
          disabled={!selected}
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
        >
          <Text style={styles.nextText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 36,
  },
  step: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  cards: {
    flex: 1,
    gap: 12,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: GLASS_BORDER,
    padding: 24,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardSelected: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_LIGHT,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  cardLabelSelected: {
    color: ACCENT,
  },
  cardDesc: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
