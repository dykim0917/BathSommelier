import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  CARD_BORDER_SOFT,
  CARD_GLASS,
  TEXT_MUTED,
  TYPE_CAPTION,
} from '@/src/data/colors';

interface PersistentDisclosureProps {
  style?: ViewStyle;
  showColdWarning?: boolean;
  title?: string;
  lines?: string[];
}

export function PersistentDisclosure({
  style,
  showColdWarning = false,
  title = 'W18 • Legal/Safety Overlay',
  lines,
}: PersistentDisclosureProps) {
  const baseLines = [
    'BathSommelier는 의료 진단 또는 치료 서비스를 제공하지 않습니다.',
    '개인 건강 상태에 따라 전문의 상담을 권장합니다.',
  ];

  const renderedLines = lines ?? [
    ...baseLines,
    ...(showColdWarning
      ? ['냉수 샤워 금기군(조절되지 않는 고혈압/부정맥/뇌혈관 병력)은 반드시 회피하세요.']
      : []),
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
