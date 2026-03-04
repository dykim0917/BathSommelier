import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GLASS_SHADOW,
  MODAL_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WARNING_COLOR,
} from '@/src/data/colors';
import { buildSafetyChecklist } from '@/src/engine/safetyChecklist';
import { copy } from '@/src/content/copy';

interface SafetyWarningProps {
  visible: boolean;
  warnings: string[];
  onDismiss: () => void;
}

export function SafetyWarning({
  visible,
  warnings,
  onDismiss,
}: SafetyWarningProps) {
  if (warnings.length === 0) return null;
  const checklist = buildSafetyChecklist(warnings);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{copy.routine.checklist.title}</Text>
          <ScrollView style={styles.warningsList}>
            <Text style={styles.sectionTitle}>주의사항</Text>
            {warnings.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.warningText}>
                {'\u2022'} {item}
              </Text>
            ))}
            <Text style={styles.sectionTitle}>실천 체크리스트</Text>
            {checklist.map((item) => (
              <Text key={item} style={styles.warningText}>
                {'\u2022'} {item}
              </Text>
            ))}
          </ScrollView>
          <Pressable style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: MODAL_SURFACE,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: WARNING_COLOR,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: WARNING_COLOR,
    textAlign: 'center',
    marginBottom: 16,
  },
  warningsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    lineHeight: 22,
    marginBottom: 11,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    marginBottom: 8,
    marginTop: 4,
  },
  button: {
    backgroundColor: WARNING_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
