# WoW 레이드 관리 시스템 — 프론트엔드 설계 문서

## 목차
1. [기술 스택](#기술-스택)
2. [폴더 구조](#폴더-구조)
3. [라우팅 구조](#라우팅-구조)
4. [API 통신 레이어](#api-통신-레이어)
5. [인증 상태 관리](#인증-상태-관리)
6. [주요 컴포넌트](#주요-컴포넌트)

---

## 기술 스택

| 역할 | 라이브러리 | 선택 이유 |
|------|-----------|----------|
| 번들러 | Vite | 빠른 개발 서버, HMR |
| UI 프레임워크 | React 18 + TypeScript | |
| 라우팅 | React Router v6 | 표준, 권한별 라우팅 구현 용이 |
| 서버 상태 | TanStack Query v5 | API 데이터 캐싱·로딩·에러 자동 처리 |
| 클라이언트 상태 | Zustand | 인증 상태 등 전역 상태, 보일러플레이트 없음 |
| API 클라이언트 | Axios | 인터셉터로 JWT 자동 주입, 에러 처리 편리 |
| UI | Tailwind CSS + shadcn/ui | 커스터마이징 자유도 높음, WoW 스타일 적용 용이 |
| 폼 | React Hook Form + Zod | 타입 안전한 폼 유효성 검사 |
| 날짜 | date-fns | 가볍고 tree-shakeable |
| 아이콘 | Lucide React | shadcn/ui 기본 세트 |

---

## 폴더 구조

```
wow-raid-frontend/
├── public/
├── src/
│   ├── api/                        # API 통신 레이어
│   │   ├── client.ts               # axios 인스턴스 + 인터셉터
│   │   ├── auth.api.ts
│   │   ├── raid.api.ts
│   │   ├── registration.api.ts
│   │   ├── guestRegistration.api.ts
│   │   ├── notification.api.ts
│   │   ├── post.api.ts
│   │   ├── user.api.ts
│   │   └── admin.api.ts
│   │
│   ├── types/                      # TypeScript 타입 정의
│   │   ├── enums.ts                # WowClass, RaidRole, Difficulty 등
│   │   ├── auth.types.ts
│   │   ├── raid.types.ts
│   │   ├── registration.types.ts
│   │   ├── notification.types.ts
│   │   ├── post.types.ts
│   │   └── common.types.ts         # ApiResponse<T>, Page<T>
│   │
│   ├── stores/                     # Zustand 전역 상태
│   │   └── auth.store.ts
│   │
│   ├── hooks/                      # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useSse.ts               # SSE 알림 구독
│   │   ├── useRaids.ts
│   │   ├── useRegistration.ts
│   │   └── useNotifications.ts
│   │
│   ├── components/                 # 재사용 컴포넌트
│   │   ├── common/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── raid/
│   │   │   ├── RaidCard.tsx
│   │   │   ├── RaidForm.tsx
│   │   │   ├── RaidStats.tsx
│   │   │   └── RegistrationList.tsx
│   │   ├── registration/
│   │   │   ├── MemberRegistrationForm.tsx
│   │   │   └── GuestRegistrationForm.tsx
│   │   ├── notification/
│   │   │   ├── NotificationBadge.tsx
│   │   │   └── NotificationDropdown.tsx
│   │   └── post/
│   │       ├── PostCard.tsx
│   │       └── PostForm.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── FindUsernamePage.tsx
│   │   ├── raid/
│   │   │   ├── RaidListPage.tsx
│   │   │   ├── RaidDetailPage.tsx
│   │   │   └── RaidFormPage.tsx
│   │   ├── user/
│   │   │   ├── MyPage.tsx
│   │   │   └── CharacterPage.tsx
│   │   ├── post/
│   │   │   ├── PostListPage.tsx
│   │   │   ├── PostDetailPage.tsx
│   │   │   └── PostFormPage.tsx
│   │   ├── notification/
│   │   │   └── NotificationPage.tsx
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       ├── AdminUserPage.tsx
│   │       ├── AdminRaidPage.tsx
│   │       └── AdminPostPage.tsx
│   │
│   ├── utils/
│   │   ├── wowClass.util.ts        # 직업명 한글 변환, 직업 색상
│   │   └── date.util.ts
│   │
│   ├── router/
│   │   └── index.tsx
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env.local
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 라우팅 구조

| 경로 | 페이지 | 권한 |
|------|--------|------|
| `/` | 레이드 목록 | 누구나 |
| `/login` | 로그인 | 비로그인만 |
| `/register` | 회원가입 | 비로그인만 |
| `/find-username` | 아이디 찾기 | 누구나 |
| `/raids/:id` | 레이드 상세 | 누구나 |
| `/raids/new` | 레이드 생성 | RAID_LEADER |
| `/raids/:id/edit` | 레이드 수정 | RAID_LEADER |
| `/posts` | 게시판 목록 | 누구나 |
| `/posts/:id` | 게시글 상세 | 누구나 |
| `/posts/new` | 게시글 작성 | 로그인 |
| `/posts/:id/edit` | 게시글 수정 | 로그인(본인) |
| `/my` | 내 정보 | 로그인 |
| `/my/characters` | 캐릭터 관리 | 로그인 |
| `/notifications` | 알림 목록 | 로그인 |
| `/admin` | 어드민 대시보드 | ADMIN |
| `/admin/users` | 회원 관리 | ADMIN |
| `/admin/raids` | 레이드 관리 | ADMIN |
| `/admin/posts` | 게시글 관리 | ADMIN |

### 권한 처리
```tsx
// 사용 예시
<ProtectedRoute requiredRole="RAID_LEADER">
  <RaidFormPage />
</ProtectedRoute>

// 비인가 → /login 리다이렉트
// 권한 부족 → / 리다이렉트
```

---

## API 통신 레이어

### client.ts 구조
```
axios 인스턴스
├── baseURL: import.meta.env.VITE_API_BASE_URL
├── Request 인터셉터
│   └── localStorage 토큰 → Authorization: Bearer {token} 자동 주입
└── Response 인터셉터
    ├── success → response.data.data 추출 (ApiResponse 래퍼 제거)
    └── error
        ├── 401 → authStore 초기화 → /login 리다이렉트
        └── 나머지 → error.response.data.message throw
```

### TanStack Query 패턴
```
useQuery   → GET (목록, 상세 조회)
useMutation → POST / PUT / PATCH / DELETE
invalidateQueries → mutation 성공 후 캐시 무효화
```

---

## 인증 상태 관리

### auth.store.ts (Zustand)
```
state
├── user: { username: string, role: UserRole } | null
├── accessToken: string | null
└── isAuthenticated: boolean

actions
├── login(token, user) → localStorage 저장 + 상태 업데이트
└── logout()          → localStorage 제거 + 상태 초기화
```

### 앱 시작 시 토큰 복원
```
main.tsx 또는 App.tsx에서
localStorage에 토큰 있으면 → authStore에 복원
```

---

## 주요 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `Header` | 로그인 상태에 따른 네비게이션, 알림 배지 |
| `ProtectedRoute` | role 기반 접근 제어, 리다이렉트 처리 |
| `RaidCard` | 레이드 목록 카드 (난이도, 날짜, 모집 현황) |
| `RaidStats` | 탱/힐/딜 역할별 직업 구성 시각화 + 미보유 직업 표시 |
| `RaidForm` | 레이드 생성/수정 폼 (React Hook Form + Zod) |
| `RegistrationList` | 신청자 목록 (CONFIRMED / WAITING / ABSENT 구분) |
| `MemberRegistrationForm` | 회원 신청 폼 |
| `GuestRegistrationForm` | 비회원 신청 폼 (이름 + 비밀번호) |
| `NotificationBadge` | 헤더 알림 아이콘 + 읽지 않은 수 배지 |
| `NotificationDropdown` | 알림 드롭다운 목록 |
| `PostCard` | 게시글 목록 카드 |
| `PostForm` | 게시글 작성/수정 폼 |
| `CharacterForm` | 캐릭터 등록 폼 (직업, 특성 선택) |
