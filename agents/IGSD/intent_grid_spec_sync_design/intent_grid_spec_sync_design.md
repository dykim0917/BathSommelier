# Home IntentGrid Spec Sync — 에이전트 설계서

버전: v0.1 (설계 초안)  
코드베이스 경로: `~/DK/BathSommelier`  
작성 목적: Claude Code 구현 참조용 계획서

---

## 1. 작업 컨텍스트

### 1.1 배경 및 목적

BathSommelier 홈 탭의 IntentCard 8종과 각 카드별 SubProtocolOption(1~3개)은  
문서(PRD/Wireframe), TypeScript 타입, 데이터 파일, 컴포넌트 코드 4곳에 분산 정의되어 있다.  
이 에이전트는 **기존 코드베이스를 읽어 4자리 간 불일치를 탐지**하고,  
개발자가 수정할 수 있도록 불일치 리포트(JSON + MD)를 생성한다.  
코드를 직접 수정하지 않는다.

### 1.2 범위

| 포함 | 제외 |
|------|------|
| Intent 정의 불일치 탐지 (이름·환경별 subtitle·아이콘·색상) | 코드 자동 수정 |
| SubProtocol 불일치 탐지 (옵션 수·partialOverrides 룰) | 알고리즘 로직 검증 |
| Safety Gate 적용 여부 누락 탐지 | 런타임 테스트 실행 |
| 이벤트 스키마 누락 탐지 (Analytics Appendix 기준) | UI 렌더링 검증 |
| 모달 기본값(preselect) 정합 검증 | 실제 앱 빌드 |
| 수정 가이드 MD 문서 생성 | |

### 1.3 입력 정의

| 입력 | 형식 | 역할 |
|------|------|------|
| PRD 문서 | `~/DK/BathSommelier/docs/PRD_CURRENT.md` | 스펙 자동 추출 소스 |
| Wireframe 문서 | `~/DK/BathSommelier/docs/WIREFRAME_V3_11_0.md` | 스펙 자동 추출 소스 |
| 코드베이스 경로 | 실행 파라미터 `--root ~/DK/BathSommelier` | 탐색 대상 루트 |
| 스캔 대상 파일 패턴 | `input/scan_targets.json` | 스캔할 파일 경로/패턴 목록 |

> `spec_intents.json`, `spec_subprotocols.json`은 사람이 작성하지 않는다.  
> STEP 0에서 에이전트가 PRD/Wireframe을 읽어 자동 생성하며, 이후 단계의 정답 기준으로 사용한다.

#### 스캔 대상 파일 (초기 목록)

```
app/(tabs)/index.tsx              ← IntentCard 렌더링, 환경별 분기
src/components/CategoryCard.tsx   ← 카드 UI 컴포넌트
src/components/SubProtocolPickerModal.tsx  ← 모달, preselect 로직
src/data/colors.ts                ← CATEGORY_CARD_COLORS, CATEGORY_CARD_EMOJI
src/engine/                       ← homeOrchestration, IntentCard 데이터 정의
src/types/                        ← TypeScript 타입 (IntentCard, SubProtocolOption 등)
docs/PRD_CURRENT.md               ← 문서 소스
docs/WIREFRAME_V3_11_0.md         ← UI 스펙 소스
```

### 1.4 출력 정의

| 파일 | 내용 |
|------|------|
| `/output/spec_intents.json` | PRD/Wireframe에서 자동 추출한 정답 스펙 (Intent 8개) |
| `/output/spec_subprotocols.json` | PRD/Wireframe에서 자동 추출한 SubProtocol 룰 |
| `/output/intent_cards.json` | 현재 코드에서 추출한 IntentCard 상태 (정규화) |
| `/output/subprotocols.json` | 현재 코드에서 추출한 SubProtocol 상태 (정규화) |
| `/output/home_spec.md` | Home 구성·모달·이벤트 포함 전체 스펙 현황 |
| `/output/discrepancies.json` | 불일치 목록 (소스·필드·현재값·기대값) |
| `/output/fix_guide.md` | 개발자용 수정 가이드 (파일별 수정 액션) |
| `/output/run_log.json` | 단계별 실행 로그 |

### 1.5 제약조건

| 제약 | 내용 |
|------|------|
| 카드 수 제한 | 2×2 그리드 = 카테고리당 4개, 총 8개 고정 |
| 옵션 수 제한 | SubProtocolOption 1~3개 (미만/초과 모두 불일치) |
| 모달 기본값 | `partial_bath` 환경에서 첫 번째 옵션 preselect 필수 |
| Safety Gate | 고위험 조건 Intent에 SafetyWarning 트리거 연결 필수 — 누락 시 CRITICAL 레벨 |
| partialOverrides | "additive only" 원칙 — 기존 필드 덮어쓰기 불가 (위반 시 불일치) |
| 코드 수정 금지 | 에이전트는 읽기 전용 — 산출물은 리포트만 |

### 1.6 불일치 심각도 분류

| 레벨 | 기준 | 예시 |
|------|------|------|
| CRITICAL | 안전 관련 누락, Safety Gate 미연결 | 고위험 Intent에 SafetyWarning 없음 |
| ERROR | 스펙과 코드 간 값 불일치 | subtitle 텍스트 다름, 옵션 수 초과 |
| WARNING | 선택적 필드 누락 또는 권장 미준수 | 이벤트 속성 누락 |
| INFO | 참고용 현황 (불일치 아님) | 미사용 색상 토큰 |

### 1.7 용어 정의

| 용어 | 정의 |
|------|------|
| IntentCard | 홈 탭 2×2 그리드의 카드 1개 (아이콘·타이틀·subtitle·색상) |
| SubProtocolOption | IntentCard 선택 시 모달에 표시되는 세부 옵션 |
| partialOverrides | `partial_bath` 환경에서 bathtub 기본값에 추가 적용되는 필드 |
| preselect | 모달 최초 진입 시 자동 선택되는 기본 옵션 |
| Safety Gate | 고위험 조건 감지 시 SafetyWarning 모달을 강제 표시하는 트리거 |
| 정답 스펙 | `output/spec_*.json` — STEP 0에서 자동 추출한 소스 오브 트루스 |
| 코드 현황 | 스캔 대상 파일에서 추출한 현재 구현 상태 |

---

## 2. 워크플로우 정의

### 2.1 전체 흐름도

```
[입력: PRD_CURRENT.md + WIREFRAME_V3_11_0.md + scan_targets.json]
              │
              ▼
  STEP 0: 정답 스펙 자동 추출 [ux-spec-writer]
  - PRD §5·6·20·26 + Wireframe W05 읽기
  - Intent 8개 정의 추출 → output/spec_intents.json
  - SubProtocol 룰 + partialOverrides 추출 → output/spec_subprotocols.json
  - 추출 신뢰도 낮은 항목 플래그 (저신뢰 필드 목록 기록)
              │
              ▼
  STEP 1: 스펙 정규화 및 확정 (메인 에이전트)
  - output/spec_intents.json 파싱 + 필수 필드 완비 확인
  - 저신뢰 플래그 항목 에스컬레이션 여부 판단
  - Intent 8개 + SubProtocol 룰 내부 표현으로 변환
              │
              ▼
  STEP 2: 코드베이스 파싱 [dev-architect]
  - 스캔 대상 파일 읽기
  - IntentCard 정의 추출 → intent_cards.json
  - SubProtocol 정의 추출 → subprotocols.json
  - Safety Gate 연결 추출
  - 이벤트 스키마 참조 추출
              │
              ▼
  STEP 3: 불일치 탐지 (메인 에이전트 + 스크립트)
  - 스펙 vs 코드 필드별 대조
  - 심각도 분류 (CRITICAL/ERROR/WARNING/INFO)
  - discrepancies.json 저장
              │
              ▼
  STEP 4: UX 스펙 문서 생성 [ux-spec-writer]
  - 현재 코드 현황 기반 home_spec.md 생성
  - 모달 흐름·환경별 분기·preselect 규칙 포함
              │
              ▼
  STEP 5: 이벤트 스키마 검증 [analytics-planner]
  - Analytics Appendix 기준 필수 이벤트 누락 탐지
  - discrepancies.json에 WARNING/ERROR 추가
              │
              ▼
  STEP 6: 수정 가이드 생성 (메인 에이전트)
  - discrepancies.json → 파일별 수정 액션 정리
  - fix_guide.md 생성
  - CRITICAL 항목 최상단 강조
              │
              ▼
[출력: intent_cards.json + subprotocols.json + home_spec.md
        + discrepancies.json + fix_guide.md + run_log.json]
```

### 2.2 단계별 상세 정의

---

#### STEP 0. 정답 스펙 자동 추출

**담당**: `ux-spec-writer` 서브에이전트  
**입력**: `~/DK/BathSommelier/docs/PRD_CURRENT.md`, `~/DK/BathSommelier/docs/WIREFRAME_V3_11_0.md`  
**출력**: `output/spec_intents.json`, `output/spec_subprotocols.json`

**처리 내용**:

| 추출 항목 | 소스 섹션 | 담당 |
|-----------|-----------|------|
| Intent 8개 이름·타이틀·아이콘 | Wireframe W05 CategoryCard | LLM |
| 환경별 subtitle 규칙 | Wireframe W05 + PRD §5 | LLM |
| SubProtocol 옵션 수 및 이름 | Wireframe OV02 + PRD §6 | LLM |
| partialOverrides "additive only" 룰 | PRD §6 STEP 2-1 | LLM |
| Safety Gate 연결 대상 Intent | PRD §20.4 고위험군 목록 | LLM |
| 모달 preselect 기본값 | Wireframe OV02 | LLM |

**저신뢰 플래그 기준**: 문서에서 명시적으로 기술되지 않고 추론이 필요한 필드  
→ `spec_intents.json` 내 해당 항목에 `"confidence": "low"` 마킹

**성공 기준**: Intent 8개 추출, 저신뢰 항목 수 ≤ 전체 필드의 20%  
**검증 방법**: 규칙 기반 (추출 수 = 8) + LLM 자기 검증 (문서 인용 근거 확인)  
**실패 처리**:
- Intent 8개 미추출: 소스 섹션 재탐색 후 재시도 1회
- 재시도 실패: 추출된 수량으로 진행 + 누락 항목 에스컬레이션

---

#### STEP 1. 스펙 정규화 및 확정

**담당**: 메인 에이전트  
**입력**: `output/spec_intents.json`, `output/spec_subprotocols.json`  
**출력**: 메모리 내 정규화된 스펙 (파일 저장 없음)

**처리 내용**:
- Intent 8개 필수 필드 완비 확인 (이름, 환경별 subtitle, 아이콘 키, 색상 토큰, SubProtocol 연결)
- 저신뢰(`"confidence": "low"`) 항목 검토 — 에스컬레이션 임계값(3개 초과) 시 사람 확인 요청
- SubProtocol partialOverrides 룰 파싱 ("additive only" 원칙 명세 추출)
- 환경별 subtitle 매핑 테이블 구성 (`bathtub | shower | partial_bath`)

**성공 기준**: Intent 8개 모두 필수 필드 완비, SubProtocol 룰 파싱 오류 0건  
**검증 방법**: 스키마 검증  
**실패 처리**: 필수 필드 누락 시 에스컬레이션 — 진행 불가

---

#### STEP 2. 코드베이스 파싱

**담당**: `dev-architect` 서브에이전트  
**입력**: `input/scan_targets.json` + 코드베이스 루트 경로  
**출력**: `output/intent_cards.json`, `output/subprotocols.json`

**처리 내용**:

| 추출 항목 | 소스 파일 | 담당 |
|-----------|-----------|------|
| IntentCard 정의 (이름·subtitle·아이콘·색상) | `index.tsx`, `CategoryCard.tsx`, `src/engine/` | 스크립트 |
| SubProtocolOption 목록 및 옵션 수 | `SubProtocolPickerModal.tsx`, `src/engine/` | 스크립트 |
| preselect 로직 존재 여부 | `SubProtocolPickerModal.tsx` | LLM |
| Safety Gate 연결 여부 (Intent별) | `index.tsx`, `src/engine/` | LLM |
| 환경별 subtitle 분기 로직 | `index.tsx` | LLM |
| partialOverrides 적용 패턴 | `src/engine/` | LLM |
| 이벤트 호출 위치 (참조 추출) | 전체 스캔 대상 | 스크립트 |

**LLM 판단 영역**:
- 코드가 조건부 렌더링으로 구현된 경우 intent별 Safety Gate 연결 여부 추론
- preselect가 명시적 state 초기값으로 구현됐는지 또는 암묵적으로 처리됐는지 판단
- partialOverrides가 spread operator로 기존 값을 덮어쓰는지 여부 판단

**성공 기준**:
- IntentCard 8개 전부 추출 (추출 수 < 8이면 실패)
- SubProtocol 연결 intent에 대해 옵션 목록 완전 추출

**검증 방법**: 규칙 기반 (추출된 Intent 수 = 8 확인)  
**실패 처리**:
- 추출 수 부족: 스캔 대상 파일 확장 후 재시도 1회
- 재시도 실패: 탐지 불가 파일 목록 로그 + 에스컬레이션

---

#### STEP 3. 불일치 탐지

**담당**: 메인 에이전트 (LLM 판단) + 스크립트  
**입력**: STEP 1 정규화 스펙 + `output/intent_cards.json` + `output/subprotocols.json`  
**출력**: `output/discrepancies.json`

**대조 항목 및 담당**:

| 대조 항목 | 기준 | 담당 | 심각도 |
|-----------|------|------|--------|
| Intent 이름 일치 | 스펙 8개 이름 | 스크립트 | ERROR |
| 환경별 subtitle 텍스트 | 스펙 subtitle 매핑 | 스크립트 | ERROR |
| 아이콘 키 일치 | 스펙 아이콘 키 | 스크립트 | WARNING |
| 색상 토큰 일치 | `colors.ts` 토큰 vs 스펙 | 스크립트 | WARNING |
| SubProtocol 옵션 수 (1~3) | 범위 규칙 | 스크립트 | ERROR |
| partialOverrides "additive only" 위반 | 룰 명세 | LLM | ERROR |
| Safety Gate 연결 누락 | 고위험 Intent 목록 | LLM | CRITICAL |
| preselect 기본값 누락 | partial_bath 환경 기준 | LLM | ERROR |
| 카드 수 (2×2 = 4/섹션) | 구조 규칙 | 스크립트 | ERROR |

**discrepancies.json 항목 구조**:
```json
{
  "id": "dc_001",
  "severity": "CRITICAL|ERROR|WARNING|INFO",
  "category": "intent|subprotocol|safety|event|modal",
  "field": "subtitle.shower",
  "intent_id": "muscle_relief",
  "source_file": "app/(tabs)/index.tsx",
  "source_line": 142,
  "current_value": "근육 피로 완화",
  "expected_value": "샤워로 근육 이완",
  "description": "shower 환경 subtitle이 스펙과 다릅니다."
}
```

**성공 기준**: 모든 대조 항목 커버, CRITICAL 항목은 누락 없이 탐지  
**검증 방법**: LLM 자기 검증 (CRITICAL 항목 재확인)  
**실패 처리**: 탐지 로직 오류 시 자동 재시도 1회 → 실패 시 에스컬레이션

---

#### STEP 4. UX 스펙 문서 생성

**담당**: `ux-spec-writer` 서브에이전트  
**입력**: `output/intent_cards.json`, `output/subprotocols.json`  
**출력**: `output/home_spec.md`

**문서 포함 항목**:
- IntentCard 8종 현황표 (이름·subtitle·아이콘·색상·Safety Gate 여부)
- 환경별 subtitle 매핑 현황
- SubProtocolPickerModal 흐름도 (텍스트 기반)
- preselect 기본값 현황
- 환경별 카드 disabled 규칙 현황

**LLM 판단 영역**: 추출된 코드 현황을 자연어 스펙 문서로 변환  
**성공 기준**: 8개 Intent 전부 섹션 포함, 모달 흐름 섹션 존재  
**검증 방법**: 규칙 기반 (필수 섹션 존재 여부)  
**실패 처리**: 섹션 누락 시 자동 재생성 1회

---

#### STEP 5. 이벤트 스키마 검증

**담당**: `analytics-planner` 서브에이전트  
**입력**: `output/intent_cards.json` + Analytics Appendix 기준 (docs/ANALYTICS_APPENDIX.md)  
**출력**: `output/discrepancies.json` 에 항목 추가

**검증 항목**:

| 이벤트 | 필수 속성 | 탐지 기준 |
|--------|-----------|-----------|
| `recommendation_card_impression` | `common_properties` + `engine_source` | Intent별 노출 이벤트 호출 여부 |
| `recommendation_card_click` | `suggestion_id`, `suggestion_rank` | Intent 클릭 시 이벤트 호출 여부 |
| `routine_start` | `common_properties` 전체 | SubProtocol 선택 후 시작 시 |
| SubProtocol 선택 이벤트 | `partial_bath_subtype` 포함 여부 | `partial_bath` 환경 한정 |

**성공 기준**: 필수 이벤트 4종 호출 위치 탐지, 누락 속성 0건 (WARNING 이상)  
**검증 방법**: 스크립트 (이벤트명 패턴 매칭) + LLM (속성 완비 여부 판단)  
**실패 처리**: 스킵 + 로그 (이벤트 코드 미발견 시 WARNING으로 기록)

---

#### STEP 6. 수정 가이드 생성

**담당**: 메인 에이전트  
**입력**: `output/discrepancies.json`  
**출력**: `output/fix_guide.md`

**문서 구조**:
```
# 수정 가이드 — [실행 날짜]

## ⚠️ CRITICAL (즉시 수정 필요)
### [파일명]
- [수정 항목]: [현재값] → [기대값]
- 수정 위치: line X

## 🔴 ERROR
...

## 🟡 WARNING
...

## ℹ️ INFO
...
```

**LLM 판단 영역**:
- 파일별로 수정 액션을 그룹핑하여 개발자가 한 파일씩 작업하기 쉽도록 정렬
- 복수의 불일치가 연관된 경우 선행 수정 순서 제안

**성공 기준**: CRITICAL/ERROR 항목 전부 파일·라인 수준으로 기술  
**검증 방법**: 규칙 기반 (discrepancies.json의 CRITICAL 수 = fix_guide.md CRITICAL 수)  
**실패 처리**: 수량 불일치 시 자동 재생성 1회

---

### 2.3 분기 조건 요약

| 조건 | 처리 |
|------|------|
| 스펙 파일 필수 필드 누락 | 진행 중단 + 에스컬레이션 |
| 코드에서 Intent 8개 미추출 | 스캔 경로 확장 후 재시도 1회 |
| Safety Gate 연결 탐지 불가 | CRITICAL 불일치로 보수적 기록 |
| 이벤트 코드 미발견 | WARNING으로 기록 + 스킵 |
| partialOverrides 패턴 판단 불가 | 에스컬레이션 (코드 확인 요청) |
| discrepancies 0건 | "불일치 없음" 정상 완료 리포트 생성 |

---

## 3. 구현 스펙

### 3.1 폴더 구조

```
/intent-grid-sync                      # 프로젝트 루트 (BathSommelier와 별도)
 ├── CLAUDE.md                          # 메인 에이전트 지침 (오케스트레이터)
 │
 ├── /.claude
 │   ├── /agents
 │   │   ├── /dev-architect
 │   │   │   └── AGENT.md              # 코드 파싱 서브에이전트
 │   │   ├── /ux-spec-writer
 │   │   │   └── AGENT.md              # UX 스펙 문서 생성 서브에이전트
 │   │   └── /analytics-planner
 │   │       └── AGENT.md              # 이벤트 스키마 검증 서브에이전트
 │   │
 │   └── /skills
 │       ├── /code-extractor
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       ├── extract_intents.py      # IntentCard 정의 추출
 │       │       ├── extract_subprotocols.py # SubProtocol 옵션 추출
 │       │       └── extract_events.py       # 이벤트 호출 위치 추출
 │       │
 │       ├── /diff-checker
 │       │   ├── SKILL.md
 │       │   └── /scripts
 │       │       └── compare_spec.py         # 스펙 vs 코드 필드별 대조
 │       │
 │       └── /report-writer
 │           ├── SKILL.md
 │           └── /scripts
 │               └── count_by_severity.py    # 심각도별 집계 검증
 │
 ├── /input
 │   └── scan_targets.json             # 스캔 대상 파일 경로 패턴 (사람이 작성)
 │
 ├── /output                            # 모든 산출물
 │   ├── spec_intents.json             # STEP 0: PRD/Wireframe에서 자동 추출한 정답 스펙
 │   ├── spec_subprotocols.json        # STEP 0: 자동 추출한 SubProtocol 룰
 │   ├── intent_cards.json             # STEP 2: 코드에서 추출한 현황
 │   ├── subprotocols.json             # STEP 2: 코드에서 추출한 현황
 │   ├── home_spec.md                  # STEP 4: UX 스펙 문서
 │   ├── discrepancies.json            # STEP 3+5: 불일치 목록
 │   ├── fix_guide.md                  # STEP 6: 개발자용 수정 가이드
 │   └── run_log.json                  # 실행 로그
 │
 └── /docs
     ├── intent_field_contract.md      # IntentCard 필드 정의 레퍼런스
     └── analytics_event_list.md      # 검증 대상 이벤트 목록 (Appendix 발췌)
```

### 3.2 CLAUDE.md 핵심 섹션 목록

| 섹션 | 내용 |
|------|------|
| 역할 및 목적 | 검증형 오케스트레이터, 코드 수정 금지 원칙 |
| PRD/Wireframe 경로 | STEP 0 스펙 추출 소스 경로 (`docs/PRD_CURRENT.md`, `docs/WIREFRAME_V3_11_0.md`) |
| 코드베이스 경로 | `~/DK/BathSommelier` 읽기 전용 접근 |
| 워크플로우 순서 | STEP 1~6 및 서브에이전트 호출 시점 |
| 심각도 정책 | CRITICAL/ERROR/WARNING/INFO 기준 |
| Safety Gate 최우선 원칙 | CRITICAL 항목은 재확인 필수 |
| 실패 처리 정책 | 에스컬레이션 조건 명시 |
| 출력 파일 버저닝 | 기존 파일 덮어쓰기 vs 타임스탬프 신규 생성 |

### 3.3 에이전트 구조

**구조 선택 근거**: 서브에이전트 분리

- 코드 파싱(도메인: AST·파일 탐색), UX 문서화(도메인: 와이어프레임·스펙 문체), 이벤트 검증(도메인: Analytics 스키마) 세 영역의 지식이 명확히 분리됨
- 각 서브에이전트 지침에 해당 도메인 레퍼런스만 로드하여 컨텍스트 최적화

```
메인 에이전트 (CLAUDE.md) — 오케스트레이터
    │
    ├──→ dev-architect       (STEP 2: 코드 파싱·추출)
    ├──→ ux-spec-writer      (STEP 0: 정답 스펙 추출 + STEP 4: 스펙 문서 생성)
    └──→ analytics-planner   (STEP 5: 이벤트 스키마 검증)
    
    STEP 1, 3, 6 은 메인 에이전트 직접 처리
```

### 3.4 서브에이전트 정의

#### dev-architect

| 항목 | 내용 |
|------|------|
| 역할 | 코드베이스에서 IntentCard·SubProtocol·Safety Gate 정의 추출 |
| 트리거 조건 | STEP 1 스펙 확정 완료 후 |
| 입력 | `input/scan_targets.json` + 코드베이스 루트 경로 |
| 출력 | `output/intent_cards.json`, `output/subprotocols.json` |
| 참조 스킬 | `code-extractor` |
| LLM 판단 영역 | Safety Gate 연결 추론, preselect 패턴 판단, partialOverrides 방식 판단 |

#### ux-spec-writer

| 항목 | 내용 |
|------|------|
| 역할 | (1) STEP 0: PRD/Wireframe에서 정답 스펙 추출 → (2) STEP 4: 코드 현황을 UX 스펙 문서로 변환 |
| 트리거 조건 (STEP 0) | 최초 실행 시 |
| 트리거 조건 (STEP 4) | `intent_cards.json`, `subprotocols.json` 생성 완료 후 |
| 입력 (STEP 0) | `docs/PRD_CURRENT.md`, `docs/WIREFRAME_V3_11_0.md` |
| 입력 (STEP 4) | `output/intent_cards.json`, `output/subprotocols.json` |
| 출력 (STEP 0) | `output/spec_intents.json`, `output/spec_subprotocols.json` |
| 출력 (STEP 4) | `output/home_spec.md` |
| 참조 스킬 | 없음 (순수 LLM 판단) |
| LLM 판단 영역 | 문서 → 정답 스펙 추출, 코드 현황 → 스펙 문체 변환 |

#### analytics-planner

| 항목 | 내용 |
|------|------|
| 역할 | Analytics Appendix 기준 필수 이벤트 누락 탐지 |
| 트리거 조건 | STEP 3 불일치 탐지 완료 후 (discrepancies.json 생성 후) |
| 입력 | `output/intent_cards.json` + `docs/analytics_event_list.md` |
| 출력 | `output/discrepancies.json` 에 항목 추가 |
| 참조 스킬 | `code-extractor` (extract_events.py), `diff-checker` |
| LLM 판단 영역 | 이벤트 속성 완비 여부 판단 |

### 3.5 스킬 목록

| 스킬명 | 역할 | 트리거 조건 |
|--------|------|-------------|
| `code-extractor` | IntentCard·SubProtocol·이벤트 정의 정규식/AST 추출 | dev-architect, analytics-planner 진입 시 |
| `diff-checker` | 스펙 vs 추출 현황 필드별 대조, discrepancy 항목 생성 | STEP 3 및 STEP 5 |
| `report-writer` | 심각도별 집계 검증, fix_guide.md 수량 정합 확인 | STEP 6 |

### 3.6 데이터 전달 방식

**파일 기반 전달** (모든 단계)

```
각 단계 완료 → /output/에 중간 산출물 저장 → 다음 에이전트에 파일 경로만 전달
```

- `intent_cards.json`, `subprotocols.json`은 불변 중간 산출물 — 덮어쓰기 금지
- `discrepancies.json`은 STEP 3 생성 후 STEP 5에서 append 방식으로 항목 추가

### 3.7 주요 산출물 파일 형식

#### discrepancies.json

```json
{
  "run_id": "sync_20260227_001",
  "generated_at": "2026-02-27T00:00:00Z",
  "summary": {
    "CRITICAL": 1,
    "ERROR": 4,
    "WARNING": 2,
    "INFO": 0
  },
  "items": [
    {
      "id": "dc_001",
      "severity": "CRITICAL",
      "category": "safety",
      "field": "safety_gate_connected",
      "intent_id": "hangover_relief",
      "source_file": "app/(tabs)/index.tsx",
      "source_line": null,
      "current_value": false,
      "expected_value": true,
      "description": "숙취 해소 Intent에 SafetyWarning 트리거가 연결되지 않았습니다. PRD §20.4 기준 P1_SAFETY 강제 적용 대상입니다.",
      "reference": "PRD §20.4, WIREFRAME W05"
    }
  ]
}
```

#### intent_cards.json (코드 추출 현황)

```json
{
  "extracted_at": "2026-02-27T00:00:00Z",
  "source_files": ["app/(tabs)/index.tsx", "src/engine/..."],
  "intents": [
    {
      "intent_id": "muscle_relief",
      "title": "근육 이완",
      "icon": "🌿",
      "color_token": "CATEGORY_CARD_COLORS.muscle",
      "subtitles": {
        "bathtub": "피로한 근육을 풀어드려요",
        "shower": null,
        "partial_bath": "하체 중심으로 이완해요"
      },
      "subprotocol_ids": ["muscle_full", "muscle_lower"],
      "safety_gate_connected": true,
      "disabled_environments": []
    }
  ]
}
```

---

## 4. 오픈 이슈 (구현 전 확인 필요)

| 번호 | 이슈 | 영향 범위 |
|------|------|-----------|
| 1 | IntentCard 정의가 단일 파일인지 분산인지 확인 필요 — `src/engine/` 내부 구조 탐색 후 `scan_targets.json` 초기값 결정 | STEP 2 전체 |
| 2 | PRD/Wireframe 문서 내 IntentCard 정의가 분산·암묵적일 경우 STEP 0 저신뢰 항목 과다 발생 가능 — 저신뢰 임계값(20%) 조정 필요할 수 있음 | STEP 0 |
| 3 | `discrepancies.json` STEP 5 append 시 run_id 충돌 방지 방식 확정 필요 | STEP 5 |
| 4 | 불일치 0건일 때 fix_guide.md 생성 여부 — "이상 없음" 문서 생성 vs 스킵 | STEP 6 |

---

*설계서 v0.2 — STEP 0 자동 추출 방식 확정 반영 (2026-02-27)*
