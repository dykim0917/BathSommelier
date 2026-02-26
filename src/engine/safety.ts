import {
  UserProfile,
  DailyTag,
  SafetyRule,
  BathRecommendation,
  HealthCondition,
} from './types';

const SAFETY_RULES: SafetyRule[] = [
  {
    condition: 'hypertension_heart',
    maxTemp: 38,
    warningMessage:
      '⚠️ 고혈압/심장 질환이 있으시므로 수온이 38°C로 제한됩니다.',
    severity: 'block',
  },
  {
    condition: 'pregnant',
    bannedIngredientIds: [
      'rosemary_oil',
      'peppermint_oil',
      'clary_sage_oil',
    ],
    maxTemp: 38,
    warningMessage:
      '🤰 임신 중에는 특정 아로마 오일이 제외되고 수온이 38°C로 제한됩니다.',
    severity: 'block',
  },
  {
    condition: 'hangover' as DailyTag,
    maxTemp: 38,
    forcedBathType: 'foot',
    warningMessage:
      '🍺 음주 후 입욕은 위험합니다. 미온수 족욕만 가능합니다.',
    severity: 'block',
  },
  {
    condition: 'diabetes',
    maxTemp: 40,
    warningMessage:
      '🩸 당뇨가 있으시므로 족욕 시 수온을 자주 확인해주세요. 화상에 유의하세요.',
    severity: 'warn',
  },
  {
    condition: 'sensitive_skin',
    warningMessage:
      '🌵 민감성 피부이시므로 자극적인 성분은 제외됩니다.',
    severity: 'warn',
  },
];

export interface SafetyFilterResult {
  maxTempCeiling: number | null;
  bannedIngredientIds: string[];
  forcedBathType: BathRecommendation['bathType'] | null;
  warnings: string[];
}

export function applySafetyFilter(
  profile: UserProfile,
  dailyTags: DailyTag[]
): SafetyFilterResult {
  const result: SafetyFilterResult = {
    maxTempCeiling: null,
    bannedIngredientIds: [],
    forcedBathType: null,
    warnings: [],
  };

  const activeConditions: (HealthCondition | DailyTag)[] = [
    ...profile.healthConditions,
    ...dailyTags,
  ];

  for (const rule of SAFETY_RULES) {
    if (activeConditions.includes(rule.condition)) {
      if (rule.maxTemp !== undefined) {
        result.maxTempCeiling =
          result.maxTempCeiling === null
            ? rule.maxTemp
            : Math.min(result.maxTempCeiling, rule.maxTemp);
      }
      if (rule.bannedIngredientIds) {
        result.bannedIngredientIds.push(...rule.bannedIngredientIds);
      }
      if (rule.forcedBathType) {
        result.forcedBathType = rule.forcedBathType;
      }
      result.warnings.push(rule.warningMessage);
    }
  }

  result.bannedIngredientIds = [...new Set(result.bannedIngredientIds)];

  return result;
}
