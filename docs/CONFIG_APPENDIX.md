# Config Appendix (Default Rituals + Safety Defaults)

버전: v1.1  
대상 PRD: `/Users/exem/DK/BathSommelier/docs/PRD_CURRENT.md` (v3.10.2)

## 1. Default Starter Ritual (데이터 부족 시)
```txt
default_starter_ritual {
  ritual_id: starter_v1
  mode_type: sleep
  environment_support: [bathtub, shower, partial_bath]
  fallback_environment: partial_bath(footbath)
  temperature_c: 38~39
  duration_min: 10
  scent_profile: neutral
  lighting_profile: soft_white
  steps: [prep, immerse, finish]
  copy_tone: wellness_routine_only
  contraindication_guard: apply_safety_filter_first
}
```

## 2. Safe Routine Only (고위험군 감지 시)
```txt
safe_routine_only {
  ritual_id: safe_only_v1
  preferred_environment_order: [
    partial_bath(footbath),
    partial_bath(low_leg),
    warm_shower_only
  ]
  temperature_cap_c: 38
  duration_cap_min: 10
  cold_exposure: disabled
  posture_notice: required
  transition_notice: required
  stop_button: always_visible
  cold_cta: hidden
  steps: [prep, safe_immerse, finish]
}
```

## 3. ResetRiskGate (PMF 1단계 기본)
```txt
reset_risk_gate {
  default_reset_mode: non_cold_activation
  cold_exposure_enabled: advanced_opt_in_only
  consent_required: true
  hard_block_conditions: existing_contraindications
}
```

## 4. Environment Compatibility (실행용 상수)
```txt
environment_compatibility {
  bathtub_or_partial: [powder, salt, milk, oil]
  shower: [steamer, bodywash, mist, tablet]
}
```

## 5. Fallback Strategy Key Map
```txt
fallback_strategy_keys {
  DEFAULT_STARTER_RITUAL
  SAFE_ROUTINE_ONLY
  RESET_WITHOUT_COLD
  ROUTINE_ONLY_NO_COMMERCE
}
```

## 6. 개발 가드
- 본 부록 값은 런타임 config(JSON/TS 상수)의 단일 소스다.
- PRD 본문과 상수가 충돌하면 본 부록을 우선하고, PRD를 즉시 동기화한다.
