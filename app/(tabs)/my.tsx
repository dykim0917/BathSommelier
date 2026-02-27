import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { BathEnvironment, BathRecommendation, HealthCondition, TripMemoryRecord } from '@/src/engine/types';
import { loadHistory } from '@/src/storage/history';
import { loadThemePreferenceWeights, loadTripMemoryHistory } from '@/src/storage/memory';
import { buildHistoryInsights } from '@/src/engine/historyInsights';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { THEME_BY_ID } from '@/src/data/themes';
import { copy } from '@/src/content/copy';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useHaptic } from '@/src/hooks/useHaptic';
import { clearProfile } from '@/src/storage/profile';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { CATEGORY_CARD_EMOJI } from '@/src/data/colors';
import {
  ACCENT,
  ACCENT_LIGHT,
  APP_BG_BASE,
  APP_BG_BOTTOM,
  APP_BG_TOP,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY,
  TYPE_CAPTION,
  TYPE_HEADING_MD,
  TYPE_TITLE,
} from '@/src/data/colors';

type MyTab = 'history' | 'settings';
type FilterMode = 'all' | 'care' | 'trip';

const FILTER_OPTIONS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'care', label: '케어' },
  { key: 'trip', label: '트립' },
];

const BATH_TYPE_LABELS: Record<string, string> = {
  full: '전신욕',
  half: '반신욕',
  foot: '족욕',
  shower: '샤워',
};

const MODE_LABELS = {
  care: copy.history.cardLabels.modeCare,
  trip: copy.history.cardLabels.modeTrip,
} as const;

const ENV_LABELS_HISTORY = {
  bathtub: '욕조',
  partial_bath: '부분입욕',
  footbath: '족욕',
  shower: '샤워',
} as const;

const ENV_LABELS_SETTINGS: Record<BathEnvironment, string> = {
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

const SIDE_PAD = 16;
const COL_GAP = 10;
const CARD_HEADER_HEIGHT = 100;

// ─── History Section ──────────────────────────────────────────────────────────

function HistorySection() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - SIDE_PAD * 2 - COL_GAP) / 2;

  const [history, setHistory] = useState<BathRecommendation[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<TripMemoryRecord[]>([]);
  const [themeWeights, setThemeWeights] = useState<Record<string, number>>({});
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        loadHistory(),
        loadTripMemoryHistory(),
        loadThemePreferenceWeights(),
      ]).then(([historyData, memoryData, weightData]) => {
        setHistory(historyData);
        setMemoryHistory(memoryData);
        setThemeWeights(weightData);
      });
    }, [])
  );

  const memoryByRecommendation = useMemo(() => {
    return Object.fromEntries(
      memoryHistory.map((record) => [record.recommendationId, record])
    ) as Record<string, TripMemoryRecord>;
  }, [memoryHistory]);

  const topThemeInsight = useMemo(() => {
    const sorted = Object.entries(themeWeights).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
    const [themeId, weight] = sorted[0];
    const themeTitle = THEME_BY_ID[themeId as keyof typeof THEME_BY_ID]?.title ?? themeId;
    return { themeTitle, weight };
  }, [themeWeights]);

  const insights = useMemo(
    () => buildHistoryInsights(history, memoryHistory),
    [history, memoryHistory]
  );

  const filteredHistory = useMemo(() => {
    if (filterMode === 'all') return history;
    return history.filter((item) => item.mode === filterMode);
  }, [history, filterMode]);

  const renderCard = ({ item, index }: { item: BathRecommendation; index: number }) => {
    const persona = PERSONA_DEFINITIONS.find((p) => p.code === item.persona);
    const title = item.themeTitle ?? persona?.nameKo ?? copy.history.cardLabels.defaultTitle;
    const emoji = CATEGORY_CARD_EMOJI[item.intentId ?? ''] ?? '🛁';
    const date = new Date(item.createdAt);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    const memory = memoryByRecommendation[item.id];
    const isLeft = index % 2 === 0;

    return (
      <Pressable
        style={[styles.gridCard, { width: cardWidth, marginRight: isLeft ? COL_GAP : 0 }]}
        onPress={() =>
          router.push({
            pathname: '/result/recipe/[id]',
            params: { id: item.id, source: 'history' },
          })
        }
      >
        <View style={[styles.gridCardHeader, { backgroundColor: item.colorHex + '33' }]}>
          <Text style={styles.gridCardEmoji}>{emoji}</Text>
          <View style={[styles.modePill, { backgroundColor: item.colorHex + '55' }]}>
            <Text style={styles.modePillText}>{MODE_LABELS[item.mode]}</Text>
          </View>
        </View>
        <View style={styles.gridCardFooter}>
          <Text style={styles.gridCardTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.gridCardMeta}>
            {item.temperature.recommended}°C · {BATH_TYPE_LABELS[item.bathType]}
          </Text>
          <View style={styles.gridCardBottom}>
            <Text style={styles.gridCardDate}>{dateStr}</Text>
            {memory?.narrativeRecallCard ? (
              <FontAwesome name="comment-o" size={10} color={TEXT_MUTED} />
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.pageTitle}>기록</Text>
      <Text style={styles.pageSubtitle}>
        {history.length > 0
          ? `총 ${history.length}개의 루틴을 완료했어요`
          : '첫 루틴을 시작해보세요'}
      </Text>

      {history.length > 0 && (
        <View style={styles.insightBanner}>
          <View style={styles.insightBannerLeft}>
            <Text style={styles.insightBannerLabel}>이번 달 요약</Text>
            <Text style={styles.insightBannerMain}>{insights.totalSessions}회 완료</Text>
            {insights.avgDurationMinutes > 0 && (
              <Text style={styles.insightBannerSub}>
                평균 {insights.avgDurationMinutes}분
                {insights.topEnvironment ? ` · ${ENV_LABELS_HISTORY[insights.topEnvironment]}` : ''}
              </Text>
            )}
            {topThemeInsight && (
              <Text style={styles.insightBannerTheme}>
                자주 찾은 테마: {topThemeInsight.themeTitle}
              </Text>
            )}
          </View>
          <View style={styles.insightBannerIcon}>
            <Text style={styles.insightBannerEmoji}>🛁</Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[styles.filterPill, filterMode === opt.key && styles.filterPillActive]}
            onPress={() => setFilterMode(opt.key)}
          >
            <Text style={[styles.filterPillText, filterMode === opt.key && styles.filterPillTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filteredHistory.length > 0 && (
        <Text style={styles.gridSectionLabel}>{filteredHistory.length}개의 루틴</Text>
      )}
    </View>
  );

  return (
    <View style={styles.historyContainer}>
      {filteredHistory.length === 0 && history.length === 0 ? (
        <>
          <ListHeader />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>{copy.history.empty.title}</Text>
            <Text style={styles.emptySubtext}>{copy.history.empty.subtitle}</Text>
          </View>
        </>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={2}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={
            <View style={styles.filterEmptyContainer}>
              <Text style={styles.filterEmptyText}>
                {filterMode === 'care' ? '케어' : '트립'} 루틴 기록이 없어요
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ─── Settings Section ──────────────────────────────────────────────────────────

function SettingsSection() {
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
      <View style={[styles.settingsContainer, styles.settingsCentered]}>
        <Text style={{ color: TEXT_SECONDARY }}>{copy.settings.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.settingsContainer}>
      <LinearGradient colors={[APP_BG_TOP, APP_BG_BOTTOM]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.settingsContent}>
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>{copy.settings.sectionProfile}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{copy.settings.environmentLabel}</Text>
            <Text style={styles.infoValue}>{ENV_LABELS_SETTINGS[profile.bathEnvironment]}</Text>
          </View>
          <View style={styles.conditionsList}>
            {(Object.keys(ENV_LABELS_SETTINGS) as BathEnvironment[]).map((env) => (
              <TouchableOpacity
                key={env}
                style={[
                  styles.conditionTagButton,
                  profile.bathEnvironment === env && styles.conditionTagButtonActive,
                ]}
                onPress={() => handleEnvironmentChange(env)}
                activeOpacity={0.78}
              >
                <Text style={[styles.conditionTag, profile.bathEnvironment === env && styles.conditionTagActiveText]}>
                  {ENV_LABELS_SETTINGS[env]}
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
                  <Text style={[styles.conditionTag, profile.healthConditions.includes(c) && styles.conditionTagActiveText]}>
                    {CONDITION_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helperText}>항목을 탭하면 바로 저장됩니다.</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>{copy.settings.sectionActions}</Text>
          <TouchableOpacity style={styles.actionCard} onPress={handleResetOnboarding} activeOpacity={0.78}>
            <Text style={styles.actionText}>{copy.settings.resetProfile}</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>{copy.settings.sectionApp}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{copy.settings.versionLabel}</Text>
            <Text style={styles.infoValue}>3.12.0</Text>
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

// ─── My Screen (Root) ──────────────────────────────────────────────────────────

export default function MyScreen() {
  const [activeTab, setActiveTab] = useState<MyTab>('history');

  return (
    <View style={styles.container}>
      <View style={styles.subTabRow}>
        {(['history', 'settings'] as MyTab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.subTabPill, activeTab === tab && styles.subTabPillActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.subTabText, activeTab === tab && styles.subTabTextActive]}>
              {tab === 'history' ? '기록' : '설정'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'history' ? <HistorySection /> : <SettingsSection />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG_BASE,
  },
  // Sub-tab row
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
    backgroundColor: APP_BG_BASE,
  },
  subTabPill: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  subTabPillActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  subTabText: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  // History section
  historyContainer: {
    flex: 1,
    backgroundColor: APP_BG_BASE,
  },
  list: {
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 32,
  },
  listHeader: {
    paddingTop: 8,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: TYPE_HEADING_MD,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: TYPE_BODY,
    color: TEXT_MUTED,
    marginBottom: 16,
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  insightBannerLeft: { flex: 1 },
  insightBannerLabel: {
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  insightBannerMain: {
    fontSize: TYPE_TITLE,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  insightBannerSub: {
    fontSize: TYPE_CAPTION,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  insightBannerTheme: {
    fontSize: TYPE_CAPTION,
    color: TEXT_SECONDARY,
    marginTop: 4,
    fontStyle: 'italic',
  },
  insightBannerIcon: { marginLeft: 16 },
  insightBannerEmoji: { fontSize: 40 },
  filterScroll: { marginBottom: 14 },
  filterContent: { gap: 8, paddingRight: 4 },
  filterPill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  filterPillActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  filterPillText: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  filterPillTextActive: { color: CARD_SURFACE },
  gridSectionLabel: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    marginBottom: 10,
    fontWeight: '600',
  },
  gridCard: {
    backgroundColor: CARD_SURFACE,
    borderRadius: 16,
    marginBottom: COL_GAP,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  gridCardHeader: {
    height: CARD_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridCardEmoji: { fontSize: 36 },
  modePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  modePillText: { fontSize: 10, fontWeight: '700', color: TEXT_PRIMARY },
  gridCardFooter: { padding: 10 },
  gridCardTitle: {
    fontSize: TYPE_BODY,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 2,
    lineHeight: 19,
  },
  gridCardMeta: {
    fontSize: TYPE_CAPTION,
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },
  gridCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridCardDate: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyText: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: TYPE_BODY,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  filterEmptyContainer: { paddingVertical: 40, alignItems: 'center' },
  filterEmptyText: { fontSize: TYPE_BODY, color: TEXT_MUTED },
  // Settings section
  settingsContainer: { flex: 1 },
  settingsCentered: { justifyContent: 'center', alignItems: 'center' },
  settingsContent: { padding: 18, paddingBottom: 28 },
  settingsSection: { marginBottom: 20 },
  settingsSectionTitle: {
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
  conditionsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
  conditionTag: { fontSize: 12, color: TEXT_PRIMARY, paddingHorizontal: 9, paddingVertical: 5 },
  conditionTagActiveText: { fontWeight: '700' },
  helperText: { marginTop: 8, fontSize: 12, color: TEXT_MUTED },
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
  actionText: { fontSize: TYPE_BODY, color: TEXT_PRIMARY, fontWeight: '600' },
  actionArrow: { fontSize: 18, color: ACCENT },
  disclosureInline: { marginTop: 8 },
});
