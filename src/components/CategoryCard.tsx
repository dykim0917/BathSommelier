import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TEXT_PRIMARY, TYPE_BODY, TYPE_CAPTION, WARNING_COLOR } from '@/src/data/colors';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  emoji: string;
  bgColor: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
  width: number;
  minHeight?: number;
}

export function CategoryCard({
  title,
  subtitle,
  emoji,
  bgColor,
  disabled = false,
  disabledText,
  onPress,
  width,
  minHeight = 140,
}: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.card,
        { width, minHeight, backgroundColor: disabled ? '#E8E8E8' : bgColor },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, disabled && styles.titleDisabled]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.subtitle, disabled && styles.subtitleDisabled]} numberOfLines={2}>
        {subtitle}
      </Text>
      {disabled && disabledText ? (
        <Text style={styles.warning} numberOfLines={2}>
          {disabledText}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 6,
    justifyContent: 'flex-end',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  title: {
    fontSize: TYPE_BODY,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 21,
  },
  titleDisabled: {
    color: '#9A9A9A',
  },
  subtitle: {
    fontSize: TYPE_CAPTION,
    color: 'rgba(42, 62, 100, 0.65)',
    lineHeight: 18,
  },
  subtitleDisabled: {
    color: '#ABABAB',
  },
  warning: {
    marginTop: 2,
    fontSize: TYPE_CAPTION - 1,
    color: WARNING_COLOR,
    fontWeight: '600',
    lineHeight: 16,
  },
});
