import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ui } from '@/src/theme/ui';
import {
  PILL_BG,
  PILL_BORDER,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
} from '@/src/data/colors';
import { ProductItem } from '@/src/data/products';

interface ProductCardProps {
  item: ProductItem;
}

export function ProductCard({ item }: ProductCardProps) {
  return (
    <View style={[ui.glassCard, styles.card]}>
      <View style={styles.header}>
        <View style={[styles.emojiWrap, { backgroundColor: item.bgColor }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={styles.nameWrap}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.tagRow}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tagPill}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  nameWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  brand: {
    fontSize: TYPE_SCALE.caption,
    color: TEXT_MUTED,
  },
  description: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: PILL_BG,
    borderWidth: 1,
    borderColor: PILL_BORDER,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: TYPE_SCALE.caption,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
});
