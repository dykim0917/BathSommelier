import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  CARD_BORDER_SOFT,
  CARD_GLASS,
  TEXT_MUTED,
  TYPE_CAPTION,
} from '@/src/data/colors';
import { copy } from '@/src/content/copy';

interface PersistentDisclosureProps {
  style?: ViewStyle;
  showColdWarning?: boolean;
  title?: string;
  lines?: string[];
}

export function PersistentDisclosure({
  style,
  showColdWarning = false,
  title = copy.disclosure.title,
  lines,
}: PersistentDisclosureProps) {
  const baseLines = [...copy.disclosure.baseLines];

  const renderedLines = lines ?? [
    ...baseLines,
    ...(showColdWarning ? [copy.disclosure.coldWarning] : []),
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {renderedLines.map((line) => (
        <Text key={line} style={styles.line}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    borderRadius: 12,
    backgroundColor: CARD_GLASS,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  title: {
    fontSize: TYPE_CAPTION,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  line: {
    fontSize: TYPE_CAPTION,
    color: TEXT_MUTED,
    lineHeight: 16,
  },
});
