import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Linking,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ingredient } from '@/src/engine/types';
import {
  SURFACE,
  GLASS_BORDER,
  GLASS_SHADOW,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/src/data/colors';

interface IngredientCarouselProps {
  ingredients: Ingredient[];
  accentColor: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 60; // 30px margin each side
const CARD_SPACING = 12;

export function IngredientCarousel({
  ingredients,
  accentColor,
}: IngredientCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: Ingredient }) => (
    <View style={[styles.card, { width: CARD_WIDTH }]}>
      {/* Icon area */}
      <View style={[styles.iconArea, { backgroundColor: accentColor + '15' }]}>
        <Text style={styles.iconEmoji}>🧴</Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.nameKo}>{item.nameKo}</Text>
        <Text style={styles.nameEn}>{item.nameEn}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      {/* Purchase button */}
      {item.purchaseUrl && (
        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: accentColor }]}
          onPress={() => Linking.openURL(item.purchaseUrl!)}
          activeOpacity={0.7}
        >
          <Text style={styles.purchaseText}>구매하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>준비물</Text>
      <Text style={styles.subtitle}>
        {ingredients.length}가지 재료를 준비해주세요
      </Text>

      <FlatList
        data={ingredients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
      />

      {/* Dot indicator */}
      {ingredients.length > 1 && (
        <View style={styles.dots}>
          {ingredients.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? accentColor : accentColor + '30',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
    paddingHorizontal: 30,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 16,
    paddingHorizontal: 30,
  },
  listContent: {
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  iconArea: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  nameKo: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  nameEn: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  purchaseButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  purchaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
