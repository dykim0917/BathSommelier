import AsyncStorage from '@react-native-async-storage/async-storage';
import { BathSession } from '@/src/engine/types';
import { STORAGE_KEYS } from './keys';

export async function saveSession(session: BathSession): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.ACTIVE_SESSION,
    JSON.stringify(session)
  );
}

export async function loadSession(): Promise<BathSession | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
  if (!data) return null;
  return JSON.parse(data) as BathSession;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
}
