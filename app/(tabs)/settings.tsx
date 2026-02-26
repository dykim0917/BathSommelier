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
  const { profile, loading, update } = useUserProfile();
  const haptic = useHaptic();

  const handleEnvironmentChange = async (environment: BathEnvironment) => {
    if (!profile) return;
    if (profile.bathEnvironment === environment) return;
    haptic.light();
    await update({ bathEnvironment: environment });
  };

  const handleHealthToggle = async (condition: HealthCondition) => {
    if (!profile) return;
    const next = new Set(profile.healthConditions);
    if (condition === 'none') {
      next.clear();
      next.add('none');
    } else {
      next.delete('none');
      if (next.has(condition)) {
        next.delete(condition);
      } else {
        next.add(condition);
      }
      if (next.size === 0) {
        next.add('none');
      }
    }

    haptic.light();
    await update({ healthConditions: Array.from(next) });
  };

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
          <View style={styles.conditionsList}>
            {(Object.keys(ENV_LABELS) as BathEnvironment[]).map((env) => (
              <TouchableOpacity
                key={env}
                style={[
                  styles.conditionTagButton,
                  profile.bathEnvironment === env && styles.conditionTagButtonActive,
                ]}
                onPress={() => handleEnvironmentChange(env)}
                activeOpacity={0.78}
              >
                <Text
                  style={[
                    styles.conditionTag,
                    profile.bathEnvironment === env && styles.conditionTagActiveText,
                  ]}
                >
                  {ENV_LABELS[env]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoCardColumn}>
            <Text style={styles.infoLabel}>{copy.settings.healthLabel}</Text>
            <View style={styles.conditionsList}>
              {(Object.keys(CONDITION_LABELS) as HealthCondition[]).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.conditionTagButton,
                    profile.healthConditions.includes(c) && styles.conditionTagButtonActive,
                  ]}
                  onPress={() => handleHealthToggle(c)}
                  activeOpacity={0.78}
                >
                  <Text
                    style={[
                      styles.conditionTag,
                      profile.healthConditions.includes(c) && styles.conditionTagActiveText,
                    ]}
                  >
                    {CONDITION_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helperText}>항목을 탭하면 바로 저장됩니다.</Text>
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
  conditionTagButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  conditionTagButtonActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(120,149,207,0.14)',
  },
  conditionTag: {
    fontSize: 12,
    color: TEXT_PRIMARY,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  conditionTagActiveText: {
    fontWeight: '700',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: TEXT_MUTED,
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
