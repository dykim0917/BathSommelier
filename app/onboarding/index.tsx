import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BathEnvironment } from '@/src/engine/types';
import { useHaptic } from '@/src/hooks/useHaptic';
import {
  ACCENT,
  ACCENT_LIGHT,
  APP_BG_BASE,
  BTN_DISABLED,
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY,
  TYPE_CAPTION,
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>나의 목욕 환경을{'\n'}알려주세요</Text>
          <Text style={styles.subtitle}>환경에 맞는 최적의 레시피를 추천해드립니다</Text>
        </View>

        <View style={styles.cards}>
          {ENVIRONMENTS.map((env) => {
            const isSelected = selected === env.id;
            return (
              <TouchableOpacity
                key={env.id}
                activeOpacity={0.8}
                onPress={() => handleSelect(env.id)}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
              >
                <Text style={styles.emoji}>{env.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                    {env.labelKo}
                  </Text>
                  <Text style={styles.cardDesc}>{env.desc}</Text>
                </View>
                {isSelected && (
                  <FontAwesome name="check" size={16} color={ACCENT} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>01 / 02</Text>
        </View>

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
    backgroundColor: APP_BG_BASE,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: TYPE_HEADING_LG,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: TYPE_BODY,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  cards: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F7',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  cardSelected: {
    backgroundColor: ACCENT_LIGHT,
    borderColor: ACCENT,
  },
  emoji: {
    fontSize: 36,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  cardLabelSelected: {
    color: ACCENT,
  },
  cardDesc: {
    fontSize: TYPE_CAPTION,
    color: TEXT_SECONDARY,
  },
  spacer: {
    flex: 1,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: BTN_PRIMARY,
    borderRadius: 38,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  nextButtonDisabled: {
    backgroundColor: BTN_DISABLED,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: BTN_PRIMARY_TEXT,
    letterSpacing: 0.5,
  },
});
