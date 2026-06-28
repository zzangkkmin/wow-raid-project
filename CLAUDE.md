# WoW Raid Project — Claude 컨텍스트

## 프로젝트 개요
WoW 길드 레이드 관리 시스템. 레이드 일정 생성/신청, 공격대 구성 통계, 게시판, 알림 기능 제공.

- **GitHub**: https://github.com/zzangkkmin/wow-raid-project
- **개발자**: zzangkkmin (zzangkkmin@gmail.com)

---

## 기술 스택 & 포트

| 서비스 | 기술 | 포트 |
|--------|------|------|
| 백엔드 | Spring Boot 3.3.5 + Java 17 | 8088 |
| 프론트엔드 | React 18 + Vite + TypeScript + Tailwind CSS v4 | 7777 |
| DB | PostgreSQL 16 (Docker) | 5690 |
| DB 관리 | Adminer (Docker) | 8081 |

> 포트가 일반 포트(5432, 8080, 5173)가 아닌 이유: Windows Hyper-V 예약 포트 충돌 회피

---

## 프로젝트 구조

```
wow-raid-project/
├── wow-raid-backend/    # Spring Boot
└── wow-raid-frontend/   # React + Vite (pnpm 사용)
```

### 백엔드 패키지 구조 (`com.wowraid`)
```
domain/
├── auth/          # 회원가입, 로그인, username 찾기
├── user/          # 사용자 + 캐릭터 관리
├── raid/          # 레이드 일정 CRUD
├── registration/  # 회원/비회원 레이드 신청
├── post/          # 게시판 (공지/자유)
├── notification/  # SSE 실시간 알림
└── admin/         # 관리자 기능
global/
├── config/        # Security, JWT, JPA
├── exception/     # 에러 코드, 전역 핸들러
├── init/          # 샘플 데이터 (@Profile("local"))
└── scheduler/     # 레이드 자동 마감, 탈퇴 유저 정리
```

### 프론트엔드 구조 (`src/`)
```
api/           # axios API 호출
components/
├── common/    # WowClassIcon, RaidRoleIcon, LoadingSpinner
├── raid/      # RaidStats (역할별 카드 + 도넛 차트)
└── registration/  # MemberRegistrationForm, GuestRegistrationForm
pages/
├── raid/      # RaidListPage, RaidDetailPage, RaidFormPage
├── auth/      # LoginPage, RegisterPage
├── user/      # CharacterPage
└── post/      # PostListPage, PostDetailPage
stores/        # Zustand (auth.store)
types/         # enums.ts, raid.types.ts, registration.types.ts
utils/         # wowClass.util.ts, date.util.ts
```

---

## 주요 설계 원칙

- **소프트 딜리트**: 모든 엔티티가 `BaseEntity`(deletedAt) 상속, 스케줄러로 1일 후 물리 삭제
- **JWT 인증**: Stateless, 24시간 유효
- **신청 정원 관리**: 역할별(탱/힐/딜) CONFIRMED/WAITING 자동 분류, 취소 시 대기자 자동 승격
- **회원·비회원 통합**: `Registration` + `GuestRegistration` 분리된 엔티티, 정원 계산 시 합산
- **레이드 자동 마감**: 매분 스케줄러가 raidDate 경과한 OPEN 레이드를 CLOSED 처리
- **실시간 알림**: SSE(SseEmitter) 기반

---

## 백엔드 설정

### 프로파일
- `local` 프로파일로 실행 (`application-local.yml` 필요, gitignore됨)
- `application-local.yml.example` 참고하여 `application-local.yml` 생성

### 주요 환경변수 (기본값 있음)
```
JWT_SECRET         # JWT 서명 키
RAID_LEADER_CODE   # 레이드리더 가입 코드 (기본: raidleader1234)
POSTGRES_DB        # DB명 (기본: wow_raid)
POSTGRES_USER      # DB 유저 (기본: postgres)
POSTGRES_PASSWORD  # DB 비번 (기본: postgres)
```

### 샘플 데이터
`DataInitializer` (`@Profile("local")`)가 앱 시작 시 자동 삽입. 비밀번호 전부 `password123`.
```
admin        - ADMIN
raidleader   - RAID_LEADER
darkknightzz - MEMBER (죽음의 기사 탱)
healbot9000  - MEMBER (사제 힐)
shadowstab   - MEMBER (도적 딜)
frostmage    - MEMBER (마법사 딜)
boomchicken  - MEMBER (드루이드 딜)
```

---

## 프론트엔드 설정

- 패키지 매니저: **pnpm**
- API 기본 URL: `http://localhost:8088/api`
- CORS 허용 오리진: `localhost:5173`, `localhost:7777`

---

## WoW 클래스/스펙 관련

### RaidRole Enum
현재: `TANK`, `HEALER`, `DPS`
예정 변경: `TANK`, `HEALER`, `MELEE_DPS`, `RANGED_DPS` (레이블만 구분, maxDps 풀은 통합 유지)

### 딜러 근딜/원딜 분류 (미구현, 향후 참조)

**근딜 (MELEE_DPS)**
- 전사: 무기(ARMS), 분노(FURY)
- 성기사: 징벌(RETRIBUTION)
- 사냥꾼: 생존(SURVIVAL)
- 도적: 암살(ASSASSINATION), 무법(OUTLAW), 잠행(SUBTLETY)
- 죽음의 기사: 냉기(FROST), 부정(UNHOLY)
- 주술사: 고양(ENHANCEMENT)
- 수도사: 풍운(WINDWALKER)
- 드루이드: 야성(FERAL)
- 악마사냥꾼: 파멸(HAVOC)

**원딜 (RANGED_DPS)**
- 사냥꾼: 야수(BEAST_MASTERY), 사격(MARKSMANSHIP)
- 마법사: 비전(ARCANE), 화염(FIRE), 냉기(FROST)
- 흑마법사: 고통(AFFLICTION), 악마학(DEMONOLOGY), 파괴(DESTRUCTION)
- 사제: 암흑(SHADOW)
- 주술사: 원소(ELEMENTAL)
- 드루이드: 조화(BALANCE)
- 용기사: 황폐(DEVASTATION), **증강(AUGMENTATION)** ← 원딜
- 악마사냥꾼: **포식(DEVOURER)** ← 원딜

### WoW 직업 아이콘
CDN: `https://wow.zamimg.com/images/wow/icons/{size}/{icon}.jpg`
- 직업 아이콘: `WowClassIcon` 컴포넌트 (zamimg CDN)
- 역할 아이콘: `RaidRoleIcon` 컴포넌트 (커스텀 인라인 SVG)

---

## API 엔드포인트 요약

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/raids                          # 목록 (status 필터)
GET    /api/raids/{id}                     # 상세 (통계 + 신청자 포함)
POST   /api/raids                          # 생성 (RAID_LEADER)
PUT    /api/raids/{id}                     # 수정
DELETE /api/raids/{id}                     # 삭제

POST   /api/raids/{id}/registrations       # 회원 신청
DELETE /api/raids/{id}/registrations/me    # 취소
PATCH  /api/raids/{id}/registrations/me/absence  # 불참 신고

POST   /api/raids/{id}/guest-registrations        # 비회원 신청
PUT    /api/raids/{id}/guest-registrations/{gid}  # 수정
DELETE /api/raids/{id}/guest-registrations/{gid}  # 취소

GET    /api/posts                          # 게시글 목록 (boardType 필터)
POST   /api/posts

GET    /api/users/me/characters
POST   /api/users/me/characters

GET    /api/notifications/subscribe        # SSE 구독
GET    /api/notifications
PATCH  /api/notifications/read-all
```

---

## 개발 시 주의사항

- 백엔드 `ddl-auto: create-drop` (local) — 재시작 시 DB 초기화됨
- 비회원 신청 엔드포인트(`/guest-registrations`)는 SecurityConfig에서 공개 처리
- `RaidRole.DPS` → `MELEE_DPS`/`RANGED_DPS` 분리 작업 예정 (미구현)
- `WowSpec.DEVOURER` 백엔드/프론트 모두 존재해야 함 (악마사냥꾼 포식 특성)
