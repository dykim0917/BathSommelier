import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { BathRecommendation, TripMemoryRecord } from '@/src/engine/types';
import { loadHistory } from '@/src/storage/history';
import { loadThemePreferenceWeights, loadTripMemoryHistory } from '@/src/storage/memory';
import { buildHistoryInsights } from '@/src/engine/historyInsights';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { formatDuration } from '@/src/utils/time';
import { THEME_BY_ID } from '@/src/data/themes';
import { copy } from '@/src/content/copy';
import {
  APP_BG_BOTTOM,
  APP_BG_TOP,
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_CAPTION,
  TYPE_TITLE,
} from '@/src/data/colors';

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

export default function HistoryScreen() {
  const [history, setHistory] = useState<BathRecommendation[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<TripMemoryRecord[]>([]);
  const [themeWeights, setThemeWeights] = useState<Record<string, number>>({});
  const [isInsightExpanded, setIsInsightExpanded] = useState(true);

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

  const latestMemory = memoryHistory[0] ?? null;
  const insights = useMemo(
    () => buildHistoryInsights(history, memoryHistory),
    [history, memoryHistory]
  );

  const renderItem = ({ item }: { item: BathRecommendation }) => {
    const persona = PERSONA_DEFINITIONS.find((p) => p.code === item.persona);
    const memory = memoryByRecommendation[item.id];
    const date = new Date(item.createdAt);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/result/recipe/${item.id}`)}
      >
        <View style={[styles.colorDot, { backgroundColor: item.colorHex }]} />
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>
              {item.themeTitle ?? persona?.nameKo ?? copy.history.cardLabels.defaultTitle}
            </Text>
            <View
              style={[
                styles.modeBadge,
                {
                  borderColor: item.mode === 'trip' ? '#8B7FD6' : '#7A9FD3',
                },
              ]}
            >
              <Text style={styles.modeBadgeText}>{MODE_LABELS[item.mode]}</Text>
            </View>
          </View>

          <Text style={styles.cardMeta}>
            {item.temperature.recommended}°C · {BATH_TYPE_LABELS[item.bathType]} · {formatDuration(item.durationMinutes)}
          </Text>
          <Text style={styles.cardSubMeta}>
            {copy.history.cardLabels.environmentPrefix} {ENV_LABELS[item.environmentUsed]}
          </Text>
          {memory ? (
            <>
              {memory.themeId ? (
                <Text style={styles.memoryMeta}>
                  {copy.history.cardLabels.weightPrefix} {memory.themePreferenceWeight}
                </Text>
              ) : null}
              <Text style={styles.memoryRecall}>{memory.narrativeRecallCard}</Text>
            </>
          ) : null}
        </View>
        <Text style={styles.cardDate}>{dateStr}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[APP_BG_TOP, APP_BG_BOTTOM]}
        style={StyleSheet.absoluteFillObject}
      />

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>{copy.history.empty.title}</Text>
          <Text style={styles.emptySubtext}>{copy.history.empty.subtitle}</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={styles.insightCard}>
              <View style={styles.insightHeaderRow}>
                <Text style={styles.insightTitle}>{copy.history.title}</Text>
                <Pressable
                  style={styles.expandButton}
                  onPress={() => setIsInsightExpanded((prev) => !prev)}
                >
                  <Text style={styles.expandButtonText}>
                    {isInsightExpanded ? copy.history.collapse : copy.history.expand}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.insightLine}>
                {copy.history.summary.sessions}: {insights.totalSessions} ·{' '}
                {copy.history.summary.care} {insights.careSessions} ·{' '}
                {copy.history.summary.trip} {insights.tripSessions}
              </Text>
              <Text style={styles.insightLine}>
                {copy.history.summary.avgDuration}:{' '}
                {insights.avgDurationMinutes > 0
                  ? `${insights.avgDurationMinutes}분`
                  : copy.history.summary.noData}
              </Text>
              <Text style={styles.insightLine}>
                {copy.history.summary.topEnvironment}:{' '}
                {insights.topEnvironment
                  ? ENV_LABELS[insights.topEnvironment]
                  : copy.history.summary.noData}
              </Text>
              <Text style={styles.insightLine}>
                {copy.history.summary.memoryCount}: {memoryHistory.length}건
              </Text>
              {topThemeInsight ? (
                <Text style={styles.insightLine}>
                  {copy.history.summary.topTheme}: {topThemeInsight.themeTitle} (
                  {topThemeInsight.weight})
                </Text>
              ) : (
                <Text style={styles.insightLine}>{copy.history.summary.noTheme}</Text>
              )}
              {isInsightExpanded && insights.recentRecalls.length > 0 ? (
                <View style={styles.recallList}>
                  {insights.recentRecalls.map((recall, index) => (
                    <Pressable
                      key={recall.recommendationId}
                      style={styles.recallCard}
                      onPress={() => router.push(`/result/recipe/${recall.recommendationId}`)}
                    >
                      <Text style={styles.recallTitle}>
                        {copy.history.recallTitlePrefix} {index + 1}
                      </Text>
                      <Text style={styles.insightRecall}>{recall.text}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {isInsightExpanded && latestMemory && insights.recentRecalls.length === 0 ? (
                <Text style={styles.insightRecall}>
                  {copy.history.recallTitlePrefix}: {latestMemory.narrativeRecallCard}
                </Text>
              ) : null}
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
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_SURFACE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    flexShrink: 1,
  },
  modeBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: TEXT_SECONDARY,
    letterSpacing: 0.4,
  },
  cardMeta: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  cardSubMeta: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  memoryMeta: {
    fontSize: TYPE_CAPTION,
    color: TEXT_SECONDARY,
    marginTop: 4,
    fontWeight: '700',
  },
  memoryRecall: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  cardDate: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  insightCard: {
    backgroundColor: CARD_SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
    marginBottom: 12,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightTitle: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_TITLE,
    fontWeight: '700',
  },
  expandButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: BTN_PRIMARY,
  },
  expandButtonText: {
    color: BTN_PRIMARY_TEXT,
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
  },
  insightLine: {
    fontSize: TYPE_CAPTION,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  insightRecall: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  recallList: {
    marginTop: 8,
    gap: 6,
  },
  recallCard: {
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.75)',
    gap: 2,
  },
  recallTitle: {
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },
});
