import { MusicTrack, AmbienceTrack, PersonaCode } from '@/src/engine/types';

// Audio assets - require() calls must be static for Metro bundler
// Placeholder: actual audio files will be added to assets/audio/
export const AUDIO_ASSETS: Record<string, any> = {
  // Music tracks
  // piano: require('@/assets/audio/piano.mp3'),
  // cello: require('@/assets/audio/cello.mp3'),
  // ambient_synth: require('@/assets/audio/ambient_synth.mp3'),
  // acoustic_guitar: require('@/assets/audio/acoustic_guitar.mp3'),
  // Ambience tracks
  // rain: require('@/assets/audio/rain.mp3'),
  // ocean: require('@/assets/audio/ocean.mp3'),
  // forest: require('@/assets/audio/forest.mp3'),
  // hotspring: require('@/assets/audio/hotspring.mp3'),
  // fireplace: require('@/assets/audio/fireplace.mp3'),
};

// --- Music (instrumental, persona-matched) ---
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'piano',
    title: '피아노',
    filename: 'piano',
    durationSeconds: 260,
    persona: ['P3_MUSCLE', 'P4_SLEEP'],
  },
  {
    id: 'cello',
    title: '첼로',
    filename: 'cello',
    durationSeconds: 300,
    persona: ['P2_CIRCULATION'],
  },
  {
    id: 'ambient_synth',
    title: '앰비언트',
    filename: 'ambient_synth',
    durationSeconds: 240,
    persona: ['P1_SAFETY'],
  },
  {
    id: 'acoustic_guitar',
    title: '어쿠스틱 기타',
    filename: 'acoustic_guitar',
    durationSeconds: 280,
    persona: ['P4_SLEEP'],
  },
];

// --- Ambience (nature sounds / ASMR) ---
export const AMBIENCE_TRACKS: AmbienceTrack[] = [
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
    id: 'hotspring',
    title: '온천수 소리',
    filename: 'hotspring',
    durationSeconds: 260,
    persona: ['P3_MUSCLE'],
  },
  {
    id: 'fireplace',
    title: '벽난로',
    filename: 'fireplace',
    durationSeconds: 300,
    persona: ['P4_SLEEP', 'P1_SAFETY'],
  },
];
