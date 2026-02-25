import AsyncStorage from '@react-native-async-storage/async-storage';
import { BathEnvironment } from '@/src/engine/types';
import { STORAGE_KEYS } from './keys';

const VALID_ENVIRONMENTS: BathEnvironment[] = [
  'bathtub',
  'footbath',
  'partial_bath',
  'shower',
];

export async function saveLastEnvironment(environment: BathEnvironment): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_ENVIRONMENT, environment);
}

export async function loadLastEnvironment(): Promise<BathEnvironment | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ENVIRONMENT);
  if (!value) return null;
  if (VALID_ENVIRONMENTS.includes(value as BathEnvironment)) {
    return value as BathEnvironment;
  }
  return null;
}
