import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { BathEnvironment, HealthCondition } from '@/src/engine/types';
import { clearProfile } from '@/src/storage/profile';
import {
  BG,
  SURFACE,
  GLASS_BORDER,
  GLASS_SHADOW,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ACCENT_LIGHT,
} from '@/src/data/colors';

const ENV_LABELS: Record<BathEnvironment, string> = {
  bathtub: '🛁 욕조',
  footbath: '🦶 족욕',
  shower: '🚿 샤워',
};

const CONDITION_LABELS: Record<HealthCondition, string> = {
  hypertension_heart: '⚠️ 고혈압/심장',
  pregnant: '🤰 임신 중',
  diabetes: '🩸 당뇨',
  sensitive_skin: '🌵 민감성 피부',
  none: '✅ 해당 없음',
};

export default function SettingsScreen() {
  const { profile, loading } = useUserProfile();
  const haptic = useHaptic();

  const handleResetOnboarding = () => {
    Alert.alert(
      '프로필 초기화',
      '프로필을 초기화하면 온보딩부터 다시 시작합니다.\n계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            haptic.warning();
            await clearProfile();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  if (loading || !profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: TEXT_SECONDARY }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 프로필</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>목욕 환경</Text>
          <Text style={styles.infoValue}>
            {ENV_LABELS[profile.bathEnvironment]}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>건강 상태</Text>
          <View style={styles.conditionsList}>
            {profile.healthConditions.map((c) => (
              <Text key={c} style={styles.conditionTag}>
                {CONDITION_LABELS[c]}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>

        <Pressable style={styles.actionCard} onPress={handleResetOnboarding}>
          <Text style={styles.actionText}>프로필 다시 설정하기</Text>
          <Text style={styles.actionArrow}>→</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>버전</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>이름</Text>
          <Text style={styles.infoValue}>Bath Sommelier</Text>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  conditionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    flex: 1,
    marginLeft: 12,
  },
  conditionTag: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  actionArrow: {
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
});
