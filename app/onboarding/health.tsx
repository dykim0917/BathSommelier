import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BathEnvironment, HealthCondition, UserProfile } from '@/src/engine/types';
import { TagChip } from '@/src/components/TagChip';
import { useHaptic } from '@/src/hooks/useHaptic';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import {
  BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WARNING_COLOR,
  ACCENT,
} from '@/src/data/colors';

interface ConditionOption {
  id: HealthCondition;
  labelKo: string;
  emoji: string;
}

const CONDITIONS: ConditionOption[] = [
  { id: 'hypertension_heart', labelKo: '고혈압/심장', emoji: '⚠️' },
  { id: 'pregnant', labelKo: '임신 중', emoji: '🤰' },
  { id: 'diabetes', labelKo: '당뇨', emoji: '🩸' },
  { id: 'sensitive_skin', labelKo: '민감성 피부', emoji: '🌵' },
  { id: 'none', labelKo: '해당 없음', emoji: '✅' },
];

export default function OnboardingHealth() {
  const { environment } = useLocalSearchParams<{ environment: string }>();
  const [selectedConditions, setSelectedConditions] = useState<
    Set<HealthCondition>
  >(new Set());
  const haptic = useHaptic();
  const { save } = useUserProfile();

  const handleToggle = (condition: HealthCondition) => {
    haptic.light();
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      if (condition === 'none') {
        return new Set(['none'] as HealthCondition[]);
      }
      next.delete('none');
      if (next.has(condition)) {
        next.delete(condition);
      } else {
        next.add(condition);
      }
      if (next.size === 0) {
        next.add('none');
      }
      return next;
    });
  };

  const handleComplete = async () => {
    haptic.success();
    const profile: UserProfile = {
      bathEnvironment: (environment as BathEnvironment) || 'bathtub',
      healthConditions: [...selectedConditions],
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await save(profile);
    router.replace('/(tabs)');
  };

  const hasSelection = selectedConditions.size > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.step}>2 / 2</Text>
          <Text style={styles.title}>건강 상태를{'\n'}선택해주세요</Text>
          <Text style={styles.subtitle}>
            안전한 입욕법을 위해 해당 사항을 모두 선택해주세요
          </Text>
        </View>

        <View style={styles.conditions}>
          {CONDITIONS.map((cond) => (
            <TagChip
              key={cond.id}
              label={cond.labelKo}
              emoji={cond.emoji}
              selected={selectedConditions.has(cond.id)}
              accentColor={cond.id === 'none' ? '#2E8B57' : WARNING_COLOR}
              onPress={() => handleToggle(cond.id)}
            />
          ))}
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={[
            styles.completeButton,
            !hasSelection && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!hasSelection}
        >
          <Text style={styles.completeText}>완료</Text>
        </Pressable>
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
  conditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  spacer: {
    flex: 1,
  },
  completeButton: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  completeButtonDisabled: {
    opacity: 0.4,
  },
  completeText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
