import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { BathRecommendation, TripMemoryRecord } from '@/src/engine/types';
import { loadHistory } from '@/src/storage/history';
import { loadThemePreferenceWeights, loadTripMemoryHistory } from '@/src/storage/memory';
import { buildHistoryInsights } from '@/src/engine/historyInsights';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { formatDuration } from '@/src/utils/time';
import { THEME_BY_ID } from '@/src/data/themes';
import { copy } from '@/src/content/copy';
import { CATEGORY_CARD_EMOJI } from '@/src/data/colors';
import {
  ACCENT,
  ACCENT_LIGHT,
  APP_BG_BASE,
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

const ENV_LABELS = {
  bathtub: '욕조',
  partial_bath: '부분입욕',
  footbath: '족욕',
  shower: '샤워',
} as const;

const SIDE_PAD = 16;
const COL_GAP = 10;
const CARD_HEADER_HEIGHT = 100;

export default function HistoryScreen() {
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
    const title =
      item.themeTitle ?? persona?.nameKo ?? copy.history.cardLabels.defaultTitle;
    const emoji = CATEGORY_CARD_EMOJI[item.intentId ?? ''] ?? '🛁';
    const date = new Date(item.createdAt);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    const memory = memoryByRecommendation[item.id];
    const isLeft = index % 2 === 0;

    return (
      <Pressable
        style={[
          styles.gridCard,
          { width: cardWidth, marginRight: isLeft ? COL_GAP : 0 },
        ]}
        onPress={() =>
          router.push({
            pathname: '/result/recipe/[id]',
            params: { id: item.id, source: 'history' },
          })
        }
      >
        {/* Colored header */}
        <View
          style={[
            styles.gridCardHeader,
            { backgroundColor: item.colorHex + '33' },
          ]}
        >
          <Text style={styles.gridCardEmoji}>{emoji}</Text>
          <View
            style={[
              styles.modePill,
              { backgroundColor: item.colorHex + '55' },
            ]}
          >
            <Text style={styles.modePillText}>{MODE_LABELS[item.mode]}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.gridCardFooter}>
          <Text style={styles.gridCardTitle} numberOfLines={2}>
            {title}
          </Text>
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
      {/* Page heading */}
      <Text style={styles.pageTitle}>기록</Text>
      <Text style={styles.pageSubtitle}>
        {history.length > 0
          ? `총 ${history.length}개의 루틴을 완료했어요`
          : '첫 루틴을 시작해보세요'}
      </Text>

      {/* Insight banner */}
      {history.length > 0 && (
        <View style={styles.insightBanner}>
          <View style={styles.insightBannerLeft}>
            <Text style={styles.insightBannerLabel}>이번 달 요약</Text>
            <Text style={styles.insightBannerMain}>
              {insights.totalSessions}회 완료
            </Text>
            {insights.avgDurationMinutes > 0 && (
              <Text style={styles.insightBannerSub}>
                평균 {insights.avgDurationMinutes}분
                {insights.topEnvironment
                  ? ` · ${ENV_LABELS[insights.topEnvironment]}`
                  : ''}
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

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[
              styles.filterPill,
              filterMode === opt.key && styles.filterPillActive,
            ]}
            onPress={() => setFilterMode(opt.key)}
          >
            <Text
              style={[
                styles.filterPillText,
                filterMode === opt.key && styles.filterPillTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filteredHistory.length > 0 && (
        <Text style={styles.gridSectionLabel}>
          {filteredHistory.length}개의 루틴
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {filteredHistory.length === 0 && history.length === 0 ? (
        <>
          <ListHeader />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>{copy.history.empty.title}</Text>
            <Text style={styles.emptySubtext}>
              {copy.history.empty.subtitle}
            </Text>
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

const styles = StyleSheet.create({
  container: {
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
  // Insight banner
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
  insightBannerLeft: {
    flex: 1,
  },
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
  insightBannerIcon: {
    marginLeft: 16,
  },
  insightBannerEmoji: {
    fontSize: 40,
  },
  // Filter
  filterScroll: {
    marginBottom: 14,
  },
  filterContent: {
    gap: 8,
    paddingRight: 4,
  },
  filterPill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  filterPillActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  filterPillText: {
    fontSize: TYPE_BODY,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  filterPillTextActive: {
    color: CARD_SURFACE,
  },
  gridSectionLabel: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    marginBottom: 10,
    fontWeight: '600',
  },
  // Grid card
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
  gridCardEmoji: {
    fontSize: 36,
  },
  modePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  modePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  gridCardFooter: {
    padding: 10,
  },
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
  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
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
  filterEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  filterEmptyText: {
    fontSize: TYPE_BODY,
    color: TEXT_MUTED,
  },
});
