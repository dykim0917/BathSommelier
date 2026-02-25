# Analytics Appendix (Event + Required Properties)

버전: v1.1  
대상 PRD: `/Users/exem/DK/BathSommelier/docs/PRD_CURRENT.md` (v3.10.2)

## 1. 공통 스키마 (모든 핵심 이벤트 필수)
```txt
common_properties {
  user_id                    // anonymous 허용
  session_id
  app_version
  locale
  time_context               // late_night | morning | day | evening
  environment                // shower | bathtub | partial_bath
  partial_bath_subtype       // low_leg | footbath | null
  active_state               // tension | heavy | cant_sleep | low_mood | want_reset
  mode_type                  // sleep | reset | recovery | trip
  suggestion_id
  suggestion_rank            // primary | secondary_1 | secondary_2 | null
  fallback_strategy_applied  // none | DEFAULT_STARTER_RITUAL | SAFE_ROUTINE_ONLY | RESET_WITHOUT_COLD | ROUTINE_ONLY_NO_COMMERCE
  experiment_id
  variant
  ts
}
```

## 2. 커머스 이벤트 추가 필수 필드
```txt
commerce_properties {
  product_id
  slot                  // A | B | C
  price_tier            // low | mid | high
  sommelier_pick        // true | false
}
```

## 3. 필수 이벤트 사양
| event_name | required_properties |
|---|---|
| recommendation_card_impression | common_properties + engine_source(care/trip) |
| recommendation_card_click | common_properties + engine_source(care/trip) |
| onboarding_variant_exposed | common_properties + onboarding_variant |
| onboarding_completed | common_properties + onboarding_variant + questions_count |
| health_input_prompt_seen | common_properties + prompt_type |
| health_input_submitted_optional | common_properties + fields_submitted[] |
| why_explainer_exposed | common_properties |
| routine_start | common_properties |
| routine_started_after_why | common_properties |
| routine_complete | common_properties + completion_snapshot_id |
| revisit_within_7d | common_properties + attribution_window_days |
| product_detail_view | common_properties + commerce_properties |
| affiliate_link_click | common_properties + commerce_properties + affiliate_partner |
| sommelier_pick_click | common_properties + commerce_properties + pick_reason_id |
| personalization_message_exposed | common_properties + ramp_stage(0/20/40) |

## 4. 세그먼트 키 (대시보드 필수)
- `environment`
- `mode_type`
- `risk_level`
- `onboarding_variant`
- `experiment_id`, `variant`
- `fallback_strategy_applied`

## 5. KPI 계산 가드
- 공통 스키마 누락 이벤트는 KPI 계산에서 제외한다.
- `experiment_id` 또는 `variant` 누락 시 A/B 분석 테이블에서 제외한다.
- 커머스 이벤트에서 `product_id`/`slot` 누락 시 CTR/전환 집계 제외.
- `suggestion_id` 또는 `suggestion_rank` 누락 이벤트는 추천 퍼널 분석에서 제외.
