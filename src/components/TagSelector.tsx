import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TagChip } from './TagChip';
import { TagDefinition } from '@/src/data/tags';
import { useHaptic } from '@/src/hooks/useHaptic';
import { TEXT_PRIMARY, TEXT_SECONDARY } from '@/src/data/colors';

interface TagSelectorProps {
  title: string;
  tags: TagDefinition[];
  selectedIds: Set<string>;
  onToggle: (tagId: string) => void;
  accentColor?: string;
}

export function TagSelector({
  title,
  tags,
  selectedIds,
  onToggle,
  accentColor,
}: TagSelectorProps) {
  const haptic = useHaptic();

  const handleToggle = (tagId: string) => {
    haptic.light();
    onToggle(tagId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            label={tag.labelKo}
            emoji={tag.emoji}
            selected={selectedIds.has(tag.id)}
            accentColor={accentColor}
            onPress={() => handleToggle(tag.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
