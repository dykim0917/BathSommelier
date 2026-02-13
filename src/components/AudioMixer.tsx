import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { MusicTrack, AmbienceTrack } from '@/src/engine/types';
import {
  SURFACE,
  GLASS_BORDER,
  GLASS_SHADOW,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/src/data/colors';

interface AudioMixerProps {
  music: MusicTrack;
  ambience: AmbienceTrack;
  accentColor: string;
  onMusicVolumeChange: (v: number) => void;
  onAmbienceVolumeChange: (v: number) => void;
}

export function AudioMixer({
  music,
  ambience,
  accentColor,
  onMusicVolumeChange,
  onAmbienceVolumeChange,
}: AudioMixerProps) {
  const [musicVol, setMusicVol] = useState(0.5);
  const [ambienceVol, setAmbienceVol] = useState(0.5);

  const handleMusicChange = (v: number) => {
    setMusicVol(v);
    onMusicVolumeChange(v);
  };

  const handleAmbienceChange = (v: number) => {
    setAmbienceVol(v);
    onAmbienceVolumeChange(v);
  };

  return (
    <View style={styles.container}>
      {/* Music row */}
      <View style={styles.row}>
        <Text style={styles.emoji}>🎵</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>{music.title}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={musicVol}
            onValueChange={handleMusicChange}
            minimumTrackTintColor={accentColor}
            maximumTrackTintColor={accentColor + '30'}
            thumbTintColor={accentColor}
          />
        </View>
      </View>

      {/* Ambience row */}
      <View style={styles.row}>
        <Text style={styles.emoji}>🌲</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>{ambience.title}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={ambienceVol}
            onValueChange={handleAmbienceChange}
            minimumTrackTintColor={accentColor}
            maximumTrackTintColor={accentColor + '30'}
            thumbTintColor={accentColor}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 20,
    marginRight: 10,
  },
  sliderContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },
  slider: {
    width: '100%',
    height: 30,
  },
});
