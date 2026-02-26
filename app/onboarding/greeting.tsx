import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useHaptic } from '@/src/hooks/useHaptic';
import {
  ACCENT,
  BTN_PRIMARY_TEXT,
  TEXT_PRIMARY,
  TYPE_CAPTION,
  TYPE_HEADING_LG,
  TYPE_BODY,
} from '@/src/data/colors';

const { width: W, height: H } = Dimensions.get('window');

// Figma assets for decorative elements
const ASSETS = {
  ellipse1: 'http://localhost:3845/assets/911b3883c7d2459d6753e872b8cbd90fb9245c10.svg',
  ellipse2: 'http://localhost:3845/assets/30ca20615ef625e3438227bbc2fbd7ad03dd7523.svg',
  ellipse3: 'http://localhost:3845/assets/3f2dbb606942eb9f92f7467e6a910fa49a2691da.svg',
  ellipseGlow: 'http://localhost:3845/assets/bab7b6822d335b546ffeb27ec59f673d40ec7c53.svg',
  cloudRight: 'http://localhost:3845/assets/70ed05544a496c4ed04213318fa75a9806bcdc99.svg',
  cloudLeft: 'http://localhost:3845/assets/5521e1103be6bc4df3c513ee0e886ad5f08996f9.svg',
  cloudBigRight: 'http://localhost:3845/assets/1e5d07b41cc8fa1396846414e8f8e4b15f3a1f62.svg',
  cloudSmallLeft: 'http://localhost:3845/assets/2d07f639dbfad26300ceb6818e1027d299184bc5.svg',
};

export default function OnboardingGreeting() {
  const haptic = useHaptic();

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(30);

  useEffect(() => {
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
    titleTranslateY.value = withDelay(300, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    ctaTranslateY.value = withDelay(900, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  const handleStart = () => {
    haptic.success();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[ACCENT, '#6A85BF']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative circles */}
      <Image
        source={{ uri: ASSETS.ellipse1 }}
        style={styles.ellipseLarge}
        resizeMode="contain"
      />
      <Image
        source={{ uri: ASSETS.ellipse2 }}
        style={styles.ellipseMedium}
        resizeMode="contain"
      />
      <Image
        source={{ uri: ASSETS.ellipse3 }}
        style={styles.ellipseSmall}
        resizeMode="contain"
      />
      <Image
        source={{ uri: ASSETS.ellipseGlow }}
        style={styles.ellipseGlow}
        resizeMode="contain"
      />

      {/* Cloud decorations */}
      <Image
        source={{ uri: ASSETS.cloudRight }}
        style={styles.cloudRight}
        resizeMode="contain"
      />
      <Image
        source={{ uri: ASSETS.cloudLeft }}
        style={styles.cloudLeft}
        resizeMode="contain"
      />
      <Image
        source={{ uri: ASSETS.cloudBigRight }}
        style={styles.cloudBigRight}
        resizeMode="contain"
      />
      <Image
        source={{ uri: ASSETS.cloudSmallLeft }}
        style={styles.cloudSmallLeft}
        resizeMode="contain"
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topSpacer} />

        <Animated.View style={[styles.textContainer, titleStyle]}>
          <Text style={styles.greeting}>환영합니다!</Text>
          <Text style={styles.title}>
            {'당신만의 목욕 루틴을\n시작해볼까요?'}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
          <Text style={styles.subtitle}>
            {'맞춤 레시피와 함께\n편안한 입욕 시간을 만들어 드릴게요'}
          </Text>
        </Animated.View>

        <View style={styles.middleSpacer} />

        {/* Bath emoji as a simple centered visual */}
        <View style={styles.emojiContainer}>
          <Text style={styles.heroEmoji}>🛁</Text>
        </View>

        <View style={styles.bottomSpacer} />

        <Animated.View style={ctaStyle}>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={handleStart}
          >
            <Text style={styles.ctaText}>시작하기</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Decorative ellipses (concentric circles from Figma)
  ellipseLarge: {
    position: 'absolute',
    left: -39,
    top: H * 0.41,
    width: 492,
    height: 492,
    opacity: 0.3,
  },
  ellipseMedium: {
    position: 'absolute',
    left: -4,
    top: H * 0.45,
    width: 422,
    height: 422,
    opacity: 0.25,
  },
  ellipseSmall: {
    position: 'absolute',
    left: 30,
    top: H * 0.49,
    width: 354,
    height: 354,
    opacity: 0.2,
  },
  ellipseGlow: {
    position: 'absolute',
    left: 65,
    top: H * 0.53,
    width: 284,
    height: 284,
    opacity: 0.15,
  },

  // Clouds
  cloudRight: {
    position: 'absolute',
    right: -20,
    top: H * 0.46,
    width: 36,
    height: 14,
    opacity: 0.6,
  },
  cloudLeft: {
    position: 'absolute',
    left: -10,
    top: H * 0.48,
    width: 22,
    height: 8,
    opacity: 0.5,
  },
  cloudBigRight: {
    position: 'absolute',
    right: -15,
    top: H * 0.49,
    width: 114,
    height: 55,
    opacity: 0.4,
  },
  cloudSmallLeft: {
    position: 'absolute',
    left: -9,
    top: H * 0.42,
    width: 50,
    height: 24,
    opacity: 0.4,
  },

  // Content layout
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSpacer: {
    height: H * 0.14,
  },
  textContainer: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: TYPE_HEADING_LG,
    fontWeight: '800',
    color: '#FFECCC',
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: TYPE_BODY,
    color: 'rgba(235, 234, 236, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  middleSpacer: {
    flex: 1,
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 80,
  },
  bottomSpacer: {
    flex: 1,
  },
  ctaButton: {
    backgroundColor: 'rgba(235, 234, 236, 0.95)',
    borderRadius: 38,
    height: 63,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: 0.7,
  },
});
