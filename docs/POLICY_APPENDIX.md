# Policy Appendix (EngineSelector Rule Table)

버전: v1.1  
대상 PRD: `/Users/exem/DK/BathSommelier/docs/PRD_CURRENT.md` (v3.10.2)

## 1. 목적
- EngineSelector의 필드 정의를 실제 결정 규칙으로 고정해 구현 편차를 제거한다.
- Home은 엔진 선택 UI가 아니라 EngineSelector 결과를 표시하는 레이어로 동작한다.

## 2. EngineSelector Contract
```txt
EngineSelector {
  active_state
  time_context
  environment_context
  priority_resolution
}
```

## 3. Rule Table

### 3.1 STEP1 상태 → 기본 ModeType
| step1_primary_state | base_mode_type | notes |
|---|---|---|
| 긴장되어 있다 | recovery | 심야 시 sleep override 가능 |
| 몸이 무겁다 | recovery | 회복 기본 |
| 잠이 안 온다 | sleep | 수면 준비 니즈 |
| 기분이 가라앉았다 | recovery | Trip secondary 우선 노출 권장 |
| 단순히 리셋하고 싶다 | reset | ResetRiskGate 적용 |

### 3.2 time_context 오버라이드
| 조건 | override_rule |
|---|---|
| `late_night` AND `active_state != want_reset` | `mode_type = sleep` |
| `morning` AND `active_state = cant_sleep` | `mode_type = recovery` |
| `day/evening` AND `active_state = tension` | `mode_type = recovery` |

### 3.3 Home 출력 규칙 (초기 고정)
| 조건 | 출력 |
|---|---|
| 기본 정책 | `priority_resolution = CARE_PRIMARY__TRIP_SECONDARY` |
| low_mood 또는 want_reset | Trip을 secondary 우선 배치 |
| environment = shower | Trip Lite 우선 |
| environment = bathtub/partial | Trip Deep 허용 |

### 3.4 active_state 우선순위
| 조건 | 처리 |
|---|---|
| `active_state` 존재 | Care protocol 우선 적용 |
| Care/Trip 동시 후보 | Home Primary = Care, Secondary = Trip ambience |
| high_risk 감지 | Safe Routine Only 우선, risky CTA 차단 |

## 4. Priority Resolution
```txt
1) Safety
2) Active state (Care)
3) Time context override
4) User preference
5) Trip immersion overlay
```

## 5. Fallback Strategy Table
| 상황 | fallback_strategy | 결과 |
|---|---|---|
| 데이터 부족 | `DEFAULT_STARTER_RITUAL` | Starter 루틴 고정값 적용 |
| 고위험군 감지 | `SAFE_ROUTINE_ONLY` | partial/footbath 중심 보수 루틴 강제 |
| reset + 금기군 | `RESET_WITHOUT_COLD` | 냉수 단계/CTA 완전 비노출 |
| 제품 후보 부족 | `ROUTINE_ONLY_NO_COMMERCE` | 커머스 숨김, 루틴 실행은 유지 |

## 6. UI 표현 규칙
- 사용자는 Care/Trip를 직접 선택하지 않는다.
- Home은 EngineSelector 결과만 노출한다.
- 엔진명은 디버그/운영 도구를 제외하고 사용자 UI에 직접 노출하지 않는다.
