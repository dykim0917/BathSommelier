import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { TagSelector } from '@/src/components/TagSelector';
import { SafetyWarning } from '@/src/components/SafetyWarning';
import { PHYSICAL_TAGS, MENTAL_TAGS } from '@/src/data/tags';
import { DailyTag } from '@/src/engine/types';
import { generateRecommendation } from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { saveRecommendation } from '@/src/storage/history';
import {
  BG,
  OVERLAY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ACCENT,
  PERSONA_COLORS,
} from '@/src/data/colors';

export default function DailyCheckScreen() {
  const { profile } = useUserProfile();
  const haptic = useHaptic();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [warningVisible, setWarningVisible] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);
  const [pendingRecId, setPendingRecId] = useState<string | null>(null);

  const handleToggle = (tagId: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  const handleGetRecipe = async () => {
    if (!profile) return;
    haptic.medium();

    const dailyTags = [...selectedTags] as DailyTag[];
    const recommendation = generateRecommendation(profile, dailyTags);
    await saveRecommendation(recommendation);

    if (recommendation.safetyWarnings.length > 0) {
      setPendingWarnings(recommendation.safetyWarnings);
      setPendingRecId(recommendation.id);
      setWarningVisible(true);
    } else {
      router.push(`/result/${recommendation.id}`);
    }
  };

  const handleWarningDismiss = () => {
    setWarningVisible(false);
    if (pendingRecId) {
      router.push(`/result/${pendingRecId}`);
      setPendingRecId(null);
    }
  };

  const selectedCount = selectedTags.size;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>오늘 어떠세요?</Text>
        <Text style={styles.subtitle}>
          오늘의 상태를 선택하면{'\n'}맞춤 목욕 레시피를 추천해드릴게요
        </Text>

        <TagSelector
          title="몸 상태"
          tags={PHYSICAL_TAGS}
          selectedIds={selectedTags}
          onToggle={handleToggle}
          accentColor={PERSONA_COLORS.P3_MUSCLE}
        />

        <TagSelector
          title="마음 상태"
          tags={MENTAL_TAGS}
          selectedIds={selectedTags}
          onToggle={handleToggle}
          accentColor={PERSONA_COLORS.P4_SLEEP}
        />

        {selectedCount > 0 && (
          <Text style={styles.selectedCount}>
            {selectedCount}개 선택됨
          </Text>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.ctaButton}
          onPress={handleGetRecipe}
          disabled={!profile}
        >
          <Text style={styles.ctaText}>
            {selectedCount > 0
              ? '나만의 목욕 레시피 받기'
              : '오늘의 릴랙스 레시피 받기'}
          </Text>
        </Pressable>
      </View>

      <SafetyWarning
        visible={warningVisible}
        warnings={pendingWarnings}
        onDismiss={handleWarningDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: 28,
  },
  selectedCount: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
    backgroundColor: OVERLAY,
  },
  ctaButton: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
