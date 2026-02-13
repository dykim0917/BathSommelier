import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { BathRecommendation } from '@/src/engine/types';
import { loadHistory } from '@/src/storage/history';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { formatDuration } from '@/src/utils/time';
import {
  BG,
  SURFACE,
  GLASS_BORDER,
  GLASS_SHADOW,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/src/data/colors';

const BATH_TYPE_LABELS: Record<string, string> = {
  full: '전신욕',
  half: '반신욕',
  foot: '족욕',
  shower: '샤워',
};

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
          <Text style={styles.cardTitle}>{persona?.nameKo ?? '맞춤 케어'}</Text>
          <Text style={styles.cardMeta}>
            {item.temperature.recommended}°C · {BATH_TYPE_LABELS[item.bathType]} ·{' '}
            {formatDuration(item.durationMinutes)}
          </Text>
        </View>
        <Text style={styles.cardDate}>{dateStr}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>아직 기록이 없어요</Text>
          <Text style={styles.emptySubtext}>
            첫 번째 목욕 레시피를 받아보세요
          </Text>
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
    backgroundColor: BG,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  cardDate: {
    fontSize: 12,
    color: TEXT_SECONDARY,
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
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
});
