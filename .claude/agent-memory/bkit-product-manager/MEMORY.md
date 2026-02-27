# Product Manager Agent Memory — Bath Sommelier

## Project Basics
- App: Bath Sommelier (React Native / Expo SDK 54 / TypeScript)
- PRD: `docs/PRD_CURRENT.md` (v3.11.0 기준선, 2026-02-27)
- Wireframe: `docs/WIREFRAME_V3_11_0.md`
- Design system rules: `/CLAUDE.md`

## GNB 현황 (v3.11.0)
- 현재: 3탭 (Home / History / Settings)
- 탭 파일: `app/(tabs)/_layout.tsx`, `index.tsx`, `history.tsx`, `settings.tsx`
- CLAUDE.md에 "Do not create new tab routes — the three tabs are final" 제약 존재

## 완료된 Plan 문서
- `docs/01-plan/features/gnb-redesign.plan.md` — 3탭→5탭(Home/Care/Trip/Product/My) 재설계 (2026-02-27)

## 핵심 PRD 원칙 (플랜 작성 시 반드시 참조)
- Home은 엔진 결정자가 아닌 결과 표시 레이어 (PRD §4, §26)
- ProductHub는 supporting commerce layer — 홈 대체 진입점으로 승격 금지 (PRD §27)
- Trip은 Care의 서브모드가 아닌 독립 엔진 (PRD §25.1)
- 안전 필터는 모든 추천보다 절대 우선 (PRD §20.4)
- 카피 정책: 의료 효능 단정 문구 금지 (PRD §13)

## 기존 구현 현황 (계획 시 고려)
- Care IntentCard 8종 중 4종 구현 (muscle_relief, sleep_ready, hangover_relief, edema_relief)
- 미구현 4종: cold_relief, menstrual_relief, stress_relief, mood_lift
- ProductMatchingModal 컴포넌트 존재, 화면 미연결
- ProductHub 화면 미구현
- 오디오 파일 미번들 (placeholder 상태)
