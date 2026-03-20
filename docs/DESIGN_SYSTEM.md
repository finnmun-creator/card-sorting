# 카드 소팅 앱 디자인 시스템

> 이 문서는 card-sorting 앱에서 실제로 사용 중인 디자인 토큰, 컴포넌트 패턴, 레이아웃 규칙을 기술합니다.

---

## 목차

1. [디자인 토큰](#1-디자인-토큰)
2. [컴포넌트 패턴](#2-컴포넌트-패턴)
3. [타이포그래피](#3-타이포그래피)
4. [애니메이션](#4-애니메이션)
5. [아이콘](#5-아이콘)
6. [레이아웃](#6-레이아웃)
7. [상태별 스타일](#7-상태별-스타일)
8. [아키텍처 패턴](#8-아키텍처-패턴)

---

## 1. 디자인 토큰

토큰은 `globals.css`의 CSS 커스텀 프로퍼티로 정의되어 있습니다.

### 1.1 배경 (Background)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--bg-canvas` | `#F5F5F5` | 페이지 전체 배경 |
| `--bg-surface` | `#FFFFFF` | 카드, 모달, 패널 |
| `--bg-surface-hover` | `#FAFAFA` | 호버 상태 표면 |
| `--bg-muted` | `#E8E8E8` | 이미지 플레이스홀더 |

### 1.2 텍스트 (Text)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--text-primary` | `#1A1A1A` | 주요 본문 텍스트 |
| `--text-secondary` | `#6B6B6B` | 보조 텍스트 |
| `--text-tertiary` | `#9B9B9B` | 힌트, 라벨, 메타 정보 |

### 1.3 테두리 (Border)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--border-default` | `#E0E0E0` | 기본 테두리 |
| `--border-hover` | `#C0C0C0` | 호버 시 테두리 |
| `--border-active` | `#4A90D9` | 포커스/활성 테두리 |

### 1.4 액센트 (Accent)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--accent-primary` | `#4A90D9` | 주요 액션, 포커스 인디케이터 |
| `--accent-primary-hover` | `#3A7BC8` | 액센트 호버 상태 |

### 1.5 티어 색상 (Tier Colors)

티어 배경색은 두 가지 소스에서 정의됩니다.

**CSS 변수 (연한 파스텔 — UI 배경용)**

| 토큰 | 값 |
|------|----|
| `--tier-s` | `#E8D5D5` |
| `--tier-a` | `#E8DDD5` |
| `--tier-b` | `#E8E4D5` |
| `--tier-c` | `#E0E8D5` |
| `--tier-d` | `#D5DEE8` |
| `--tier-f` | `#DDD5E8` |

**`db.ts` 기본값 (채도 높은 색상 — 신규 티어 생성 기본값)**

| 티어 | 값 |
|------|----|
| S | `#FF7F7F` |
| A | `#FFBF7F` |
| B | `#FFDF7F` |
| C | `#FFFF7F` |
| D | `#7FBFFF` |
| F | `#FF7FBF` |

> 참고: CSS 변수 값은 UI 레이아웃의 배경 목적으로 사용되며, `db.ts` 값은 새로운 티어 행 생성 시 초기값으로 할당됩니다.

### 1.6 메모 카드 색상 (Memo Colors)

| 토큰 | 값 | 비고 |
|------|----|------|
| `--memo-yellow` | `#FFF9C4` | 현재 기본값 |
| `--memo-green` | `#E8F5E9` | |
| `--memo-blue` | `#E3F2FD` | |
| `--memo-pink` | `#FCE4EC` | |
| `--memo-purple` | `#F3E5F5` | |

### 1.7 그림자 (Shadow)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)` | 미세 깊이감 |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.08)` | 카드 호버 |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.12)` | 드래그, 모달 |

### 1.8 라운딩 (Border Radius)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--radius-sm` | `4px` | 작은 배지, 태그 |
| `--radius-md` | `6px` | 버튼, 입력 필드 |
| `--radius-lg` | `8px` | 카드, 모달 |

---

## 2. 컴포넌트 패턴

### 2.1 버튼 (Button)

**Primary 버튼**

```
배경: var(--accent-primary)
호버: var(--accent-primary-hover)
텍스트: white
border-radius: var(--radius-md)
font-weight: medium
```

```html
<!-- Tailwind 예시 -->
<button class="bg-[#4A90D9] hover:bg-[#3A7BC8] text-white rounded-md font-medium px-4 py-2">
  확인
</button>
```

**Ghost 버튼**

```
배경: white
테두리: var(--border-default), 호버 시 var(--border-hover)
텍스트: var(--text-secondary), 호버 시 var(--text-primary)
높이: h-9 (36px)
패딩: px-3
```

```html
<button class="bg-white border border-[#E0E0E0] hover:border-[#C0C0C0] text-[#6B6B6B] hover:text-[#1A1A1A] h-9 px-3 rounded-md text-sm">
  취소
</button>
```

**Danger 버튼 (텍스트 버튼)**

```
텍스트: text-red-400, 호버 시 text-red-500
배경 없음
```

**Warning 버튼 (비밀번호 관련)**

```
배경: bg-orange-500, 호버 시 bg-orange-600
텍스트: white
```

**비활성 상태 공통**

```
disabled:opacity-50
```

---

### 2.2 입력 필드 (Input)

```
배경: var(--bg-canvas)
테두리: var(--border-default)
포커스 테두리: var(--border-active)
border-radius: var(--radius-md)
패딩: px-3 py-2
폰트 크기: text-sm
outline: none
```

```html
<input class="bg-[#F5F5F5] border border-[#E0E0E0] rounded-md px-3 py-2 text-sm focus:border-[#4A90D9] outline-none" />
```

---

### 2.3 모달 (Modal)

**오버레이**

```
position: fixed inset-0
배경: rgba(0,0,0,0.4)
레이아웃: flex items-center justify-center
z-index: z-50
```

**콘텐츠 영역**

```
배경: white
border-radius: var(--radius-lg)
그림자: var(--shadow-lg)
패딩: p-6
너비: w-full
최대 너비: max-w-sm (기본) / max-w-md (카드 상세)
```

```html
<!-- 오버레이 + 콘텐츠 구조 -->
<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
    <!-- 내용 -->
  </div>
</div>
```

---

### 2.4 카드 아이템 (Card Item)

| 속성 | 메모 모드 | 이미지 모드 |
|------|-----------|-------------|
| 너비 | `w-[130px]` | `w-[130px]` |
| 높이 | `h-[115px]` | 가변 |
| 배경 | `#FFF9C4` (기본 메모 색상) | `var(--bg-surface)` |
| 패딩 | `p-2.5` | — |
| border-radius | `var(--radius-md)` | `var(--radius-md)` |
| 이미지 높이 | — | `h-[85px]` |
| 이미지 배경 | — | `var(--bg-muted)` |

**드래그 중 상태**

```
opacity: 0.4
그림자: var(--shadow-lg)
scale: 1.02
```

**호버 상태**

```
그림자: var(--shadow-md)
```

---

### 2.5 티어 행 (Tier Row)

**라벨 영역**

```
너비: w-20 (80px)
border-radius: rounded-l-md (왼쪽만)
배경색: tier.color (각 티어의 커스텀 색상)
```

**드롭 존**

```
레이아웃: flex flex-wrap gap-2
패딩: p-2.5
최소 높이: min-h-[130px]
```

**드롭 활성 상태**

```
테두리: var(--border-active)
배경: rgba(59, 130, 246, 0.05) (blue-50/50)
```

---

### 2.6 참여자 아바타 (Participant Avatar)

**헤더 표시**

```
크기: w-8 h-8 (32px × 32px)
형태: rounded-full
배경: var(--accent-primary)
텍스트: white, text-[11px]
테두리: border-2 border-white
겹침: -space-x-2 (음수 마진으로 아바타 겹침 처리)
```

**리스트 표시**

```
크기: w-5 h-5 (20px × 20px)
형태: rounded-full
텍스트: text-[8px]
```

**참여자 드롭다운 — 접속 중 vs 과거 참여 이력 구분**

```
접속 중 사용자:
  아바타 배경: bg-accent-primary (bg-[#4A90D9])
  상태 점: w-1.5 h-1.5 rounded-full bg-green-400 (오른쪽 하단 절대 위치)

오프라인 과거 참여자:
  아바타 배경: bg-muted (bg-[#E8E8E8])
  텍스트 색상: text-tertiary (text-[#9B9B9B])
  상태 점 없음
```

---

### 2.7 세그먼트 토글 (Segment Toggle)

```
컨테이너: 공유 border, rounded
활성 탭: bg-[#4A90D9] text-white
비활성 탭: bg-white text-[#6B6B6B]
```

---

### 2.8 섹션 헤더 (Section Header)

```
폰트 크기: text-xs
폰트 굵기: font-medium
색상: var(--text-tertiary)
변환: uppercase
자간: tracking-wide
```

```html
<h3 class="text-xs font-medium text-[#9B9B9B] uppercase tracking-wide">
  섹션 제목
</h3>
```

### 2.9 삭제 확인 — 잠긴 프로젝트 (Locked Project Delete Confirm)

비밀번호가 설정된 프로젝트 삭제 시 인라인 비밀번호 확인 UI가 표시됩니다.

```
입력 필드: 인라인 password input (type="password")
삭제 버튼: bg-red-500 hover:bg-red-600 text-white rounded-md
오류 상태: animate-shake + border-red-400 (입력 필드에 적용)
```

```html
<!-- 잠긴 프로젝트 삭제 확인 구조 -->
<div class="flex gap-2">
  <input type="password"
    class="bg-[#F5F5F5] border border-[#E0E0E0] rounded-md px-3 py-2 text-sm focus:border-[#4A90D9] outline-none [&.error]:border-red-400 [&.error]:animate-shake" />
  <button class="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-2 text-sm">
    삭제
  </button>
</div>
```

---

### 2.10 보드 헤더 프로젝트 정보 (Board Header Project Info)

보드 헤더에 프로젝트 제목과 목적이 파이프 구분자로 인라인 표시됩니다.

```
제목: text-sm font-semibold text-primary
구분자: text-border-default (text-[#E0E0E0]) — " | " 문자
목적: text-sm text-secondary (text-[#6B6B6B])
```

```html
<span class="text-sm font-semibold text-[#1A1A1A]">프로젝트 제목</span>
<span class="text-[#E0E0E0] mx-1">|</span>
<span class="text-sm text-[#6B6B6B]">프로젝트 목적</span>
```

---

## 3. 타이포그래피

기본 폰트는 Tailwind CSS 기본 system font stack을 따릅니다.

| 요소 | 클래스 | 비고 |
|------|--------|------|
| 페이지 타이틀 | `text-2xl font-semibold` | 홈 화면 제목 |
| 보드 로고 | `text-lg font-semibold` | 헤더 앱 이름 |
| 프로젝트 제목 (보드) | `text-sm font-semibold` | |
| 카드 제목 | `text-xs font-semibold` | |
| 카드 설명 | `text-[11px]` | 11px 커스텀 크기 |
| 라벨 / 메타 | `text-xs` + `text-[#9B9B9B]` | 보조 정보 |

---

## 4. 애니메이션

### 4.1 shake (비밀번호 오류)

비밀번호 입력 오류 시 입력 필드에 적용되는 흔들림 효과입니다.

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}

.shake {
  animation: shake 0.4s ease-in-out;
}
```

### 4.2 드래그 피드백

| 상태 | 스타일 |
|------|--------|
| 드래그 중 | `scale-[1.02]` + `opacity-40` |
| 드롭 가능 영역 활성 | `border-[#4A90D9]` + `bg-blue-50/50` |

### 4.3 호버 전환

Tailwind 기본 `transition` 유틸리티를 사용합니다 (`transition-all` 또는 개별 속성).

---

## 5. 아이콘

- **스타일:** SVG inline, heroicons 스타일의 stroke 기반
- **잠금 아이콘:** fill 기반, `viewBox="0 0 20 20"`

**앱 아이콘 (파비콘/로고)**

```
배경: 그라디언트 (#FF6B9D → #FFC857)
내부 요소: 흰색 티어 바 표현
형태: rounded (앱 아이콘 형태)
```

---

## 6. 레이아웃

### 6.1 페이지별 최대 너비

| 페이지 | 레이아웃 클래스 |
|--------|----------------|
| 홈 | `max-w-2xl mx-auto py-12 px-4` |
| 보드 | `max-w-6xl mx-auto py-6 px-4` |

### 6.2 모달 최대 너비

| 모달 종류 | 최대 너비 |
|-----------|-----------|
| 닉네임 입력 | `max-w-sm` |
| 비밀번호 입력 | `max-w-sm` |
| 카드 상세 | `max-w-md` |

---

## 7. 상태별 스타일

| 상태 | 스타일 |
|------|--------|
| 로딩 | `text-center py-20 text-[#9B9B9B] text-sm` |
| 에러 | `text-center py-20 text-red-400 text-sm` |
| 빈 상태 (미분류 영역) | `text-[#9B9B9B] text-xs m-auto` |
| 버튼 중복 방지 (creating/adding) | `disabled:opacity-50` + `creating`/`adding` boolean state 가드 — 버튼을 `disabled` 처리하여 연타 방지 |
| 비밀번호 오류 (삭제 확인) | `animate-shake` + `border-red-400` (입력 필드에 적용) |

---

## 8. 아키텍처 패턴

### 8.1 Proxy (미들웨어) — 봇 감지 및 OG 메타 제공

```
파일: src/proxy.ts (또는 src/middleware.ts)

흐름:
  요청 수신
  → User-Agent가 봇/크롤러인지 판별
      (예: Slackbot, Kakaotalk, Twitterbot, facebookexternalhit 등)
  → 봇인 경우: /api/og/[code] 로 내부 리라이트
      → 정적 HTML + OG 메타태그 응답 (프로젝트 제목/설명 포함)
  → 일반 사용자인 경우: 그대로 통과 (SPA 렌더링)
```

```ts
// 봇 판별 예시
const BOT_UA = /slackbot|kakaotalk|twitterbot|facebookexternalhit|linkedinbot|googlebot/i;
const isBot = BOT_UA.test(request.headers.get('user-agent') ?? '');
if (isBot) {
  return NextResponse.rewrite(new URL(`/api/og/${code}`, request.url));
}
```

---

## 부록: 토큰 참조 요약

```css
/* globals.css 핵심 토큰 */
:root {
  /* 배경 */
  --bg-canvas:         #F5F5F5;
  --bg-surface:        #FFFFFF;
  --bg-surface-hover:  #FAFAFA;
  --bg-muted:          #E8E8E8;

  /* 텍스트 */
  --text-primary:      #1A1A1A;
  --text-secondary:    #6B6B6B;
  --text-tertiary:     #9B9B9B;

  /* 테두리 */
  --border-default:    #E0E0E0;
  --border-hover:      #C0C0C0;
  --border-active:     #4A90D9;

  /* 액센트 */
  --accent-primary:       #4A90D9;
  --accent-primary-hover: #3A7BC8;

  /* 티어 */
  --tier-s: #E8D5D5;
  --tier-a: #E8DDD5;
  --tier-b: #E8E4D5;
  --tier-c: #E0E8D5;
  --tier-d: #D5DEE8;
  --tier-f: #DDD5E8;

  /* 메모 */
  --memo-yellow: #FFF9C4;
  --memo-green:  #E8F5E9;
  --memo-blue:   #E3F2FD;
  --memo-pink:   #FCE4EC;
  --memo-purple: #F3E5F5;

  /* 그림자 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);

  /* 라운딩 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```
