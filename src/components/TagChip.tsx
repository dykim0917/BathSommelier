import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ACCENT,
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
          backgroundColor: PILL_ACTIVE_BG,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_SURFACE,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  labelSelected: {
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
});
