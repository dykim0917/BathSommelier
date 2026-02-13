import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { loadProfile } from '@/src/storage/profile';
import { DARK_BG } from '@/src/data/colors';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadProfile().then((p) => {
      setHasProfile(!!p?.onboardingComplete);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={styles.container} pointerEvents="none">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (hasProfile) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
