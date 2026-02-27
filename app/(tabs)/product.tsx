import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { APP_BG_BASE, TEXT_MUTED, TEXT_SECONDARY, TYPE_SCALE } from '@/src/data/colors';

export default function ProductScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🧴</Text>
      <Text style={styles.title}>제품 큐레이션을 준비 중이에요</Text>
      <Text style={styles.subtitle}>루틴에 맞는 제품을 곧 만나볼 수 있어요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG_BASE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  title: {
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
});
