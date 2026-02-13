import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BathRecommendation } from '@/src/engine/types';
import { getRecommendationById } from '@/src/storage/history';
import { saveSession } from '@/src/storage/session';
import { WaterAnimation } from '@/src/components/WaterAnimation';
import { AudioMixer } from '@/src/components/AudioMixer';
import { useDualAudioPlayer } from '@/src/hooks/useDualAudioPlayer';
import { BG, TEXT_PRIMARY, TEXT_SECONDARY, SURFACE, GLASS_BORDER, GLASS_SHADOW } from '@/src/data/colors';

export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recommendation, setRecommendation] =
    useState<BathRecommendation | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<string>(new Date().toISOString());

  // Dual audio player
  const audio = useDualAudioPlayer(
    recommendation?.music ?? null,
    recommendation?.ambience ?? null,
  );

  // Controls fade animation
  const controlsOpacity = useSharedValue(1);
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  useEffect(() => {
    if (!id) return;
    getRecommendationById(id).then((rec) => {
      if (rec) {
        setRecommendation(rec);
        const secs = (rec.durationMinutes ?? 15) * 60;
        setRemainingSeconds(secs);
        setTotalSeconds(secs);
      }
    });
  }, [id]);

  // Save session on mount
  useEffect(() => {
    if (!id) return;
    startedAtRef.current = new Date().toISOString();
    saveSession({
      recommendationId: id,
      startedAt: startedAtRef.current,
    });
  }, [id]);

  // Start timer & audio when recommendation loads
  useEffect(() => {
    if (!recommendation || totalSeconds === 0) return;

    audio.play();

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          // Timer complete
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      audio.stop();
    };
  }, [recommendation, totalSeconds]);

  // Handle pause/resume
  useEffect(() => {
    if (!recommendation) return;
    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      audio.pause();
    } else {
      if (!timerRef.current && remainingSeconds > 0) {
        audio.play();
        timerRef.current = setInterval(() => {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              handleComplete();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  }, [isPaused]);

  const handleComplete = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    audio.stop();
    router.replace(`/result/completion/${id}`);
  }, [id, audio]);

  const toggleControls = () => {
    const newVal = !showControls;
    setShowControls(newVal);
    controlsOpacity.value = withTiming(newVal ? 1 : 0, { duration: 300 });
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!recommendation) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: TEXT_SECONDARY }}>로딩 중...</Text>
      </View>
    );
  }

  // Format time
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Water progress (1 = full, drains to 0)
  const waterProgress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;

  return (
    <View style={styles.container}>
      {/* Water animation background */}
      <WaterAnimation
        progress={waterProgress}
        colorHex={recommendation.colorHex}
      />

      {/* Tap area to toggle controls */}
      <Pressable style={StyleSheet.absoluteFill} onPress={toggleControls}>
        <SafeAreaView style={styles.safeArea}>
          {/* Timer display — always visible */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeStr}</Text>
            {isPaused && (
              <Animated.Text
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(200)}
                style={styles.pausedLabel}
              >
                일시정지
              </Animated.Text>
            )}
          </View>

          {/* Controls overlay */}
          <Animated.View style={[styles.controlsContainer, controlsStyle]}>
            {showControls && (
              <>
                {/* Audio Mixer */}
                <View style={styles.mixerContainer}>
                  <AudioMixer
                    music={recommendation.music}
                    ambience={recommendation.ambience}
                    accentColor={recommendation.colorHex}
                    onMusicVolumeChange={audio.setMusicVolume}
                    onAmbienceVolumeChange={audio.setAmbienceVolume}
                  />
                </View>

                {/* Buttons */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[styles.controlButton, styles.pauseButton]}
                    onPress={togglePause}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.controlButtonText}>
                      {isPaused ? '▶️ 재개' : '⏸ 일시정지'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: recommendation.colorHex }]}
                    onPress={handleComplete}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.controlButtonText}>✓ 입욕 완료</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </SafeAreaView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: '200',
    color: TEXT_PRIMARY,
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  pausedLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 8,
    letterSpacing: 2,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mixerContainer: {
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  pauseButton: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  controlButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
});
