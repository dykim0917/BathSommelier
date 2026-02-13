import AsyncStorage from '@react-native-async-storage/async-storage';
import { BathRecommendation } from '@/src/engine/types';
import { STORAGE_KEYS } from './keys';

const MAX_HISTORY = 30;

export async function saveRecommendation(rec: BathRecommendation): Promise<void> {
  const history = await loadHistory();
  history.unshift(rec);
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }
  await AsyncStorage.setItem(
    STORAGE_KEYS.RECOMMENDATION_HISTORY,
    JSON.stringify(history)
  );
}

export async function loadHistory(): Promise<BathRecommendation[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.RECOMMENDATION_HISTORY);
  if (!data) return [];
  return JSON.parse(data) as BathRecommendation[];
}

export async function getRecommendationById(
  id: string
): Promise<BathRecommendation | null> {
  const history = await loadHistory();
  return history.find((r) => r.id === id) ?? null;
}
