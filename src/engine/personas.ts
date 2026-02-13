import { DailyTag, PersonaCode, TemperatureRange } from './types';

export interface PersonaDefinition {
  code: PersonaCode;
  nameKo: string;
  nameEn: string;
  triggerTags: DailyTag[];
  bathType: 'full' | 'half' | 'foot';
  temperature: TemperatureRange;
  durationMinutes: number | null;
  ingredientIds: string[];
  lighting: string;
  priority: number; // lower = higher priority in conflict resolution
}

export const PERSONA_DEFINITIONS: PersonaDefinition[] = [
  {
    code: 'P1_SAFETY',
    nameKo: '안심 케어',
    nameEn: 'Safety Care',
    triggerTags: [], // activated by health conditions, not daily tags
    bathType: 'foot',
    temperature: { min: 36, max: 38, recommended: 37 },
    durationMinutes: null, // no time limit
    ingredientIds: ['lavender_oil', 'marjoram_oil'],
    lighting: '따뜻한 간접 조명 (Warm indirect lighting)',
    priority: 0,
  },
  {
    code: 'P2_CIRCULATION',
    nameKo: '순환 케어',
    nameEn: 'Circulation Care',
    triggerTags: ['cold', 'swelling', 'menstrual_pain'],
    bathType: 'half',
    temperature: { min: 38, max: 40, recommended: 39 },
    durationMinutes: 20,
    ingredientIds: ['carbonated_bath', 'grapefruit_oil'],
    lighting: '오렌지 톤 캔들 라이트 (Orange-tone candle light)',
    priority: 2,
  },
  {
    code: 'P3_MUSCLE',
    nameKo: '근육 케어',
    nameEn: 'Muscle Care',
    triggerTags: ['muscle_pain'],
    bathType: 'full',
    temperature: { min: 40, max: 42, recommended: 41 },
    durationMinutes: 15,
    ingredientIds: ['epsom_salt', 'peppermint_oil'],
    lighting: '어두운 블루 조명 (Dark blue lighting)',
    priority: 1,
  },
  {
    code: 'P4_SLEEP',
    nameKo: '수면 케어',
    nameEn: 'Sleep Care',
    triggerTags: ['insomnia', 'stress', 'depression'],
    bathType: 'full',
    temperature: { min: 36, max: 38, recommended: 37 },
    durationMinutes: 20,
    ingredientIds: ['lavender_oil', 'hinoki_oil'],
    lighting: '은은한 보라 조명 (Soft purple lighting)',
    priority: 1,
  },
];
