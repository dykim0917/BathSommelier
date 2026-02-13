import { useCallback, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { MusicTrack, AmbienceTrack } from '@/src/engine/types';
import { AUDIO_ASSETS } from '@/src/data/music';

interface DualAudioState {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setMusicVolume: (v: number) => void;
  setAmbienceVolume: (v: number) => void;
}

/**
 * Dual audio player hook — manages two concurrent audio instances
 * (one for music, one for ambient sounds) using expo-audio.
 *
 * Audio files are loaded from AUDIO_ASSETS using the track's filename.
 * If the asset doesn't exist (placeholder), the player receives null (no-op).
 */
export function useDualAudioPlayer(
  music: MusicTrack | null,
  ambience: AmbienceTrack | null,
): DualAudioState {
  // Resolve audio sources (returns require() asset or null)
  const musicSource = music ? (AUDIO_ASSETS[music.filename] ?? null) : null;
  const ambienceSource = ambience ? (AUDIO_ASSETS[ambience.filename] ?? null) : null;

  // Always call hooks unconditionally (React rules)
  const musicPlayer = useAudioPlayer(musicSource);
  const ambiencePlayer = useAudioPlayer(ambienceSource);

  // Configure players when they change
  useEffect(() => {
    if (musicPlayer) {
      musicPlayer.loop = true;
      musicPlayer.volume = 0.5;
    }
  }, [musicPlayer]);

  useEffect(() => {
    if (ambiencePlayer) {
      ambiencePlayer.loop = true;
      ambiencePlayer.volume = 0.5;
    }
  }, [ambiencePlayer]);

  const play = useCallback(() => {
    musicPlayer.play();
    ambiencePlayer.play();
  }, [musicPlayer, ambiencePlayer]);

  const pause = useCallback(() => {
    musicPlayer.pause();
    ambiencePlayer.pause();
  }, [musicPlayer, ambiencePlayer]);

  const stop = useCallback(() => {
    musicPlayer.pause();
    musicPlayer.seekTo(0);
    ambiencePlayer.pause();
    ambiencePlayer.seekTo(0);
  }, [musicPlayer, ambiencePlayer]);

  const setMusicVolume = useCallback((v: number) => {
    musicPlayer.volume = Math.max(0, Math.min(1, v));
  }, [musicPlayer]);

  const setAmbienceVolume = useCallback((v: number) => {
    ambiencePlayer.volume = Math.max(0, Math.min(1, v));
  }, [musicPlayer, ambiencePlayer]);

  return { play, pause, stop, setMusicVolume, setAmbienceVolume };
}
