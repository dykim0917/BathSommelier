import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BathEnvironment } from '@/src/engine/types';
import { useHaptic } from '@/src/hooks/useHaptic';
import {
  ACCENT,
  APP_BG_BOTTOM,
  APP_BG_TOP,
  BTN_DISABLED,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY,
  TYPE_HEADING_LG,
  TYPE_TITLE,
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
      <LinearGradient
        colors={[APP_BG_TOP, APP_BG_BOTTOM]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.bloomPink} />
      <View style={styles.bloomBlue} />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.step}>01 / 02</Text>
          <Text style={styles.title}>나의 목욕 환경을 알려주세요</Text>
          <Text style={styles.subtitle}>환경에 맞는 최적의 레시피를 추천해드립니다</Text>
        </View>

        <View style={styles.cards}>
          {ENVIRONMENTS.map((env) => (
            <TouchableOpacity
              key={env.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(env.id)}
              style={[
                styles.card,
                selected === env.id && {
                  borderColor: ACCENT,
                  backgroundColor: '#EDF3FF',
                },
              ]}
            >
              <Text style={styles.emoji}>{env.emoji}</Text>
              <Text style={styles.cardLabel}>{env.labelKo}</Text>
              <Text style={styles.cardDesc}>{env.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          activeOpacity={0.85}
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
  },
  bloomPink: {
    position: 'absolute',
    right: -46,
    top: 84,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(248,208,208,0.35)',
  },
  bloomBlue: {
    position: 'absolute',
    left: -56,
    bottom: 120,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(120,149,207,0.22)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    marginBottom: 20,
  },
  step: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: TYPE_HEADING_LG,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPE_BODY,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  cards: {
    flex: 1,
    gap: 10,
  },
  card: {
    backgroundColor: CARD_SURFACE,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 18,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  emoji: {
    fontSize: 34,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  nextButton: {
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: BTN_DISABLED,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: BTN_PRIMARY_TEXT,
  },
});
