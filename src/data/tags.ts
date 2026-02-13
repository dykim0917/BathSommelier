import { PhysicalTag, MentalTag } from '@/src/engine/types';

export interface TagDefinition {
  id: PhysicalTag | MentalTag;
  labelKo: string;
  labelEn: string;
  category: 'physical' | 'mental';
  emoji: string;
}

export const PHYSICAL_TAGS: TagDefinition[] = [
  { id: 'muscle_pain', labelKo: '근육통', labelEn: 'Muscle pain', category: 'physical', emoji: '💪' },
  { id: 'swelling', labelKo: '부종', labelEn: 'Swelling', category: 'physical', emoji: '🦶' },
  { id: 'cold', labelKo: '감기', labelEn: 'Cold', category: 'physical', emoji: '🤧' },
  { id: 'menstrual_pain', labelKo: '생리통', labelEn: 'Menstrual pain', category: 'physical', emoji: '🩸' },
  { id: 'hangover', labelKo: '음주/숙취', labelEn: 'Hangover', category: 'physical', emoji: '🍺' },
];

export const MENTAL_TAGS: TagDefinition[] = [
  { id: 'insomnia', labelKo: '불면', labelEn: 'Insomnia', category: 'mental', emoji: '😴' },
  { id: 'stress', labelKo: '스트레스', labelEn: 'Stress', category: 'mental', emoji: '😤' },
  { id: 'depression', labelKo: '우울', labelEn: 'Depression', category: 'mental', emoji: '😢' },
];

export const ALL_TAGS: TagDefinition[] = [...PHYSICAL_TAGS, ...MENTAL_TAGS];
