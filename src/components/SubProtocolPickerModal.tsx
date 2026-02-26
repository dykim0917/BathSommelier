import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SubProtocolOption } from '@/src/engine/types';
import {
  ACCENT,
  ACCENT_LIGHT,
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  CARD_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
} from '@/src/data/colors';

interface SubProtocolPickerModalProps {
  visible: boolean;
  title: string;
  domain?: 'care' | 'trip';
  options: SubProtocolOption[];
  onClose: () => void;
  onSelect: (option: SubProtocolOption) => void;
}

export function SubProtocolPickerModal({
  visible,
  title,
  domain,
  options,
  onClose,
  onSelect,
}: SubProtocolPickerModalProps) {
  const heading = domain === 'trip'
    ? '어떤 방식으로 즐겨볼까요?'
    : '혹시 이런 느낌도 있나요?';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{heading}</Text>
          <Text style={styles.subTitle}>{title}</Text>

          <View style={styles.optionsWrap}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.optionButton, option.is_default && styles.optionButtonDefault]}
                onPress={() => onSelect(option)}
              >
                <View style={styles.optionLabelRow}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {option.is_default && <Text style={styles.defaultBadge}>추천</Text>}
                </View>
                <Text style={styles.optionHint}>{option.hint}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17,29,48,0.3)',
  },
  card: {
    backgroundColor: CARD_SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  subTitle: {
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 24,
  },
  optionsWrap: {
    gap: 12,
    marginTop: 2,
  },
  optionButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 72,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    gap: 6,
  },
  optionButtonDefault: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_LIGHT,
  },
  optionLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 10,
    minHeight: 24,
  },
  optionLabel: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
    flex: 1,
    lineHeight: 21,
  },
  defaultBadge: {
    fontSize: TYPE_SCALE.caption - 1,
    fontWeight: '700' as const,
    color: ACCENT,
    backgroundColor: 'rgba(120,149,207,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  optionHint: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 19,
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: BTN_PRIMARY,
    minHeight: 44,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: BTN_PRIMARY_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
});
