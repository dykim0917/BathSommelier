import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BathEnvironment, HealthCondition, UserProfile } from '@/src/engine/types';
import { TagChip } from '@/src/components/TagChip';
import { useHaptic } from '@/src/hooks/useHaptic';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import {
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
  const [selectedConditions, setSelectedConditions] = useState<Set<HealthCondition>>(new Set());
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
    router.push('/onboarding/greeting');
  };

  const hasSelection = selectedConditions.size > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/onboarding');
            }}
          >
            <FontAwesome name="angle-left" size={28} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>건강 상태를{'\n'}선택해주세요</Text>
            <Text style={styles.subtitle}>안전한 입욕법을 위해 해당 사항을 모두 선택해주세요</Text>
          </View>
        </View>

        <View style={styles.conditions}>
          {CONDITIONS.map((cond) => (
            <TagChip
              key={cond.id}
              label={cond.labelKo}
              emoji={cond.emoji}
              selected={selectedConditions.has(cond.id)}
              accentColor={cond.id === 'none' ? '#7AAE89' : '#D39A6F'}
              onPress={() => handleToggle(cond.id)}
            />
          ))}
        </View>

        <View style={styles.spacer} />

        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>02 / 02</Text>
        </View>

        <Pressable
          style={[styles.completeButton, !hasSelection && styles.completeButtonDisabled]}
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
    backgroundColor: APP_BG_BASE,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flex: 1,
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
  conditions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  completeButton: {
    backgroundColor: BTN_PRIMARY,
    borderRadius: 38,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  completeButtonDisabled: {
    backgroundColor: BTN_DISABLED,
  },
  completeText: {
    fontSize: 16,
    fontWeight: '700',
    color: BTN_PRIMARY_TEXT,
    letterSpacing: 0.5,
  },
});
