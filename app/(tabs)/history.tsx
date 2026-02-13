import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { BathRecommendation } from '@/src/engine/types';
import { loadHistory } from '@/src/storage/history';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { formatDuration } from '@/src/utils/time';
import {
  APP_BG_BOTTOM,
  APP_BG_TOP,
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
  care: 'CARE',
  trip: 'TRIP',
} as const;

const ENV_LABELS = {
  bathtub: '욕조',
  footbath: '족욕',
  shower: '샤워',
} as const;

export default function HistoryScreen() {
  const [history, setHistory] = useState<BathRecommendation[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistory);
    }, [])
  );

  const renderItem = ({ item }: { item: BathRecommendation }) => {
    const persona = PERSONA_DEFINITIONS.find((p) => p.code === item.persona);
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
              {item.themeTitle ?? persona?.nameKo ?? '맞춤 케어'}
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
          <Text style={styles.cardSubMeta}>환경: {ENV_LABELS[item.environmentUsed]}</Text>
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
          <Text style={styles.emptyText}>아직 기록이 없어요</Text>
          <Text style={styles.emptySubtext}>첫 번째 목욕 레시피를 받아보세요</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
});
