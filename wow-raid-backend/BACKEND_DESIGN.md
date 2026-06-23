# WoW 레이드 관리 시스템 — 설계 문서

## 목차
1. [요구사항](#요구사항)
2. [DB 설계](#db-설계)
3. [API 설계](#api-설계)
4. [백엔드 아키텍처](#백엔드-아키텍처)
5. [Docker 구성](#docker-구성)
6. [운영 정책](#운영-정책)

---

## 요구사항

### 회원 시스템
- 회원가입 / 로그인 (JWT)
- 아이디 찾기 (이메일)
- 비밀번호 변경 / 회원 탈퇴
- 역할 3단계: `ADMIN`(1인) / `RAID_LEADER`(인증코드 필요, env 관리) / `MEMBER`

### 캐릭터 관리
- 캐릭터 등록 / 삭제 / 대표 캐릭터 설정
- 직업(WowClass) + 특성(WowSpec) 설정
- 블리자드 API 템렙 연동 (추후)

### 레이드 관리
- 생성 / 수정 / 삭제 (공격대장)
- 목록 / 상세 조회 (누구나)
- 난이도: 일반 / 영웅 / 신화
- 탱 / 힐 / 딜 자리수 설정 (기본 2 / 4 / 14)
- 레이드 시간 지나면 자동 CLOSED (스케줄러)
- 상세 화면: 역할별 직업 구성 통계 + 미보유 직업 표시

### 레이드 신청
- 회원: JWT 인증 후 신청 / 수정 / 취소
- 비회원: 이름 + 비밀번호 신청, 동일 정보 재인증으로 수정 / 취소
- 선착순 자동 확정 — 자리 있으면 `CONFIRMED`, 꽉 차면 `WAITING`
- 취소 시 대기자 `created_at` 순으로 자동 승격
- 불참 신고 (사유 포함) — 불참 후 취소 불가 (신청 완전 취소와 동일 처리)

### 알림 (회원만, SSE)
- 신규 레이드 / 신청 완료·취소 / 상태 변경 / 레이드 마감·수정
- 읽음 처리 (개별 / 전체)

### 게시판
- 공지사항 (관리자만 작성 / 수정 / 삭제)
- 자유게시판 (회원 작성, 본인만 수정 / 삭제)

### 어드민
- 회원 목록 / 역할 변경 / 강제 탈퇴
- 레이드 / 게시글 강제 삭제

---

## DB 설계

### 공통 Audit 필드 (전 테이블 적용)

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| created_at | TIMESTAMP | NOT NULL | 생성일 |
| updated_at | TIMESTAMP | NOT NULL | 수정일 |
| deleted_at | TIMESTAMP | nullable | 삭제일 (null = 정상) |

---

### Enum 정의

**UserRole**
| 값 | 설명 |
|---|---|
| `ADMIN` | 관리자 (1인) |
| `RAID_LEADER` | 공격대장 |
| `MEMBER` | 공대원 |

**Difficulty**
| 값 | 설명 |
|---|---|
| `NORMAL` | 일반 |
| `HEROIC` | 영웅 |
| `MYTHIC` | 신화 |

**RaidStatus**
| 값 | 설명 |
|---|---|
| `OPEN` | 신청 중 |
| `CLOSED` | 마감 |

**RaidRole**
| 값 | 설명 |
|---|---|
| `TANK` | 탱커 |
| `HEALER` | 힐러 |
| `DPS` | 딜러 |

**RegistrationStatus**
| 값 | 설명 |
|---|---|
| `CONFIRMED` | 확정 |
| `WAITING` | 대기 |
| `ABSENT` | 불참 |

**NotificationType**
| 값 | 설명 |
|---|---|
| `NEW_RAID` | 새 레이드 생성 |
| `REGISTRATION_COMPLETE` | 신청 완료 |
| `REGISTRATION_CANCELLED` | 신청 취소 |
| `STATUS_CHANGED` | 상태 변경 (대기→확정) |
| `RAID_CLOSED` | 레이드 마감 |
| `RAID_UPDATED` | 레이드 수정 |

**BoardType**
| 값 | 설명 |
|---|---|
| `NOTICE` | 공지사항 |
| `FREE` | 자유게시판 |

**WowClass** (13개)
| 값 | 직업명 |
|---|---|
| `WARRIOR` | 전사 |
| `PALADIN` | 성기사 |
| `HUNTER` | 사냥꾼 |
| `ROGUE` | 도적 |
| `PRIEST` | 사제 |
| `DEATH_KNIGHT` | 죽음의 기사 |
| `SHAMAN` | 주술사 |
| `MAGE` | 마법사 |
| `WARLOCK` | 흑마법사 |
| `MONK` | 수도사 |
| `DRUID` | 드루이드 |
| `DEMON_HUNTER` | 악마사냥꾼 |
| `EVOKER` | 기원사 |

**WowSpec** (39개)
| 직업 | 값 | 특성명 |
|---|---|---|
| 전사 | `ARMS` | 무기 |
| 전사 | `FURY` | 분노 |
| 전사 | `PROTECTION_WARRIOR` | 방어 |
| 성기사 | `HOLY_PALADIN` | 신성 |
| 성기사 | `PROTECTION_PALADIN` | 보호 |
| 성기사 | `RETRIBUTION` | 징벌 |
| 사냥꾼 | `BEAST_MASTERY` | 야수 지배 |
| 사냥꾼 | `MARKSMANSHIP` | 사격 |
| 사냥꾼 | `SURVIVAL` | 생존 |
| 도적 | `ASSASSINATION` | 암살 |
| 도적 | `OUTLAW` | 무법 |
| 도적 | `SUBTLETY` | 잠행 |
| 사제 | `DISCIPLINE` | 수양 |
| 사제 | `HOLY_PRIEST` | 신성 |
| 사제 | `SHADOW` | 암흑 |
| 죽음의 기사 | `BLOOD` | 혈기 |
| 죽음의 기사 | `FROST_DK` | 냉기 |
| 죽음의 기사 | `UNHOLY` | 부정 |
| 주술사 | `ELEMENTAL` | 정기 |
| 주술사 | `ENHANCEMENT` | 고양 |
| 주술사 | `RESTORATION_SHAMAN` | 복원 |
| 마법사 | `ARCANE` | 신비 |
| 마법사 | `FIRE` | 화염 |
| 마법사 | `FROST_MAGE` | 냉기 |
| 흑마법사 | `AFFLICTION` | 고통 |
| 흑마법사 | `DEMONOLOGY` | 악마학 |
| 흑마법사 | `DESTRUCTION` | 파괴 |
| 수도사 | `BREWMASTER` | 양조 |
| 수도사 | `MISTWEAVER` | 운무 |
| 수도사 | `WINDWALKER` | 풍운 |
| 드루이드 | `BALANCE` | 조화 |
| 드루이드 | `FERAL` | 야성 |
| 드루이드 | `GUARDIAN` | 수호 |
| 드루이드 | `RESTORATION_DRUID` | 복원 |
| 악마사냥꾼 | `HAVOC` | 파멸 |
| 악마사냥꾼 | `VENGEANCE` | 복수 |
| 기원사 | `DEVASTATION` | 황폐 |
| 기원사 | `PRESERVATION` | 보존 |
| 기원사 | `AUGMENTATION` | 증강 |

---

### 테이블 정의

#### 👤 users
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK | |
| username | VARCHAR(50) | UNIQUE (deleted_at IS NULL) | 아이디 |
| email | VARCHAR(100) | UNIQUE (deleted_at IS NULL) | 아이디 찾기용 |
| password | VARCHAR | NOT NULL | BCrypt 암호화 |
| battletag | VARCHAR(100) | nullable | 배틀태그 |
| role | UserRole | NOT NULL | 역할 |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | nullable | 탈퇴일, 1일 후 하드 딜리트 |

#### 🧙 user_characters
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users, NOT NULL | |
| character_name | VARCHAR(50) | NOT NULL | |
| wow_class | WowClass | NOT NULL | |
| wow_spec | WowSpec | NOT NULL | |
| is_main | BOOLEAN | DEFAULT false | 대표 캐릭터 |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | nullable | |

#### ⚔️ raid_schedules
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK | |
| title | VARCHAR(200) | NOT NULL | |
| raid_date | TIMESTAMP | NOT NULL | 이 시간 지나면 자동 CLOSED |
| difficulty | Difficulty | NOT NULL | |
| max_tanks | INT | DEFAULT 2 | |
| max_healers | INT | DEFAULT 4 | |
| max_dps | INT | DEFAULT 14 | |
| notes | TEXT | nullable | |
| status | RaidStatus | DEFAULT OPEN | |
| created_by | UUID | FK → users, NOT NULL | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | nullable | |

#### 📋 raid_registrations (회원)
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK | |
| raid_schedule_id | UUID | FK → raid_schedules, NOT NULL | |
| user_id | UUID | FK → users, NOT NULL | |
| character_name | VARCHAR(50) | NOT NULL | |
| wow_class | WowClass | NOT NULL | |
| wow_spec | WowSpec | NOT NULL | |
| role | RaidRole | NOT NULL | |
| status | RegistrationStatus | NOT NULL | |
| absence_reason | TEXT | nullable | |
| created_at | TIMESTAMP | NOT NULL | 대기 순서 기준 |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | nullable | |

> ⚠️ UNIQUE (raid_schedule_id, user_id) WHERE deleted_at IS NULL

#### 👻 guest_registrations (비회원)
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK | |
| raid_schedule_id | UUID | FK → raid_schedules, NOT NULL | |
| guest_name | VARCHAR(50) | NOT NULL | |
| guest_password | VARCHAR | NOT NULL | BCrypt 암호화 |
| character_name | VARCHAR(50) | NOT NULL | |
| wow_class | WowClass | NOT NULL | |
| wow_spec | WowSpec | NOT NULL | |
| role | RaidRole | NOT NULL | |
| status | RegistrationStatus | NOT NULL | |
| absence_reason | TEXT | nullable | |
| created_at | TIMESTAMP | NOT NULL | 대기 순서 기준 |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | nullable | |

> ⚠️ UNIQUE (raid_schedule_id, guest_name) WHERE deleted_at IS NULL

#### 🔔 notifications
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK | |
| user_id | UUID | FK → users, NOT NULL | |
| message | VARCHAR(500) | NOT NULL | |
| type | NotificationType | NOT NULL | |
| is_read | BOOLEAN | DEFAULT false | |
| related_raid_id | UUID | FK → raid_schedules, nullable | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | nullable | |

#### 📝 posts
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK | |
| board_type | BoardType | NOT NULL | |
| title | VARCHAR(200) | NOT NULL | |
| content | TEXT | NOT NULL | |
| author_id | UUID | FK → users, NOT NULL | |
| view_count | INT | DEFAULT 0 | |
| pinned | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | nullable | |

---

## API 설계

> 총 32개 엔드포인트 / 권한 5단계: 누구나 · 비회원 재인증 · 로그인 · 공격대장 · 관리자

### 🔐 인증 `/api/auth`
| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/auth/register` | 회원가입 | 누구나 |
| POST | `/api/auth/login` | 로그인 → JWT 발급 | 누구나 |
| POST | `/api/auth/find-username` | 아이디 찾기 (이메일) | 누구나 |

### 👤 내 계정 `/api/users`
| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| PATCH | `/api/users/me/password` | 비밀번호 변경 | 로그인 |
| DELETE | `/api/users/me` | 회원 탈퇴 | 로그인 |
| GET | `/api/users/me/characters` | 내 캐릭터 목록 | 로그인 |
| POST | `/api/users/me/characters` | 캐릭터 등록 | 로그인 |
| PATCH | `/api/users/me/characters/{id}/main` | 대표 캐릭터 설정 | 로그인 |
| DELETE | `/api/users/me/characters/{id}` | 캐릭터 삭제 | 로그인 |

### ⚔️ 레이드 `/api/raids`
| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| GET | `/api/raids` | 레이드 목록 (페이징, 상태 필터) | 누구나 |
| GET | `/api/raids/{id}` | 레이드 상세 + 신청자 목록 + 직업 통계 | 누구나 |
| POST | `/api/raids` | 레이드 생성 | 공격대장 |
| PUT | `/api/raids/{id}` | 레이드 수정 | 공격대장 |
| DELETE | `/api/raids/{id}` | 레이드 삭제 | 공격대장 |

### 📋 레이드 신청 - 회원
| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/raids/{raidId}/registrations` | 신청 | 로그인 |
| PUT | `/api/raids/{raidId}/registrations/me` | 신청 수정 | 로그인 |
| DELETE | `/api/raids/{raidId}/registrations/me` | 신청 취소 | 로그인 |
| PATCH | `/api/raids/{raidId}/registrations/me/absence` | 불참 신고 | 로그인 |

### 👻 레이드 신청 - 비회원
| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| POST | `/api/raids/{raidId}/guest-registrations` | 신청 | 누구나 |
| PUT | `/api/raids/{raidId}/guest-registrations/{id}` | 신청 수정 (재인증) | 비회원 재인증 |
| DELETE | `/api/raids/{raidId}/guest-registrations/{id}` | 신청 취소 (재인증) | 비회원 재인증 |
| PATCH | `/api/raids/{raidId}/guest-registrations/{id}/absence` | 불참 신고 (재인증) | 비회원 재인증 |

### 🔔 알림 `/api/notifications`
| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| GET | `/api/notifications/subscribe` | SSE 실시간 알림 구독 | 로그인 |
| GET | `/api/notifications` | 알림 목록 | 로그인 |
| GET | `/api/notifications/unread-count` | 안 읽은 알림 수 | 로그인 |
| PATCH | `/api/notifications/{id}/read` | 특정 알림 읽음 처리 | 로그인 |
| PATCH | `/api/notifications/read-all` | 전체 알림 읽음 처리 | 로그인 |

### 📝 게시판 `/api/posts`
| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| GET | `/api/posts` | 게시글 목록 (`?boardType=NOTICE\|FREE`) | 누구나 |
| GET | `/api/posts/{id}` | 게시글 상세 | 누구나 |
| POST | `/api/posts` | 게시글 작성 (공지는 관리자만) | 로그인 |
| PUT | `/api/posts/{id}` | 게시글 수정 | 본인 |
| DELETE | `/api/posts/{id}` | 게시글 삭제 | 본인 |

### 👑 어드민 `/api/admin`
| 메서드 | 경로 | 설명 | 권한 |
|---|---|---|---|
| GET | `/api/admin/users` | 회원 목록 (검색) | 관리자 |
| PATCH | `/api/admin/users/{id}/role` | 회원 역할 변경 | 관리자 |
| DELETE | `/api/admin/users/{id}` | 회원 강제 탈퇴 | 관리자 |
| GET | `/api/admin/raids` | 전체 레이드 조회 | 관리자 |
| DELETE | `/api/admin/raids/{id}` | 레이드 강제 삭제 | 관리자 |
| GET | `/api/admin/posts` | 전체 게시글 조회 | 관리자 |
| DELETE | `/api/admin/posts/{id}` | 게시글 강제 삭제 | 관리자 |

---

## 백엔드 아키텍처

### 기술 스택
- Java 21 / Spring Boot 3.3.5
- Spring Data JPA / PostgreSQL
- Spring Security + JWT (jjwt 0.12.6)
- Lombok / Validation
- Gradle

### 패키지 구조

```
com.wowraid
├── domain/
│   ├── auth/
│   │   ├── controller/AuthController.java
│   │   ├── service/AuthService.java
│   │   └── dto/
│   │       ├── request/ (RegisterRequest, LoginRequest, FindUsernameRequest)
│   │       └── response/ (TokenResponse, FindUsernameResponse)
│   │
│   ├── user/
│   │   ├── controller/UserController.java
│   │   ├── service/UserService.java
│   │   ├── repository/ (UserRepository, UserCharacterRepository)
│   │   ├── entity/ (User, UserCharacter)
│   │   ├── enums/ (UserRole)
│   │   └── dto/
│   │       ├── request/ (ChangePasswordRequest, CharacterRequest)
│   │       └── response/ (CharacterResponse)
│   │
│   ├── raid/
│   │   ├── controller/RaidController.java
│   │   ├── service/RaidService.java
│   │   ├── repository/RaidRepository.java
│   │   ├── entity/RaidSchedule.java
│   │   ├── enums/ (Difficulty, RaidStatus)
│   │   └── dto/
│   │       ├── request/ (RaidRequest)
│   │       └── response/ (RaidListResponse, RaidDetailResponse, RaidStatsResponse)
│   │
│   ├── registration/
│   │   ├── controller/ (RegistrationController, GuestRegistrationController)
│   │   ├── service/ (RegistrationService, GuestRegistrationService)
│   │   ├── repository/ (RegistrationRepository, GuestRegistrationRepository)
│   │   ├── entity/ (Registration, GuestRegistration)
│   │   ├── enums/ (RaidRole, RegistrationStatus, WowClass, WowSpec)
│   │   └── dto/
│   │       ├── request/ (RegistrationRequest, RegistrationUpdateRequest, AbsenceRequest, GuestRegistrationRequest, GuestAuthRequest)
│   │       └── response/ (RegistrationResponse, GuestRegistrationResponse)
│   │
│   ├── notification/
│   │   ├── controller/NotificationController.java
│   │   ├── service/ (NotificationService, SseService)
│   │   ├── repository/NotificationRepository.java
│   │   ├── entity/Notification.java
│   │   ├── enums/ (NotificationType)
│   │   └── dto/
│   │       └── response/ (NotificationResponse, UnreadCountResponse)
│   │
│   ├── post/
│   │   ├── controller/PostController.java
│   │   ├── service/PostService.java
│   │   ├── repository/PostRepository.java
│   │   ├── entity/Post.java
│   │   ├── enums/ (BoardType)
│   │   └── dto/
│   │       ├── request/ (PostRequest)
│   │       └── response/ (PostListResponse, PostDetailResponse)
│   │
│   └── admin/
│       ├── controller/AdminController.java
│       └── service/AdminService.java
│
└── global/
    ├── config/ (SecurityConfig, JwtProvider, JwtAuthFilter)
    ├── common/
    │   ├── entity/BaseEntity.java
    │   └── response/ApiResponse.java
    ├── exception/ (GlobalExceptionHandler, ErrorCode, BusinessException)
    └── scheduler/ (UserCleanupScheduler, RaidAutoCloseScheduler)
```

### 공통 응답 포맷

```json
{
  "success": true,
  "data": { },
  "message": "요청이 성공했습니다."
}
```

### BaseEntity (공통 Audit)

```java
@MappedSuperclass
public abstract class BaseEntity {
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
```

---

## Docker 구성

| 컨테이너 | 이미지 | 포트 | 설명 |
|---|---|---|---|
| wow-raid-postgres | postgres:16 | 5432 | PostgreSQL DB |
| wow-raid-adminer | adminer:latest | 8081 | DB 관리 UI |

```bash
# 실행
docker-compose up -d

# Adminer 접속: http://localhost:8081
# 시스템: PostgreSQL / 서버: postgres / DB: wow_raid
```

---

## 운영 정책

### 소프트 딜리트
| 항목 | 내용 |
|---|---|
| 전체 테이블 | deleted_at 기반 소프트 딜리트 |
| UNIQUE 처리 | 부분 인덱스 (WHERE deleted_at IS NULL) |
| 탈퇴 유저 하드 딜리트 | 탈퇴 후 1일 경과 시 스케줄러가 하드 딜리트 |
| 연관 데이터 | 유저 하드 딜리트 시 전부 Cascade 삭제 |

### 스케줄러
| 작업 | 주기 | 설명 |
|---|---|---|
| 유저 하드 딜리트 | 매일 새벽 | deleted_at 1일 경과 유저 + 연관 데이터 삭제 |
| 레이드 자동 마감 | 매분 | raid_date 지난 레이드 → CLOSED |

### 대기열 자동 승격
- 취소 / 불참 발생 시 같은 role의 WAITING 신청자 중 `created_at` 가장 빠른 순으로 자동 CONFIRMED 승격
- 불참 신고 후 취소 불가 (신청 완전 취소와 동일 처리)
