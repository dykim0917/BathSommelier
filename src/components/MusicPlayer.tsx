import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MusicTrack } from '@/src/engine/types';
import { SURFACE, GLASS_BORDER, GLASS_SHADOW, TEXT_PRIMARY, TEXT_SECONDARY } from '@/src/data/colors';

interface MusicPlayerProps {
  track: MusicTrack;
  accentColor: string;
}

/**
 * Simplified music player placeholder.
 * Audio playback will be integrated once audio files are bundled.
 * For now, shows the track info and play/pause controls.
 */
export function MusicPlayer({ track, accentColor }: MusicPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const handleToggle = () => {
    setPlaying(!playing);
    // TODO: integrate expo-audio when audio files are added
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>음악</Text>
      <View style={styles.player}>
        <Pressable
          style={[styles.playButton, { backgroundColor: accentColor }]}
          onPress={handleToggle}
        >
          <Text style={styles.playIcon}>{playing ? '⏸' : '▶️'}</Text>
        </Pressable>
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackMeta}>
            {playing ? '재생 중...' : '탭하여 재생'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: GLASS_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  playIcon: {
    fontSize: 20,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  trackMeta: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
});
