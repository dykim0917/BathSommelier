import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  SURFACE,
  GLASS_BORDER,
  GLASS_SHADOW,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ACCENT,
  ACCENT_LIGHT,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: SURFACE,
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  emoji: {
    fontSize: 16,
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
