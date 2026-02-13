import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/src/engine/types';
import { saveProfile, loadProfile } from '@/src/storage/profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile()
      .then((p) => setProfile(p))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (newProfile: UserProfile) => {
    await saveProfile(newProfile);
    setProfile(newProfile);
  }, []);

  const update = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!profile) return;
      const updated: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await saveProfile(updated);
      setProfile(updated);
    },
    [profile]
  );

  return { profile, loading, save, update };
}
