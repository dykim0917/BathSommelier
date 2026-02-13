import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/src/engine/types';
import { STORAGE_KEYS } from './keys';

export async function saveProfile(profile: UserProfile): Promise<void> {
  const data = JSON.stringify(profile);
  await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, data);
}

export async function loadProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (!data) return null;
  return JSON.parse(data) as UserProfile;
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}
