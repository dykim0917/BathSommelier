import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { APP_BG_BASE, CARD_BORDER, CARD_SURFACE, TEXT_PRIMARY, ACCENT } from '@/src/data/colors';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const LiquidGlassTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: APP_BG_BASE,
    card: CARD_SURFACE,
    text: TEXT_PRIMARY,
    border: CARD_BORDER,
    primary: ACCENT,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={LiquidGlassTheme}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="result/recipe/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="result/timer/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="result/completion/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
