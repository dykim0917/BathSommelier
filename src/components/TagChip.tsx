import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ACCENT,
  ACCENT_LIGHT,
  PILL_ACTIVE_BG,
} from '@/src/data/colors';

interface TagChipProps {
  label: string;
  emoji: string;
  selected: boolean;
  accentColor?: string;
  onPress: () => void;
}

export function TagChip({
  label,
  emoji,
  selected,
  accentColor = ACCENT,
  onPress,
}: TagChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.chip,
        selected && {
          backgroundColor: ACCENT_LIGHT,
          borderColor: accentColor,
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#F2F3F7',
    marginRight: 8,
    marginBottom: 10,
    gap: 8,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  labelSelected: {
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
});
