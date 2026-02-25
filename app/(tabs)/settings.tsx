import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { BathEnvironment, HealthCondition } from '@/src/engine/types';
import { clearProfile } from '@/src/storage/profile';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { copy } from '@/src/content/copy';
import {
  ACCENT,
  APP_BG_BOTTOM,
  APP_BG_TOP,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY,
  TYPE_TITLE,
} from '@/src/data/colors';

const ENV_LABELS: Record<BathEnvironment, string> = {
  bathtub: '🛁 욕조',
  partial_bath: '🦶 부분입욕',
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
      copy.settings.resetDialogTitle,
      copy.settings.resetDialogBody,
      [
        { text: copy.settings.resetCancel, style: 'cancel' },
        {
          text: copy.settings.resetConfirm,
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
        <Text style={{ color: TEXT_SECONDARY }}>{copy.settings.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[APP_BG_TOP, APP_BG_BOTTOM]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.settings.sectionProfile}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{copy.settings.environmentLabel}</Text>
            <Text style={styles.infoValue}>{ENV_LABELS[profile.bathEnvironment]}</Text>
          </View>

          <View style={styles.infoCardColumn}>
            <Text style={styles.infoLabel}>{copy.settings.healthLabel}</Text>
            <View style={styles.conditionsList}>
              {profile.healthConditions.map((c) => (
                <Text key={c} style={styles.conditionTag}>{CONDITION_LABELS[c]}</Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.settings.sectionActions}</Text>

          <TouchableOpacity style={styles.actionCard} onPress={handleResetOnboarding} activeOpacity={0.78}>
            <Text style={styles.actionText}>{copy.settings.resetProfile}</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.settings.sectionApp}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{copy.settings.versionLabel}</Text>
            <Text style={styles.infoValue}>3.2.0</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{copy.settings.nameLabel}</Text>
            <Text style={styles.infoValue}>Bath Sommelier</Text>
          </View>
          <PersistentDisclosure style={styles.disclosureInline} showColdWarning />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: CARD_SURFACE,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 9,
    elevation: 2,
  },
  infoCardColumn: {
    backgroundColor: CARD_SURFACE,
    borderRadius: 16,
    padding: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 9,
    elevation: 2,
  },
  infoLabel: {
    fontSize: TYPE_BODY,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  conditionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  conditionTag: {
    fontSize: 12,
    color: TEXT_PRIMARY,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: CARD_BORDER,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  actionCard: {
    backgroundColor: CARD_SURFACE,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 9,
    elevation: 2,
  },
  actionText: {
    fontSize: TYPE_BODY,
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
  actionArrow: {
    fontSize: 18,
    color: ACCENT,
  },
  disclosureInline: {
    marginTop: 8,
  },
});
