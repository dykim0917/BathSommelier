import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { HomeSuggestion, SuggestionExplanation } from '@/src/engine/types';
import {
  BTN_PRIMARY,
  BTN_PRIMARY_TEXT,
  CARD_BORDER,
  CARD_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_SCALE,
} from '@/src/data/colors';

interface SuggestionDetailModalProps {
  visible: boolean;
  suggestion: HomeSuggestion | null;
  explanation: SuggestionExplanation | null;
  onClose: () => void;
  onStart: () => void;
}

export function SuggestionDetailModal({
  visible,
  suggestion,
  explanation,
  onClose,
  onStart,
}: SuggestionDetailModalProps) {
  if (!suggestion || !explanation) return null;
  const isTrip = suggestion.mode === 'trip';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{isTrip ? 'W08 • Trip Suggestion Detail' : 'W07 • Care Suggestion Detail'}</Text>
          <Text style={styles.subTitle}>{suggestion.title}</Text>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {isTrip ? (
              <>
                <Text style={styles.label}>Narrative</Text>
                <Text style={styles.value}>{explanation.narrativeHeadline ?? '오늘의 테마 몰입 루틴입니다.'}</Text>

                <Text style={styles.label}>Atmosphere</Text>
                <View style={styles.chipsRow}>
                  {(explanation.atmosphereChips ?? []).map((chip) => (
                    <View key={chip} style={styles.chip}>
                      <Text style={styles.chipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>State Label</Text>
                <Text style={styles.value}>{explanation.stateLabel}</Text>
              </>
            )}

            <Text style={styles.label}>Why</Text>
            <Text style={styles.value}>{explanation.whySummary}</Text>

            <Text style={styles.label}>Routine Params</Text>
            <Text style={styles.value}>{explanation.routineParams}</Text>

            <Text style={styles.label}>Expected Goal</Text>
            <Text style={styles.value}>{explanation.expectedGoal}</Text>

            <Text style={styles.label}>Alternative</Text>
            <Text style={styles.value}>{explanation.alternativeRoutine}</Text>
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable style={styles.ghostButton} onPress={onClose}>
              <Text style={styles.ghostText}>닫기</Text>
            </Pressable>
            <Pressable style={styles.startButton} onPress={onStart}>
              <Text style={styles.startText}>이 루틴으로 시작</Text>
            </Pressable>
          </View>
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
    maxHeight: '82%',
    backgroundColor: CARD_SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },
  subTitle: {
    marginTop: 4,
    fontSize: TYPE_SCALE.title,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  body: {
    marginTop: 12,
  },
  bodyContent: {
    gap: 6,
    paddingBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  chipText: {
    color: TEXT_SECONDARY,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '600',
  },
  label: {
    marginTop: 8,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },
  value: {
    fontSize: TYPE_SCALE.body,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  buttonRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  ghostButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  ghostText: {
    color: TEXT_PRIMARY,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
  startButton: {
    flex: 1.5,
    borderRadius: 12,
    backgroundColor: BTN_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  startText: {
    color: BTN_PRIMARY_TEXT,
    fontSize: TYPE_SCALE.body,
    fontWeight: '700',
  },
});
