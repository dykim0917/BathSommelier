import {
  CanonicalBathEnvironment,
  IntentCard,
  SubProtocolOption,
  TimeContext,
} from '@/src/engine/types';

export const CARE_INTENT_CARDS: IntentCard[] = [
  {
    id: 'care_muscle_relief',
    domain: 'care',
    intent_id: 'muscle_relief',
    mapped_mode: 'recovery',
    allowed_environments: ['bathtub', 'partial_bath', 'shower'],
    copy_title: '운동 후 근육을 풀어볼까요?',
    copy_subtitle_by_environment: {
      shower: '샤워 5분으로 가볍게 이완해요.',
      bathtub: '욕조 12분으로 깊게 풀어줘요.',
      partial_bath: '부분입욕 10분으로 하체를 먼저 풀어요.',
    },
    default_subprotocol_id: 'muscle_whole_body',
    card_position: 1,
  },
  {
    id: 'care_sleep_ready',
    domain: 'care',
    intent_id: 'sleep_ready',
    mapped_mode: 'sleep',
    allowed_environments: ['bathtub', 'partial_bath', 'shower'],
    copy_title: '잠이 오지 않는 당신을 위한 루틴',
    copy_subtitle_by_environment: {
      shower: '샤워 6분으로 잠들기 전 긴장을 낮춰요.',
      bathtub: '욕조 15분으로 수면 준비를 도와요.',
      partial_bath: '부분입욕 10분으로 몸을 천천히 가라앉혀요.',
    },
    default_subprotocol_id: 'sleep_sensitive',
    card_position: 2,
  },
  {
    id: 'care_hangover_relief',
    domain: 'care',
    intent_id: 'hangover_relief',
    mapped_mode: 'reset',
    allowed_environments: ['shower', 'bathtub'],
    copy_title: '술 드셨다면 지금 이 조합이 좋아요',
    copy_subtitle_by_environment: {
      shower: '샤워 5분으로 부담 없이 정리해요.',
      bathtub: '욕조 8분으로 몸을 부드럽게 풀어줘요.',
      partial_bath: '부분입욕보다 샤워 또는 욕조를 권장해요.',
    },
    default_subprotocol_id: 'hangover_sensitive',
    card_position: 3,
  },
  {
    id: 'care_edema_relief',
    domain: 'care',
    intent_id: 'edema_relief',
    mapped_mode: 'recovery',
    allowed_environments: ['partial_bath', 'bathtub', 'shower'],
    copy_title: '붓기 완화에 집중해볼까요?',
    copy_subtitle_by_environment: {
      shower: '샤워 6분으로 가볍게 순환 리듬을 만들어요.',
      bathtub: '욕조 10분으로 전신을 편안하게 풀어줘요.',
      partial_bath: '부분입욕 12분으로 하체 붓기에 집중해요.',
    },
    default_subprotocol_id: 'edema_lower',
    card_position: 4,
  },
];

export const TRIP_INTENT_CARDS: IntentCard[] = [
  {
    id: 'trip_kyoto',
    domain: 'trip',
    intent_id: 'kyoto_forest',
    mapped_mode: 'recovery',
    allowed_environments: ['bathtub', 'partial_bath', 'shower'],
    copy_title: '교토 숲으로 잠깐 떠나볼까요?',
    copy_subtitle_by_environment: {
      shower: '샤워 5분, 숲 분위기로 전환해요.',
      bathtub: '욕조 12분, 교토 숲 몰입 루틴이에요.',
      partial_bath: '부분입욕 10분, 잔잔하게 몰입해요.',
    },
    default_subprotocol_id: 'trip_kyoto_balanced',
    card_position: 1,
  },
  {
    id: 'trip_nordic',
    domain: 'trip',
    intent_id: 'nordic_sauna',
    mapped_mode: 'recovery',
    allowed_environments: ['shower', 'bathtub', 'partial_bath'],
    copy_title: '노르딕 무드로 리셋해볼까요?',
    copy_subtitle_by_environment: {
      shower: '샤워 6분, 사우나 감성을 간단히.',
      bathtub: '욕조 12분, 따뜻한 몰입 루틴.',
      partial_bath: '부분입욕 10분, 차분한 전환.',
    },
    default_subprotocol_id: 'trip_nordic_balanced',
    card_position: 2,
  },
  {
    id: 'trip_rainy',
    domain: 'trip',
    intent_id: 'rainy_camping',
    mapped_mode: 'sleep',
    allowed_environments: ['bathtub', 'shower', 'partial_bath'],
    copy_title: '비 오는 캠핑 감성으로 쉬어가요',
    copy_subtitle_by_environment: {
      shower: '샤워 5분, 빗소리 무드로 정리해요.',
      bathtub: '욕조 12분, 캠핑 몰입 루틴.',
      partial_bath: '부분입욕 10분, 차분하게 쉬어요.',
    },
    default_subprotocol_id: 'trip_rainy_balanced',
    card_position: 3,
  },
  {
    id: 'trip_snow',
    domain: 'trip',
    intent_id: 'snow_cabin',
    mapped_mode: 'sleep',
    allowed_environments: ['bathtub', 'partial_bath', 'shower'],
    copy_title: '스노우 캐빈 무드로 하루를 마무리해요',
    copy_subtitle_by_environment: {
      shower: '샤워 5분, 부드럽게 마무리해요.',
      bathtub: '욕조 12분, 포근하게 정리해요.',
      partial_bath: '부분입욕 10분, 잔잔하게 내려와요.',
    },
    default_subprotocol_id: 'trip_snow_balanced',
    card_position: 4,
  },
];

export const CARE_SUBPROTOCOL_OPTIONS: Record<string, SubProtocolOption[]> = {
  muscle_relief: [
    {
      id: 'muscle_lower_body',
      intent_id: 'muscle_relief',
      label: '하체가 뻐근해요',
      hint: '하체 중심으로 부드럽게 풀어줘요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['하체 가동 동작 1회'],
        duration_delta: 2,
        environment_bias: 'partial_bath',
      },
    },
    {
      id: 'muscle_upper_body',
      intent_id: 'muscle_relief',
      label: '어깨/목이 뻐근해요',
      hint: '상체 이완에 더 집중해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['어깨/목 이완 동작 1회'],
        duration_delta: 1,
      },
    },
    {
      id: 'muscle_whole_body',
      intent_id: 'muscle_relief',
      label: '전신이 무거워요',
      hint: '전신을 고르게 풀어주는 기본 루틴이에요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['전신 이완 동작 1회'],
      },
    },
  ],
  sleep_ready: [
    {
      id: 'sleep_thinking',
      intent_id: 'sleep_ready',
      label: '생각이 많아요',
      hint: '호흡 구간으로 머리를 천천히 가라앉혀요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['호흡 1분'],
        lighting_adjustment: '조명 점진 감소',
        duration_delta: 2,
      },
    },
    {
      id: 'sleep_sensitive',
      intent_id: 'sleep_ready',
      label: '예민해서 잠이 안 와요',
      hint: '자극을 줄이고 안정적으로 진행해요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['리듬 최소화'],
        lighting_adjustment: '저자극 조명',
      },
    },
  ],
  hangover_relief: [
    {
      id: 'hangover_sensitive',
      intent_id: 'hangover_relief',
      label: '두통이 있고 민감해요',
      hint: '짧고 부드럽게 진행해요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['짧은 안정 루틴'],
        duration_delta: -2,
        environment_bias: 'shower',
      },
    },
    {
      id: 'hangover_heavy',
      intent_id: 'hangover_relief',
      label: '몸이 무겁고 처져요',
      hint: '중간 강도로 리듬을 한 번 전환해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['리듬 전환 1회'],
      },
    },
  ],
  edema_relief: [
    {
      id: 'edema_lower',
      intent_id: 'edema_relief',
      label: '하체 붓기가 심해요',
      hint: '하체 중심으로 순환을 도와요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['발목/종아리 펌핑 1회'],
        duration_delta: 2,
        environment_bias: 'partial_bath',
      },
    },
    {
      id: 'edema_whole_body',
      intent_id: 'edema_relief',
      label: '전신이 붓는 느낌이에요',
      hint: '짧은 단계 전환으로 부드럽게 정리해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['단계 전환 1회'],
      },
    },
  ],
};

export const TRIP_SUBPROTOCOL_OPTIONS: Record<string, SubProtocolOption[]> = {
  kyoto_forest: [
    {
      id: 'trip_kyoto_balanced',
      intent_id: 'kyoto_forest',
      label: '기본 몰입',
      hint: '잔잔하고 안정적인 교토 무드.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['느린 호흡 3회'],
      },
    },
    {
      id: 'trip_kyoto_deep',
      intent_id: 'kyoto_forest',
      label: '깊은 몰입',
      hint: '조금 더 오래 머무는 느낌으로 진행해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['몰입 구간 1회'],
        duration_delta: 2,
      },
    },
  ],
  nordic_sauna: [
    {
      id: 'trip_nordic_balanced',
      intent_id: 'nordic_sauna',
      label: '기본 리셋',
      hint: '차분하고 균형 잡힌 사우나 무드.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['전환 호흡 1회'],
      },
    },
    {
      id: 'trip_nordic_quick',
      intent_id: 'nordic_sauna',
      label: '빠른 전환',
      hint: '짧게 리듬을 바꾸는 루틴.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['짧은 리듬 전환'],
        duration_delta: -1,
      },
    },
  ],
  rainy_camping: [
    {
      id: 'trip_rainy_balanced',
      intent_id: 'rainy_camping',
      label: '기본 휴식',
      hint: '빗소리 중심의 안정 루틴.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['안정 구간 유지'],
      },
    },
    {
      id: 'trip_rainy_soft',
      intent_id: 'rainy_camping',
      label: '더 잔잔하게',
      hint: '자극을 더 낮춰서 진행해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['리듬 최소화'],
        lighting_adjustment: '차분한 조명',
      },
    },
  ],
  snow_cabin: [
    {
      id: 'trip_snow_balanced',
      intent_id: 'snow_cabin',
      label: '기본 마무리',
      hint: '포근한 분위기로 하루를 정리해요.',
      is_default: true,
      partialOverrides: {
        behavior_blocks: ['마무리 호흡 1회'],
      },
    },
    {
      id: 'trip_snow_warm',
      intent_id: 'snow_cabin',
      label: '따뜻하게 마무리',
      hint: '온기 중심으로 조금 더 깊게 진행해요.',
      is_default: false,
      partialOverrides: {
        behavior_blocks: ['온기 유지 구간 1회'],
        duration_delta: 1,
      },
    },
  ],
};

export function getSectionOrderByContext(
  timeContext: TimeContext
): 'care_first' | 'trip_first' {
  if (timeContext === 'day' || timeContext === 'evening') {
    return 'trip_first';
  }
  return 'care_first';
}

export function getEnvironmentSubtitle(
  card: IntentCard,
  environment: CanonicalBathEnvironment
): string {
  return card.copy_subtitle_by_environment[environment];
}
