import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { OVERLAY, GLASS_BORDER, GLASS_SHADOW, TEXT_PRIMARY, WARNING_COLOR } from '@/src/data/colors';

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>안전 알림</Text>
          <ScrollView style={styles.warningsList}>
            {warnings.map((w, i) => (
              <Text key={i} style={styles.warningText}>
                {w}
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
    backgroundColor: OVERLAY,
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
    marginBottom: 10,
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
