import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TagSelector } from '@/src/components/TagSelector';
import { SafetyWarning } from '@/src/components/SafetyWarning';
import { PHYSICAL_TAGS, MENTAL_TAGS } from '@/src/data/tags';
import { THEMES } from '@/src/data/themes';
import {
  DailyTag,
  ThemeId,
  BathEnvironment,
  RecommendationMode,
  ThemeCoverStyleId,
} from '@/src/engine/types';
import {
  generateCareRecommendation,
  generateTripRecommendation,
} from '@/src/engine/recommend';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { saveRecommendation } from '@/src/storage/history';
import { loadLastEnvironment, saveLastEnvironment } from '@/src/storage/environment';
import {
  ACCENT,
  CARD_BORDER_SOFT,
  CARD_GLASS,
  CARD_SHADOW_SOFT,
  GLASS_BORDER,
  PASTEL_BG_BOTTOM,
  PASTEL_BG_TOP,
  PERSONA_COLORS,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
} from '@/src/data/colors';

const MODES: { id: RecommendationMode; label: string }[] = [
  { id: 'care', label: 'Care (치유)' },
  { id: 'trip', label: 'Trip (여행)' },
];

const ENV_OPTIONS: { id: BathEnvironment; emoji: string; label: string }[] = [
  { id: 'bathtub', emoji: '🛁', label: '욕조' },
  { id: 'footbath', emoji: '🦶', label: '족욕' },
  { id: 'shower', emoji: '🚿', label: '샤워' },
];

const ENV_LABELS: Record<BathEnvironment, string> = {
  bathtub: '욕조',
  footbath: '족욕',
  shower: '샤워',
};

const COVER_COLORS: Record<ThemeCoverStyleId, [string, string, string]> = {
  kyoto: ['#D7EFE3', '#BFDCC5', '#8CB59C'],
  rain: ['#DDE7F9', '#B8CAE8', '#7A98C6'],
  paris: ['#F6E2EC', '#E6D7F7', '#A697D9'],
  nordic: ['#E5EBF2', '#CFD9E6', '#95A6C0'],
  desert: ['#F8E3CC', '#F2CFA8', '#C9925A'],
  ocean: ['#D9EEF7', '#B4DDF0', '#7CB5D4'],
  tea: ['#EEDFCE', '#D8C2A7', '#AA8861'],
  snow: ['#EFF3FA', '#DCE5F3', '#AFBFD8'],
};

interface ThemeCardBackgroundProps {
  coverStyleId: ThemeCoverStyleId;
}

function ThemeCardBackground({ coverStyleId }: ThemeCardBackgroundProps) {
  const colors = COVER_COLORS[coverStyleId];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.coverBlobA} />
      <View style={styles.coverBlobB} />
      <LinearGradient
        colors={['rgba(30,48,82,0.12)', 'rgba(30,48,82,0.02)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

export default function DailyCheckScreen() {
  const { profile } = useUserProfile();
  const haptic = useHaptic();
  const { width } = useWindowDimensions();

  const [mode, setMode] = useState<RecommendationMode>('care');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('kyoto_forest');
  const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');

  const [warningVisible, setWarningVisible] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);
  const [pendingRecId, setPendingRecId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    loadLastEnvironment().then((saved) => {
      setEnvironment(saved ?? profile.bathEnvironment);
    });
  }, [profile]);

  const selectedThemePreset = useMemo(
    () => THEMES.find((theme) => theme.id === selectedTheme),
    [selectedTheme]
  );

  const cardWidth = Math.max(150, (width - 52) / 2);

  const handleToggleTag = (tagId: string) => {
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

  const handleSelectEnvironment = (nextEnvironment: BathEnvironment) => {
    haptic.light();
    setEnvironment(nextEnvironment);
    saveLastEnvironment(nextEnvironment);
  };

  const handleGetRecipe = async () => {
    if (!profile) return;
    haptic.medium();

    const recommendation =
      mode === 'care'
        ? generateCareRecommendation(
            profile,
            [...selectedTags] as DailyTag[],
            environment
          )
        : generateTripRecommendation(profile, selectedTheme, environment);

    await saveRecommendation(recommendation);

    if (recommendation.safetyWarnings.length > 0) {
      setPendingWarnings(recommendation.safetyWarnings);
      setPendingRecId(recommendation.id);
      setWarningVisible(true);
      return;
    }

    router.push(`/result/recipe/${recommendation.id}`);
  };

  const handleWarningDismiss = () => {
    setWarningVisible(false);
    if (pendingRecId) {
      router.push(`/result/recipe/${pendingRecId}`);
      setPendingRecId(null);
    }
  };

  const selectedCount = selectedTags.size;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PASTEL_BG_TOP, PASTEL_BG_BOTTOM]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.headerArea}>
        <Text style={styles.greeting}>Bath Sommelier 3.1</Text>
        <Text style={styles.subtitle}>목적을 먼저 고르고 오늘의 레시피를 시작하세요</Text>

        <View style={styles.modeTabs}>
          {MODES.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.modeTab, mode === option.id && styles.modeTabActive]}
              onPress={() => {
                haptic.light();
                setMode(option.id);
              }}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === option.id && styles.modeTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.bodyArea}>
        {mode === 'care' ? (
          <ScrollView
            contentContainerStyle={styles.careContent}
            showsVerticalScrollIndicator={false}
          >
            <TagSelector
              title="몸 상태"
              tags={PHYSICAL_TAGS}
              selectedIds={selectedTags}
              onToggle={handleToggleTag}
              accentColor={PERSONA_COLORS.P3_MUSCLE}
            />

            <TagSelector
              title="마음 상태"
              tags={MENTAL_TAGS}
              selectedIds={selectedTags}
              onToggle={handleToggleTag}
              accentColor={PERSONA_COLORS.P4_SLEEP}
            />

            {selectedCount > 0 && (
              <Text style={styles.selectedCount}>{selectedCount}개 선택됨</Text>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={THEMES}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tripGridContent}
            columnWrapperStyle={styles.tripGridRow}
            renderItem={({ item }) => {
              const selected = selectedTheme === item.id;
              return (
                <Pressable
                  style={[
                    styles.themeCard,
                    { width: cardWidth },
                    selected && {
                      borderColor: item.colorHex,
                      shadowColor: item.colorHex,
                    },
                  ]}
                  onPress={() => {
                    haptic.light();
                    setSelectedTheme(item.id);
                  }}
                >
                  <ThemeCardBackground coverStyleId={item.coverStyleId} />
                  <View style={styles.themeContent}>
                    <View style={styles.themeTopRow}>
                      <Text style={styles.themeCardTitle}>{item.title}</Text>
                      {selected ? <Text style={styles.checkMark}>✓</Text> : null}
                    </View>
                    <Text numberOfLines={2} style={styles.themeCardSubtitle}>{item.subtitle}</Text>
                    <Text style={styles.themeMeta}>
                      {item.baseTemp}°C · 추천 {ENV_LABELS[item.recommendedEnvironment]}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
            ListFooterComponent={
              selectedThemePreset ? (
                <View style={styles.themeHintCard}>
                  <Text style={styles.themeHintText}>
                    향 추천: {selectedThemePreset.recScent} · 조명: {selectedThemePreset.lighting}
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.environmentRow}>
          {ENV_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.environmentChip,
                environment === option.id && styles.environmentChipActive,
              ]}
              onPress={() => handleSelectEnvironment(option.id)}
            >
              <Text style={styles.environmentText}>{option.emoji} {option.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.ctaButton}
          onPress={handleGetRecipe}
          disabled={!profile}
        >
          <Text style={styles.ctaText}>
            {mode === 'care'
              ? selectedCount > 0
                ? 'Care 레시피 받기'
                : '기본 Care 레시피 받기'
              : 'Trip 레시피 받기'}
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
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  bodyArea: {
    flex: 1,
  },
  careContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: TYPE_SCALE.headingLg,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 14,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: CARD_GLASS,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    padding: 4,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  modeTab: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: ACCENT,
  },
  modeText: {
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },
  modeTextActive: {
    color: '#fff',
  },
  selectedCount: {
    fontSize: TYPE_SCALE.caption,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
  },
  tripGridContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tripGridRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  themeCard: {
    height: 170,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.4,
    borderColor: GLASS_BORDER,
    backgroundColor: CARD_GLASS,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  themeContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  themeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#21324D',
    flexShrink: 1,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A4FA3',
  },
  themeCardSubtitle: {
    fontSize: 11,
    color: '#314562',
    lineHeight: 15,
  },
  themeMeta: {
    fontSize: 11,
    color: '#1E2E4A',
    fontWeight: '700',
  },
  themeHintCard: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: CARD_GLASS,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    padding: 12,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  themeHintText: {
    fontSize: TYPE_SCALE.caption,
    color: TEXT_SECONDARY,
    lineHeight: 17,
  },
  coverBlobA: {
    position: 'absolute',
    top: -24,
    right: -16,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  coverBlobB: {
    position: 'absolute',
    bottom: -34,
    left: -20,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  bottomBar: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: CARD_GLASS,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER_SOFT,
  },
  environmentRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  environmentChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  environmentChipActive: {
    borderColor: ACCENT,
    backgroundColor: '#EDE9FE',
  },
  environmentText: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  ctaButton: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
