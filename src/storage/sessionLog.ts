import AsyncStorage from '@react-native-async-storage/async-storage';
import { BathSessionRecord } from '@/src/engine/types';
import { STORAGE_KEYS } from './keys';

const MAX_SESSION_LOG = 200;

function isFeelingScore(value: unknown): value is 1 | 2 | 3 | 4 | 5 {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function normalizeSessionRecord(
  record: BathSessionRecord
): BathSessionRecord {
  return {
    ...record,
    trip_name: record.trip_name ?? null,
    duration: record.duration ?? null,
    user_feeling_before: isFeelingScore(record.user_feeling_before)
      ? record.user_feeling_before
      : 3,
    user_feeling_after: isFeelingScore(record.user_feeling_after)
      ? record.user_feeling_after
      : 3,
  };
}

export async function loadSessionLog(): Promise<BathSessionRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.BATH_SESSION_LOG);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as BathSessionRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeSessionRecord);
  } catch {
    return [];
  }
}

export async function upsertSessionRecord(
  record: BathSessionRecord
): Promise<void> {
  const current = await loadSessionLog();
  const normalized = normalizeSessionRecord(record);
  const next = [
    normalized,
    ...current.filter((item) => item.id !== normalized.id),
  ];
  if (next.length > MAX_SESSION_LOG) {
    next.length = MAX_SESSION_LOG;
  }
  await AsyncStorage.setItem(STORAGE_KEYS.BATH_SESSION_LOG, JSON.stringify(next));
}

export async function patchSessionRecord(
  id: string,
  patch: Partial<BathSessionRecord>
): Promise<void> {
  const current = await loadSessionLog();
  const existing = current.find((item) => item.id === id);
  if (!existing) return;

  const merged = normalizeSessionRecord({
    ...existing,
    ...patch,
    id: existing.id,
  });

  const next = [merged, ...current.filter((item) => item.id !== id)];
  await AsyncStorage.setItem(STORAGE_KEYS.BATH_SESSION_LOG, JSON.stringify(next));
}
