# GNB 재설계 (3탭 → 5탭) Design Document

> **Summary**: Plan 문서(gnb-redesign.plan.md) 기반 5탭 GNB 아키텍처 설계. 라우터 구조, 컴포넌트 인터페이스, 네비게이션 플로우, 데이터 플로우, 마이그레이션 전략을 포함한다.
>
> **Project**: Bath Sommelier
> **Version**: v3.11.0 → v3.12.0
> **Author**: Frontend Architect
> **Date**: 2026-02-27
> **Status**: Draft
> **Plan 참조**: `docs/01-plan/features/gnb-redesign.plan.md`

---

## 1. 개요

### 1.1 Plan 문서 참조 요약

Plan 문서에서 결정된 핵심 방향:

- 기존 3탭(Home / 기록 / 설정) → 5탭(Home / Care / Trip / Product / My)
- 각 엔진(CareEngine, TripEngine, ProductHub)에 독립 탭 직접 진입점 부여
- History + Settings를 My 탭 하나로 통합 (내부 pill 서브탭 전환)
- **Home 탭은 기존 그대로 유지** (변경 없음)
- `app/(tabs)/` 라우팅 레이어만 변경. `src/engine/`, `src/storage/` 불변
- FontAwesome 기존 아이콘만 사용, 새 라이브러리 설치 금지

### 1.2 설계 목표 및 원칙

| 목표 | 설계 원칙 |
|------|----------|
| 5탭 GNB P0 즉시 구현 가능 | 최소 변경: 기존 로직을 새 탭 파일로 이식 |
| 기존 루틴 실행 플로우 회귀 없음 | `/result/*` 경로 유지. 탭 독립적 진입 |
| TypeScript strict 준수 | 모든 Props 인터페이스 명시. `any` 사용 금지 |
| 디자인 토큰 100% 준수 | `src/data/colors.ts` 토큰만 사용, 하드코딩 0 |
| 컴포넌트 재사용 극대화 | CategoryCard, SubProtocolPickerModal 등 기존 컴포넌트 그대로 사용 |

---

## 2. 아키텍처 설계

### 2.1 라우터 구조 (Expo Router)

#### 현재 구조 (v3.11.0)

```
app/
  (tabs)/
    _layout.tsx        ← 3탭 (index / history / settings)
    index.tsx          ← Home (Care + Trip 카드 + 최근 루틴)
    history.tsx        ← 기록 탭
    settings.tsx       ← 설정 탭
  result/
    recipe/[id].tsx
    timer/[id].tsx
    completion/[id].tsx
  onboarding/
    index.tsx
    ...
```

#### 변경 후 구조 (v3.12.0 목표)

```
app/
  (tabs)/
    _layout.tsx        ← 수정: 5탭으로 확장
    index.tsx          ← Home (변경 없음 — 기존 그대로 유지)
    care.tsx           ← Care 탭 (신규: IntentCard 8종 + 환경 pill)
    trip.tsx           ← Trip 탭 (신규: 테마 카드 그리드)
    product.tsx        ← Product 탭 (신규: ProductHub 컬렉션)
    my.tsx             ← My 탭 (신규: 기록 + 설정 통합)
    history.tsx        ← 보관: redirect → /(tabs)/my 처리 후 삭제 예정
    settings.tsx       ← 보관: redirect → /(tabs)/my 처리 후 삭제 예정
  result/              ← 변경 없음 (탭과 무관하게 동작)
    recipe/[id].tsx
    timer/[id].tsx
    completion/[id].tsx
  onboarding/          ← 변경 없음
    index.tsx
    ...
```

**설계 결정 이유:**
- `result/` 경로를 탭 하위로 이동하지 않는다. 어느 탭에서 시작하든 동일한 `/result/recipe/[id]` 경로를 push하므로 딥링크 호환성이 유지된다.
- My 탭은 중첩 라우팅 없이 단일 `my.tsx` 파일 내 `useState`로 서브탭(기록/설정) 전환한다. Expo Router 중첩 탭 불필요.
- `history.tsx` / `settings.tsx`는 P0 단계에서 `router.replace('/(tabs)/my')` 리다이렉트를 삽입하고, P0 완료 후 삭제한다.

### 2.2 탭 레이아웃 설계 (`app/(tabs)/_layout.tsx`)

#### 5탭 TabBar 구성

| 탭 | name | title | FontAwesome 아이콘 | 비고 |
|----|------|-------|-------------------|------|
| Home | `index` | `홈` | `home` | 현재 `tint` → `home`으로 변경 |
| Care | `care` | `케어` | `heartbeat` | 신규 |
| Trip | `trip` | `트립` | `map-o` | 신규 |
| Product | `product` | `제품` | `shopping-bag` | 신규 |
| My | `my` | `마이` | `user` | 신규 |

**5탭 아이콘 크기**: `size={22}` (현재 `size={24}` → 탭바 공간 확보 위해 축소)

#### 코드 스니펫

```typescript
// app/(tabs)/_layout.tsx
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { ACCENT, APP_BG_BASE, CARD_BORDER, TEXT_PRIMARY, TEXT_SECONDARY } from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: TEXT_SECONDARY,
        tabBarStyle: ui.tabBarStyle,
        headerStyle: {
          backgroundColor: APP_BG_BASE,
          borderBottomColor: CARD_BORDER,
          borderBottomWidth: 1,
        },
        headerTintColor: TEXT_PRIMARY,
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 1,
        },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: '케어',
          tabBarIcon: ({ color }) => <TabBarIcon name="heartbeat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: '트립',
          tabBarIcon: ({ color }) => <TabBarIcon name="map-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          title: '제품',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '마이',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

**주의**: `history` / `settings` Screen은 파일이 존재하는 동안 Expo Router가 자동 인식하므로, `_layout.tsx`에서 명시적 `<Tabs.Screen>` 선언을 추가하지 않으면 탭바에는 노출되지 않는다. 해당 파일이 삭제될 때까지 별도 Screen 등록 없이 리다이렉트만 처리한다.

### 2.3 각 탭 스크린 설계

#### Home 탭 (`app/(tabs)/index.tsx`) — 변경 없음

> **결정 (2026-02-27)**: Home 탭은 기존 구조를 그대로 유지한다. Care/Trip 카드 그리드, 환경 선택, 최근 루틴 등 모든 기존 기능 그대로. 슬림화 불필요.

**변경 사항 없음.** `index.tsx` 파일은 수정하지 않는다.

---

#### Care 탭 (`app/(tabs)/care.tsx`) — 신규

**변경 방향**: 기존 Home 탭의 Care 섹션 로직 전체 이식. 미구현 4종은 P1에서 알고리즘 연결, P0에서는 `disabled` 카드로 표시.

**전체 구조**:
```
CareScreen
  ├── ScrollView
  │     ├── Header (헤더 텍스트)
  │     ├── 환경 선택 pill row
  │     ├── IntentCard 2열 그리드 (8종 — 4종 활성 + 4종 disabled placeholder)
  │     └── PersistentDisclosure
  ├── SubProtocolPickerModal (Modal, 오버레이)
  └── SafetyWarning (Modal, 오버레이)
```

**P0 Care 탭 상태**: 기존 Home에서 이식
```typescript
const [environment, setEnvironment] = useState<BathEnvironment>('bathtub');
const [subModalVisible, setSubModalVisible] = useState(false);
const [selectedIntent, setSelectedIntent] = useState<IntentCard | null>(null);
const [warningVisible, setWarningVisible] = useState(false);
const [pendingWarnings, setPendingWarnings] = useState<string[]>([]);
const [pendingRecId, setPendingRecId] = useState<string | null>(null);
```

**P0 placeholder 카드 4종** (Care 탭 `CARE_INTENT_CARDS` 임시 확장):
```typescript
// P0: disabled placeholder로 렌더링. P1에서 실제 알고리즘 연결
const CARE_PLACEHOLDER_CARDS: IntentCard[] = [
  {
    id: 'care_cold_relief',
    domain: 'care',
    intent_id: 'cold_relief',
    mapped_mode: 'recovery',
    allowed_environments: [],          // 비어있으면 disabled 처리됨
    copy_title: '감기 기운이 느껴질 때',
    copy_subtitle_by_environment: {},
    default_subprotocol_id: '',
    card_position: 5,
  },
  // ... menstrual_relief (6), stress_relief (7), mood_lift (8)
];
```

**CATEGORY_CARD_COLORS / EMOJI 추가 필요** (P1 시 `src/data/colors.ts`에 추가):
```typescript
// src/data/colors.ts에 추가 예정 (P1)
cold_relief:       '#B8D8E8',   // 차가운 연파랑
menstrual_relief:  '#E8C5D0',   // 따뜻한 핑크
stress_relief:     '#C8D8C0',   // 연한 그린
mood_lift:         '#F0E0B0',   // 따뜻한 옐로우

// CATEGORY_CARD_EMOJI
cold_relief:       '🤧',
menstrual_relief:  '🌸',
stress_relief:     '😮‍💨',
mood_lift:         '☀️',
```

---

#### Trip 탭 (`app/(tabs)/trip.tsx`) — 신규

**변경 방향**: 기존 Home 탭의 Trip 섹션 로직 전체 이식.

**전체 구조**:
```
TripScreen
  ├── ScrollView
  │     ├── Header ("어디로 떠나볼까요?" + narrative)
  │     ├── 환경 선택 pill row (욕조 / 샤워)
  │     │     ← bathtub: Trip Deep, shower: Trip Lite 배지 연동
  │     ├── Trip 테마 카드 그리드 (2열, TRIP_INTENT_CARDS)
  │     │     ← 각 카드에 Lite/Deep 배지 자동 표시 (P1)
  │     ├── Narrative Recall Card (최근 Trip 기억, P1)
  │     └── PersistentDisclosure
  ├── SubProtocolPickerModal
  └── SafetyWarning
```

**환경 제한**: Trip 탭에서는 `bathtub` / `shower` 만 허용 (Trip 루틴 특성상 부분입욕 미지원).
```typescript
const TRIP_ENV_OPTIONS = [
  { id: 'bathtub' as BathEnvironment, emoji: '🛁', label: '욕조 (Deep)' },
  { id: 'shower'  as BathEnvironment, emoji: '🚿', label: '샤워 (Lite)' },
];
```

---

#### Product 탭 (`app/(tabs)/product.tsx`) — 신규 (P1)

**P0 상태**: 빈 화면 + "준비 중" 텍스트만 표시 (타입 오류 없이 빌드 통과)
```typescript
export default function ProductScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.comingSoon}>제품 큐레이션을 준비 중이에요</Text>
    </View>
  );
}
```

**P1 전체 구조**:
```
ProductScreen
  ├── ScrollView
  │     ├── Header ("오늘의 루틴에 맞는 제품")
  │     ├── Mode-based Collection
  │     │     ← Sleep / Reset / Recovery 모드별 가로 스크롤 카드
  │     ├── Sommelier Pick 섹션
  │     │     ← 추천 상위 3종 하이라이트
  │     └── PersistentDisclosure
  └── ProductMatchingModal (기존 컴포넌트 재활용)
```

**Mock 데이터 위치**: `src/data/mockProducts.ts` (P1 신규 생성)

---

#### My 탭 (`app/(tabs)/my.tsx`) — 신규

**변경 방향**: `app/(tabs)/history.tsx`와 `app/(tabs)/settings.tsx` 로직을 단일 파일로 통합. 상단 pill로 서브탭 전환.

**전체 구조**:
```
MyScreen
  ├── 상단 서브탭 pill (기록 | 설정)
  │     ← useState<'history' | 'settings'> activeTab
  ├── [activeTab === 'history'] HistorySection
  │     ← history.tsx 로직 그대로 이식
  │     ← useFocusEffect → loadHistory, loadTripMemoryHistory, loadThemePreferenceWeights
  │     ├── 인사이트 배너
  │     ├── 필터 pill (전체 / 케어 / 트립)
  │     └── FlatList 2열 그리드
  └── [activeTab === 'settings'] SettingsSection
        ← settings.tsx 로직 그대로 이식
        ├── 환경 선택
        ├── 건강 상태 선택
        ├── 프로필 재설정
        └── 앱 정보 + PersistentDisclosure
```

**서브탭 전환 코드 패턴**:
```typescript
type MyTab = 'history' | 'settings';

export default function MyScreen() {
  const [activeTab, setActiveTab] = useState<MyTab>('history');

  return (
    <View style={ui.screenShell}>
      {/* 서브탭 pill */}
      <View style={styles.subTabRow}>
        {(['history', 'settings'] as MyTab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[ui.pillButton, activeTab === tab && ui.pillButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.subTabText}>
              {tab === 'history' ? '기록' : '설정'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'history' ? <HistorySection /> : <SettingsSection />}
    </View>
  );
}
```

**HistorySection / SettingsSection 분리 방법**: 같은 파일(`my.tsx`) 내 별도 함수 컴포넌트로 선언. 파일 크기가 너무 클 경우 `src/components/my/HistorySection.tsx`, `src/components/my/SettingsSection.tsx`로 추출 가능 (P1 리팩토링 옵션).

---

## 3. 컴포넌트 설계

### 3.1 신규 컴포넌트 목록

#### P0 범위 신규 컴포넌트

P0에서는 신규 독립 컴포넌트를 최소화하고 기존 컴포넌트를 재사용한다. 탭 파일 내에서 inline 구현한다.

> **Home 탭 변경 없음**: `QuickActionButton` 등 Home 탭 전용 신규 컴포넌트는 불필요.

#### P1 범위 신규 컴포넌트

**`src/components/trip/NarrativeRecallCard.tsx`** — Trip 최근 기억 카드

```typescript
interface NarrativeRecallCardProps {
  themeTitle: string;
  narrativeText: string;
  completedAt: string;       // ISO date string
  colorHex: string;
  onPress: () => void;
}

export function NarrativeRecallCard({
  themeTitle,
  narrativeText,
  completedAt,
  colorHex,
  onPress,
}: NarrativeRecallCardProps) { ... }
```

**`src/components/product/ProductCard.tsx`** — Product 탭 제품 카드

```typescript
interface ProductCardProps {
  id: string;
  name: string;
  slotRole: 'efficacy' | 'sensory' | 'value';   // 기전/감성/가성비
  isSommelierPick: boolean;
  colorHex: string;
  onPress: () => void;
}

export function ProductCard({
  id,
  name,
  slotRole,
  isSommelierPick,
  colorHex,
  onPress,
}: ProductCardProps) { ... }
```

**`src/data/mockProducts.ts`** — Product 탭 Mock 데이터

```typescript
export interface MockProduct {
  id: string;
  name: string;
  mode: 'sleep' | 'reset' | 'recovery';
  slotRole: 'efficacy' | 'sensory' | 'value';
  isSommelierPick: boolean;
  colorHex: string;
  description: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod_01',
    name: '라벤더 바스 솔트',
    mode: 'sleep',
    slotRole: 'efficacy',
    isSommelierPick: true,
    colorHex: '#C5BEED',
    description: '수면 준비에 최적화된 라벤더 에센셜 오일 배합',
  },
  // ... 추가 Mock 데이터
];
```

### 3.2 기존 컴포넌트 재사용 전략

| 컴포넌트 | 현재 위치 | Care 탭 | Trip 탭 | Product 탭 | My 탭 |
|---------|---------|---------|---------|-----------|-------|
| `CategoryCard` | `src/components/` | 재사용 (Intent 카드) | 재사용 (Trip 테마 카드) | — | — |
| `SubProtocolPickerModal` | `src/components/` | 재사용 | 재사용 | — | — |
| `SafetyWarning` | `src/components/` | 재사용 | 재사용 | — | — |
| `PersistentDisclosure` | `src/components/` | 재사용 | 재사용 | 재사용 | 재사용 |
| `ProductMatchingModal` | `src/components/` | — | — | 재사용 (P1) | — |
| `PersonaCard` | `src/components/` | — | — | — | 재사용 (P2) |

---

## 4. 네비게이션 플로우

### 4.1 Home 탭 플로우

> **변경 없음**: 기존 플로우 그대로. Care/Trip 탭이 신설되더라도 Home 탭의 동작은 변경하지 않는다.

```
Home 탭 (index.tsx) — 기존 그대로
  ├── 환경 선택 → 상태 저장
  ├── Care/Trip 카드 그리드 → 기존 루틴 실행 플로우
  └── 최근 루틴 → router.push('/result/recipe/[id]')
```

### 4.2 Care 탭 플로우

```
Care 탭 (care.tsx)
  ├── 환경 선택 pill → 상태 변경
  ├── IntentCard 탭 (활성 카드)
  │     → SubProtocolPickerModal 열림
  │           → SubProtocol 선택
  │                 → generateCareRecommendation() 실행
  │                       → 안전 경고 없음: router.push('/result/recipe/[id]')
  │                       → 안전 경고 있음: SafetyWarning 모달 → 확인 후 push
  ├── IntentCard 탭 (disabled 카드, P0)
  │     → 탭 무시 (disabled)
  └── /result/recipe/[id]
        → /result/timer/[id]
              → /result/completion/[id]
                    → router.replace('/(tabs)/care')  (Care 탭으로 복귀)
```

### 4.3 Trip 탭 플로우

```
Trip 탭 (trip.tsx)
  ├── 환경 선택 pill (욕조 Deep / 샤워 Lite)
  ├── 테마 카드 탭
  │     → SubProtocolPickerModal 열림 (Trip 서브프로토콜)
  │           → SubProtocol 선택
  │                 → generateTripRecommendation() 실행
  │                       → router.push('/result/recipe/[id]')
  └── /result/recipe/[id]
        → /result/timer/[id]
              → /result/completion/[id]
                    → router.replace('/(tabs)/trip')  (Trip 탭으로 복귀)
```

### 4.4 Product 탭 플로우 (P1)

```
Product 탭 (product.tsx)
  ├── 컬렉션 카드 탭
  │     → ProductMatchingModal 열림
  │           → "구매하기" → 외부 링크 (Linking.openURL)
  │           → "계속하기" → Modal 닫기
  └── (P2) 위시리스트 저장 → AsyncStorage (src/storage/wishlist.ts)
```

### 4.5 My 탭 플로우

```
My 탭 (my.tsx)
  ├── 서브탭 "기록" 선택 (기본)
  │     ├── 필터 pill 전환 (전체 / 케어 / 트립)
  │     └── 기록 카드 탭
  │           → router.push('/result/recipe/[id]?source=history')
  └── 서브탭 "설정" 선택
        ├── 환경 선택 변경 → update(profile)
        ├── 건강 상태 토글 → update(profile)
        └── "프로필 재설정" 탭
              → Alert 확인 → clearProfile() → router.replace('/onboarding')
```

### 4.6 기존 경로 리다이렉트 (마이그레이션)

```
app/(tabs)/history.tsx    ← useFocusEffect: router.replace('/(tabs)/my')
app/(tabs)/settings.tsx   ← useFocusEffect: router.replace('/(tabs)/my')
```

---

## 5. 데이터 플로우

### 5.1 탭 간 상태 공유

Bath Sommelier는 AsyncStorage 기반 단방향 저장이므로, 탭 간 공유 상태가 적다. React Context나 Zustand는 불필요.

| 데이터 | 저장소 | 탭간 공유 방법 |
|--------|--------|--------------|
| 사용자 프로필 (환경/건강) | AsyncStorage (`profile`) | `useUserProfile()` 훅 — 어느 탭에서나 독립 호출 |
| 마지막 선택 환경 | AsyncStorage (`lastEnvironment`) | `loadLastEnvironment()` 각 탭 mount 시 독립 로드 |
| 루틴 기록 | AsyncStorage (`history`) | My 탭에서 `useFocusEffect` 로 로드 |
| Trip 메모리 | AsyncStorage (`tripMemory`) | My 탭에서 `useFocusEffect` 로 로드 |

### 5.2 환경 선택 동기화 전략

Home / Care / Trip 탭 각각 환경 pill을 노출한다. 세 탭이 서로 다른 환경 값을 가질 수 있는데, 이는 의도된 설계다:

- 각 탭 mount 시 `loadLastEnvironment()`로 마지막 저장값을 로드
- 환경 변경 시 `saveLastEnvironment(next)` 호출 → 다른 탭이 다음 focus 시 반영
- Care 탭과 Trip 탭의 허용 환경이 다르므로 각자 독립적으로 관리하는 것이 적절

### 5.3 기존 훅 재사용 계획

| 훅 | 현재 사용처 | 재사용 탭 |
|----|-----------|---------|
| `useUserProfile()` | Home, Settings | Care, Trip, My(Settings 섹션) |
| `useHaptic()` | Home, Settings, Timer | Care, Trip, My |
| `loadHistory()` | History | My(기록 섹션) |
| `loadTripMemoryHistory()` | History | My(기록 섹션) |
| `loadThemePreferenceWeights()` | History | My(기록 섹션) |
| `loadLastEnvironment()` | Home | Care, Trip |
| `saveLastEnvironment()` | Home | Care, Trip |

---

## 6. 마이그레이션 전략

### 6.1 기존 `result/` 경로 딥링크 유지

`/result/recipe/[id]`, `/result/timer/[id]`, `/result/completion/[id]` 경로는 변경 없이 유지한다. 어느 탭에서 시작해도 동일한 경로를 push한다.

완료 화면(`completion/[id].tsx`)에서 "홈으로" 버튼의 navigate 목적지를 변경:
- 현재: `router.replace('/(tabs)')`
- 변경 후: Care에서 시작한 경우 → `router.replace('/(tabs)/care')`, Trip에서 시작한 경우 → `router.replace('/(tabs)/trip')`, Home에서 시작한 경우 → `router.replace('/(tabs)')`

**구현 방법**: route params에 `source` 추가
```typescript
// Care 탭에서 push 시
router.push(`/result/recipe/${recommendation.id}?source=care`);

// completion 화면에서
const { source } = useLocalSearchParams<{ source?: string }>();
const handleDone = () => {
  if (source === 'care') router.replace('/(tabs)/care');
  else if (source === 'trip') router.replace('/(tabs)/trip');
  else router.replace('/(tabs)');
};
```

### 6.2 `history.tsx` / `settings.tsx` 마이그레이션

**단계:**
1. `my.tsx` 구현 완료 확인
2. `history.tsx`에 리다이렉트 추가:
   ```typescript
   // app/(tabs)/history.tsx 상단에 추가
   import { Redirect } from 'expo-router';
   export default function HistoryRedirect() {
     return <Redirect href="/(tabs)/my" />;
   }
   ```
3. `settings.tsx`도 동일 처리
4. P0 완료 후 두 파일 삭제

### 6.3 단계별 마이그레이션 순서

```
Step 1. CLAUDE.md 탭 제약 문구 업데이트
        "Do not create new tab routes" → "탭 구조는 v3.12.0 기준 5탭(Home/Care/Trip/Product/My)"

Step 2. _layout.tsx 5탭으로 수정
        파일 저장 → Metro bundler 재시작 → 탭바 5개 확인

Step 3. care.tsx 신규 생성
        Home에서 Care 관련 로직 복사 → Care 탭에서 루틴 실행 플로우 테스트

Step 4. trip.tsx 신규 생성
        Home에서 Trip 관련 로직 복사 → Trip 탭에서 루틴 실행 플로우 테스트

Step 5. my.tsx 신규 생성
        history.tsx + settings.tsx 내용 통합 → My 탭 서브탭 전환 테스트

Step 6. history.tsx / settings.tsx 리다이렉트 처리 → 삭제

Step 7. product.tsx P0 플레이스홀더 생성

Step 8. npx tsc --noEmit 확인 + npx jest 49개 통과 확인
```

---

## 7. 구현 체크리스트

### P0 — GNB 전환 최소 기능

- [ ] `CLAUDE.md` 탭 제약 문구 업데이트 (`Do not create new tab routes` 제거)
- [ ] `app/(tabs)/_layout.tsx` 5탭 전환
  - [ ] `home` 아이콘으로 변경 (기존 `tint`)
  - [ ] Care / Trip / Product / My Screen 추가
  - [ ] 아이콘 size 24 → 22 조정
- [ ] `app/(tabs)/care.tsx` 신규 생성
  - [ ] Home에서 Care 섹션 로직 이식 (환경 pill + CategoryCard 그리드 + SubProtocolPickerModal + SafetyWarning)
  - [ ] CARE_INTENT_CARDS 4종 활성 + 4종 disabled placeholder 렌더링
  - [ ] PersistentDisclosure 하단 배치
  - [ ] 루틴 실행 플로우 (`/result/recipe/[id]`) 검증
- [ ] `app/(tabs)/trip.tsx` 신규 생성
  - [ ] Home에서 Trip 섹션 로직 이식 (환경 pill + CategoryCard 그리드 + SubProtocolPickerModal + SafetyWarning)
  - [ ] 환경 옵션을 bathtub/shower 2종으로 제한
  - [ ] PersistentDisclosure 하단 배치
  - [ ] 루틴 실행 플로우 검증
- [ ] `app/(tabs)/product.tsx` P0 플레이스홀더 생성
  - [ ] "제품 큐레이션을 준비 중이에요" 텍스트만 표시
  - [ ] TypeScript 오류 없이 빌드 통과
- [ ] `app/(tabs)/my.tsx` 신규 생성
  - [ ] 상단 pill 서브탭 전환 UI (기록 / 설정)
  - [ ] 기록 섹션: history.tsx 로직 그대로 이식
  - [ ] 설정 섹션: settings.tsx 로직 그대로 이식
  - [ ] useFocusEffect 기록 데이터 로드 정상 동작
- [ ] `app/(tabs)/index.tsx` — **변경 없음** (기존 그대로 유지)
- [ ] `app/(tabs)/history.tsx` 리다이렉트 처리
- [ ] `app/(tabs)/settings.tsx` 리다이렉트 처리
- [ ] `npx tsc --noEmit` 에러 0 확인
- [ ] `npx jest` 49개 전부 통과 확인
- [ ] PersistentDisclosure Care/Trip 탭에서 정상 노출 확인
- [ ] SafetyWarning Care 탭에서 고위험 조건 시 정상 트리거 확인

### P1 — 콘텐츠 보완

- [ ] Care 미구현 4종 `src/data/colors.ts`에 색상/이모지 토큰 추가
- [ ] Care 미구현 4종 `src/data/intents.ts`에 IntentCard 데이터 추가
- [ ] Care 미구현 4종 알고리즘 연결 (`src/engine/recommend.ts`)
- [ ] `src/data/mockProducts.ts` Mock 데이터 생성
- [ ] `app/(tabs)/product.tsx` 컬렉션 UI 구현 (`ProductCard` 컴포넌트 포함)
- [ ] `ProductMatchingModal` → Product 탭 진입점 연결
- [ ] `src/components/trip/NarrativeRecallCard.tsx` 구현
- [ ] Trip 탭 Lite/Deep 배지 표시

### P2 — 백로그

- [ ] `src/storage/wishlist.ts` + 위시리스트 UI
- [ ] My 탭 주간 인사이트 배너
- [ ] Trip Theme-based / Seasonal Pack (Product 탭)
- [ ] `history.tsx` / `settings.tsx` 파일 삭제 (리다이렉트 충분히 검증 후)

---

## 8. 디자인 토큰 사용 가이드

### 신규 탭 화면 공통 적용 규칙

모든 신규 탭 화면은 다음을 준수한다:

```typescript
// 배경
backgroundColor: APP_BG_BASE                    // #F6FAFF

// 카드/서피스
backgroundColor: CARD_SURFACE                   // rgba(255,255,255,0.82)
borderColor: CARD_BORDER                        // rgba(150,170,205,0.28)
shadowColor: CARD_SHADOW                        // rgba(39,62,102,0.12)

// 텍스트
color: TEXT_PRIMARY                             // #2A3E64
color: TEXT_SECONDARY                           // #617493
color: TEXT_MUTED                               // #8FA0BA

// 강조
color: ACCENT                                   // #7895CF
backgroundColor: ACCENT                         // 활성 pill, 버튼

// 타이포그래피
fontSize: TYPE_HEADING_MD (22)                  // 탭 헤더 제목
fontSize: TYPE_TITLE (18)                       // 섹션 제목
fontSize: TYPE_BODY (14)                        // 본문
fontSize: TYPE_CAPTION (12)                     // 보조 텍스트, 메타
```

### `ui.*` 공통 스타일 활용

```typescript
import { ui } from '@/src/theme/ui';

// 화면 컨테이너
<View style={ui.screenShell}>            // flex: 1, backgroundColor: APP_BG_BASE

// 카드 서피스
<View style={ui.glassCard}>             // glass-morphism 카드 스타일

// pill 버튼 (비활성)
<Pressable style={ui.pillButton}>

// pill 버튼 (활성)
<Pressable style={[ui.pillButton, ui.pillButtonActive]}>

// 탭바 스타일 (이미 _layout.tsx에서 사용 중)
tabBarStyle: ui.tabBarStyle
```

---

## Version History

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|---------|--------|
| 0.2 | 2026-02-27 | Home 탭 슬림화 전면 제외 — 기존 그대로 유지 결정 | 사용자 피드백 |
| 0.1 | 2026-02-27 | 초안 작성 — Plan 기반 아키텍처 설계 전체 | Frontend Architect |
