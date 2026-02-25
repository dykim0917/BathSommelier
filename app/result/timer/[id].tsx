import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { saveSession, updateSessionCompletion } from '@/src/storage/session';
import { WaterAnimation } from '@/src/components/WaterAnimation';
import { SteamAnimation } from '@/src/components/SteamAnimation';
import { AudioMixer } from '@/src/components/AudioMixer';
import { PersistentDisclosure } from '@/src/components/PersistentDisclosure';
import { buildDisclosureLines } from '@/src/engine/disclosures';
import { useDualAudioPlayer } from '@/src/hooks/useDualAudioPlayer';
import {
  APP_BG_BOTTOM,
  APP_BG_TOP,
  BG,
  CARD_BORDER_SOFT,
  CARD_GLASS,
  CARD_SHADOW_SOFT,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '@/src/data/colors';

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
  const isCompletingRef = useRef(false);

  const audio = useDualAudioPlayer(
    recommendation?.music ?? null,
    recommendation?.ambience ?? null,
  );
  const {
    play: playAudio,
    pause: pauseAudio,
    stop: stopAudio,
    setMusicVolume,
    setAmbienceVolume,
  } = audio;

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

  useEffect(() => {
    if (!id) return;
    startedAtRef.current = new Date().toISOString();
    saveSession({
      recommendationId: id,
      startedAt: startedAtRef.current,
    });
  }, [id]);

  const handleComplete = useCallback(async () => {
    if (!id || isCompletingRef.current) return;
    isCompletingRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopAudio();

    const completedAt = new Date().toISOString();
    const actualDurationSeconds = Math.max(0, totalSeconds - remainingSeconds);
    await updateSessionCompletion(id, completedAt, actualDurationSeconds);
    router.replace(`/result/completion/${id}`);
  }, [id, remainingSeconds, stopAudio, totalSeconds]);

  useEffect(() => {
    if (!recommendation || totalSeconds === 0) return;

    playAudio();

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudio();
    };
  }, [recommendation, totalSeconds, handleComplete, playAudio, stopAudio]);

  useEffect(() => {
    if (!recommendation) return;

    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      pauseAudio();
      return;
    }

    if (!timerRef.current && remainingSeconds > 0) {
      playAudio();
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isPaused, recommendation, remainingSeconds, handleComplete, pauseAudio, playAudio]);

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

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const waterProgress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
  const isShowerImmersive = recommendation.environmentUsed === 'shower' || recommendation.bathType === 'shower';
  const timerDisclosureLines = buildDisclosureLines({
    fallbackStrategy: 'none',
    selectedMode:
      recommendation.mode === 'trip'
        ? 'recovery'
        : recommendation.persona === 'P4_SLEEP'
          ? 'sleep'
          : 'recovery',
    healthConditions: [],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[APP_BG_TOP + '88', APP_BG_BOTTOM + '88']}
        style={StyleSheet.absoluteFillObject}
      />
      {isShowerImmersive ? (
        <SteamAnimation colorHex={recommendation.colorHex} />
      ) : (
        <WaterAnimation
          progress={waterProgress}
          colorHex={recommendation.colorHex}
        />
      )}

      <Pressable style={StyleSheet.absoluteFill} onPress={toggleControls}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.timerContainer}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP 2 • 실행</Text>
            </View>
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

          <Animated.View style={[styles.controlsContainer, controlsStyle]}>
            {showControls && (
              <>
                <View style={styles.mixerContainer}>
                  <AudioMixer
                    music={recommendation.music}
                    ambience={recommendation.ambience}
                    accentColor={recommendation.colorHex}
                    onMusicVolumeChange={setMusicVolume}
                    onAmbienceVolumeChange={setAmbienceVolume}
                  />
                </View>

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

                  <View style={styles.endButtonPlaceholder} />
                </View>
              </>
            )}
          </Animated.View>

          <TouchableOpacity
            style={[styles.floatingFinishButton, { backgroundColor: recommendation.colorHex }]}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.finishButtonText}>끝내기</Text>
          </TouchableOpacity>

          <View style={styles.disclosureWrap}>
            <PersistentDisclosure lines={timerDisclosureLines} />
          </View>
        </SafeAreaView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    overflow: 'hidden',
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
  stepBadge: {
    marginBottom: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  stepBadgeText: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: '700',
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
    paddingBottom: 18,
  },
  mixerContainer: {
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  endButtonPlaceholder: {
    flex: 1,
  },
  controlButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  pauseButton: {
    backgroundColor: CARD_GLASS,
  },
  controlButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  finishButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  floatingFinishButton: {
    position: 'absolute',
    right: 20,
    top: 56,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER_SOFT,
    shadowColor: CARD_SHADOW_SOFT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  disclosureWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 8,
  },
});
