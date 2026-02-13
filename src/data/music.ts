import { MusicTrack, PersonaCode } from '@/src/engine/types';

// Audio assets - require() calls must be static for Metro bundler
// Placeholder: actual audio files will be added to assets/audio/
export const AUDIO_ASSETS: Record<string, any> = {
  // These will be populated once audio files are added
  // rain: require('@/assets/audio/rain.mp3'),
  // ocean: require('@/assets/audio/ocean.mp3'),
  // forest: require('@/assets/audio/forest.mp3'),
  // piano: require('@/assets/audio/piano.mp3'),
};

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'rain',
    title: '빗소리',
    filename: 'rain',
    durationSeconds: 240,
    persona: ['P4_SLEEP'],
  },
  {
    id: 'ocean',
    title: '파도 소리',
    filename: 'ocean',
    durationSeconds: 300,
    persona: ['P2_CIRCULATION'],
  },
  {
    id: 'forest',
    title: '숲 소리',
    filename: 'forest',
    durationSeconds: 280,
    persona: ['P1_SAFETY'],
  },
  {
    id: 'piano',
    title: '피아노',
    filename: 'piano',
    durationSeconds: 260,
    persona: ['P3_MUSCLE', 'P4_SLEEP'],
  },
];
