import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BG } from '@/src/data/colors';

interface GradientBackgroundProps {
  colorHex: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GradientBackground({
  colorHex,
  children,
  style,
}: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[BG, colorHex + '18', colorHex + '30', BG]}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
