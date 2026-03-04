import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { ProductCard } from '@/src/components/ProductCard';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  PRODUCTS,
  ProductCategory,
} from '@/src/data/products';
import {
  ACCENT,
  ACCENT_LIGHT,
  APP_BG_BASE,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
} from '@/src/data/colors';

const SCREEN_HORIZONTAL_PADDING = 22;

export default function ProductScreen() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');

  const filtered =
    activeCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>오늘의 제품</Text>
          <Text style={styles.subtitle}>루틴에 어울리는 제품을 골라봐요.</Text>
        </View>

        <View style={styles.categoryRow}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryPill,
                activeCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive,
                ]}
                numberOfLines={1}
              >
                {PRODUCT_CATEGORY_LABELS[cat]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View>
          {filtered.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG_BASE,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: TYPE_SCALE.headingMd,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    lineHeight: 32,
  },
  subtitle: {
    marginTop: 6,
    fontSize: TYPE_SCALE.body,
    color: TEXT_MUTED,
    lineHeight: 21,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
  },
  categoryPill: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: ACCENT_LIGHT,
  },
  categoryPillActive: {
    backgroundColor: ACCENT,
  },
  categoryText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: TEXT_PRIMARY,
  },
});
