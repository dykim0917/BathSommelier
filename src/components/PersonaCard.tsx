import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BathRecommendation } from '@/src/engine/types';
import { PERSONA_DEFINITIONS } from '@/src/engine/personas';
import { formatTemperature, formatTemperatureRange } from '@/src/utils/temperature';
import { formatDuration } from '@/src/utils/time';
import { TEXT_PRIMARY, TEXT_SECONDARY, SURFACE, GLASS_BORDER, GLASS_SHADOW } from '@/src/data/colors';

interface PersonaCardProps {
  recommendation: BathRecommendation;
}

const BATH_TYPE_LABELS: Record<string, string> = {
  full: '전신욕',
  half: '반신욕',
  foot: '족욕',
  shower: '샤워',
};

export function PersonaCard({ recommendation }: PersonaCardProps) {
  const persona = PERSONA_DEFINITIONS.find(
    (p) => p.code === recommendation.persona
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.personaName, { color: recommendation.colorHex }]}>
        {persona?.nameKo ?? '맞춤 케어'}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {formatTemperature(recommendation.temperature)}
          </Text>
          <Text style={styles.statLabel}>수온</Text>
          <Text style={styles.statSub}>
            ({formatTemperatureRange(recommendation.temperature)})
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: recommendation.colorHex + '40' }]} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {formatDuration(recommendation.durationMinutes)}
          </Text>
          <Text style={styles.statLabel}>시간</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: recommendation.colorHex + '40' }]} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {BATH_TYPE_LABELS[recommendation.bathType]}
          </Text>
          <Text style={styles.statLabel}>입욕 방법</Text>
        </View>
      </View>

      <View style={styles.lightingRow}>
        <Text style={styles.lightingLabel}>조명</Text>
        <Text style={styles.lightingValue}>{recommendation.lighting}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  personaName: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  statSub: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
  },
  lightingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  lightingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginRight: 8,
  },
  lightingValue: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    flex: 1,
  },
});
