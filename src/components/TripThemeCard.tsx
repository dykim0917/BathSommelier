import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CARD_BORDER, TEXT_PRIMARY, TYPE_CAPTION } from '@/src/data/colors';

interface TripThemeCardProps {
  intentId: string;
  title: string;
  subtitle: string;
  fitLabel?: string;
  safetyBadge?: string;
  disabled?: boolean;
  disabledText?: string;
  onPress: () => void;
  width: number;
  minHeight?: number;
}

const TRIP_VISUALS: Record<string, { gradient: [string, string]; bloom: string }> = {
  kyoto_forest: { gradient: ['#4D7C68', '#7DAF93'], bloom: 'rgba(205, 238, 214, 0.34)' },
  nordic_sauna: { gradient: ['#8A6A4A', '#C9A26D'], bloom: 'rgba(255, 228, 190, 0.3)' },
  rainy_camping: { gradient: ['#3E5E80', '#6F94B4'], bloom: 'rgba(203, 226, 244, 0.28)' },
  snow_cabin: { gradient: ['#53667C', '#8CA1B7'], bloom: 'rgba(226, 237, 247, 0.3)' },
};

export function TripThemeCard({
  intentId,
  title,
  subtitle,
  fitLabel,
  safetyBadge,
  disabled = false,
  disabledText,
  onPress,
  width,
  minHeight = 148,
}: TripThemeCardProps) {
  const visual = TRIP_VISUALS[intentId] ?? TRIP_VISUALS.kyoto_forest;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, { width, minHeight }]}
    >
      <LinearGradient colors={visual.gradient} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.bloom, { backgroundColor: visual.bloom }]} />
      <View style={[styles.bloomSmall, { backgroundColor: visual.bloom }]} />
      <View style={styles.scrim} />

      <View style={styles.content}>
        {(fitLabel || safetyBadge) ? (
          <View style={styles.badgeRow}>
            {fitLabel ? <Text style={styles.fitBadge}>{fitLabel}</Text> : null}
            {safetyBadge ? <Text style={styles.safetyBadge}>{safetyBadge}</Text> : null}
          </View>
        ) : null}
        <Text style={[styles.title, disabled && styles.titleDisabled]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.subtitle, disabled && styles.subtitleDisabled]} numberOfLines={2}>
          {subtitle}
        </Text>
        {disabled && disabledText ? (
          <Text style={styles.disabledText} numberOfLines={2}>
            {disabledText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    justifyContent: 'flex-end',
  },
  bloom: {
    position: 'absolute',
    top: -26,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  bloomSmall: {
    position: 'absolute',
    bottom: 16,
    left: -16,
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 20, 36, 0.18)',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 5,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  fitBadge: {
    fontSize: TYPE_CAPTION - 1,
    lineHeight: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    color: '#F2F7FF',
    backgroundColor: 'rgba(15, 31, 53, 0.4)',
    fontWeight: '700',
  },
  safetyBadge: {
    fontSize: TYPE_CAPTION - 1,
    lineHeight: 16,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    color: '#3B2000',
    backgroundColor: 'rgba(255, 226, 191, 0.95)',
    fontWeight: '800',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    lineHeight: 20,
  },
  titleDisabled: {
    color: '#E5E7EB',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 18,
  },
  subtitleDisabled: {
    color: '#D1D5DB',
  },
  disabledText: {
    marginTop: 1,
    color: '#FEE2E2',
    fontWeight: '700',
    fontSize: TYPE_CAPTION,
    lineHeight: 16,
  },
});
