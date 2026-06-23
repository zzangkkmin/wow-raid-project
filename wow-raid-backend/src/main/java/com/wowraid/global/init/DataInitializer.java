package com.wowraid.global.init;

import com.wowraid.domain.post.entity.Post;
import com.wowraid.domain.post.enums.BoardType;
import com.wowraid.domain.post.repository.PostRepository;
import com.wowraid.domain.raid.entity.RaidSchedule;
import com.wowraid.domain.raid.enums.Difficulty;
import com.wowraid.domain.raid.enums.RaidStatus;
import com.wowraid.domain.raid.repository.RaidRepository;
import com.wowraid.domain.registration.entity.Registration;
import com.wowraid.domain.registration.enums.RaidRole;
import com.wowraid.domain.registration.enums.RegistrationStatus;
import com.wowraid.domain.registration.enums.WowClass;
import com.wowraid.domain.registration.enums.WowSpec;
import com.wowraid.domain.registration.repository.RegistrationRepository;
import com.wowraid.domain.user.entity.User;
import com.wowraid.domain.user.entity.UserCharacter;
import com.wowraid.domain.user.enums.UserRole;
import com.wowraid.domain.user.repository.UserCharacterRepository;
import com.wowraid.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final UserCharacterRepository characterRepository;
    private final RaidRepository raidRepository;
    private final RegistrationRepository registrationRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("[DataInitializer] 이미 데이터가 존재합니다. 건너뜁니다.");
            return;
        }

        log.info("[DataInitializer] 예시 데이터 삽입 시작...");

        // ─── 유저 생성 ─────────────────────────────────────────────
        String pw = passwordEncoder.encode("password123");

        User admin = userRepository.save(User.builder()
                .username("admin")
                .email("admin@wowraid.com")
                .password(pw)
                .battletag("Admin#1234")
                .role(UserRole.ADMIN)
                .build());

        User leader = userRepository.save(User.builder()
                .username("raidleader")
                .email("leader@wowraid.com")
                .password(pw)
                .battletag("Leader#5678")
                .role(UserRole.RAID_LEADER)
                .build());

        User member1 = userRepository.save(User.builder()
                .username("darkknightzz")
                .email("dk@wowraid.com")
                .password(pw)
                .battletag("DarkKnight#9001")
                .role(UserRole.MEMBER)
                .build());

        User member2 = userRepository.save(User.builder()
                .username("healbot9000")
                .email("heal@wowraid.com")
                .password(pw)
                .battletag("HealBot#2222")
                .role(UserRole.MEMBER)
                .build());

        User member3 = userRepository.save(User.builder()
                .username("shadowstab")
                .email("rogue@wowraid.com")
                .password(pw)
                .battletag("Shadow#3333")
                .role(UserRole.MEMBER)
                .build());

        User member4 = userRepository.save(User.builder()
                .username("frostmage")
                .email("mage@wowraid.com")
                .password(pw)
                .battletag("Frost#4444")
                .role(UserRole.MEMBER)
                .build());

        User member5 = userRepository.save(User.builder()
                .username("boomchicken")
                .email("druid@wowraid.com")
                .password(pw)
                .battletag("Boom#5555")
                .role(UserRole.MEMBER)
                .build());

        log.info("[DataInitializer] 유저 7명 생성 완료");

        // ─── 캐릭터 생성 ───────────────────────────────────────────
        // raidleader - 성기사 탱커
        characterRepository.save(UserCharacter.builder()
                .user(leader)
                .characterName("팔라딘킹")
                .wowClass(WowClass.PALADIN)
                .wowSpec(WowSpec.PROTECTION_PALADIN)
                .isMain(true)
                .build());

        // member1 - 죽음의 기사 탱커 (메인) + 전사 딜러 (부캐)
        characterRepository.save(UserCharacter.builder()
                .user(member1)
                .characterName("다크나이트")
                .wowClass(WowClass.DEATH_KNIGHT)
                .wowSpec(WowSpec.BLOOD)
                .isMain(true)
                .build());
        characterRepository.save(UserCharacter.builder()
                .user(member1)
                .characterName("퓨리워리어")
                .wowClass(WowClass.WARRIOR)
                .wowSpec(WowSpec.FURY)
                .isMain(false)
                .build());

        // member2 - 사제 힐러
        characterRepository.save(UserCharacter.builder()
                .user(member2)
                .characterName("힐봇나인천")
                .wowClass(WowClass.PRIEST)
                .wowSpec(WowSpec.HOLY_PRIEST)
                .isMain(true)
                .build());

        // member3 - 도적 딜러
        characterRepository.save(UserCharacter.builder()
                .user(member3)
                .characterName("그림자도적")
                .wowClass(WowClass.ROGUE)
                .wowSpec(WowSpec.SUBTLETY)
                .isMain(true)
                .build());

        // member4 - 마법사 딜러
        characterRepository.save(UserCharacter.builder()
                .user(member4)
                .characterName("서리마법사")
                .wowClass(WowClass.MAGE)
                .wowSpec(WowSpec.FROST_MAGE)
                .isMain(true)
                .build());

        // member5 - 드루이드 딜러
        characterRepository.save(UserCharacter.builder()
                .user(member5)
                .characterName("달빛치킨")
                .wowClass(WowClass.DRUID)
                .wowSpec(WowSpec.BALANCE)
                .isMain(true)
                .build());

        log.info("[DataInitializer] 캐릭터 생성 완료");

        // ─── 레이드 일정 생성 ──────────────────────────────────────
        // 1) 모집 중 - 노말 (다음 주 토요일)
        RaidSchedule openRaidNormal = raidRepository.save(RaidSchedule.builder()
                .title("[노말] 네루바르 궁전 공격대 모집")
                .raidDate(LocalDateTime.now().plusDays(7).withHour(21).withMinute(0).withSecond(0))
                .difficulty(Difficulty.NORMAL)
                .maxTanks(2)
                .maxHealers(3)
                .maxDps(15)
                .notes("아이템 레벨 600 이상 / 초보 환영 / 디스코드 필참")
                .status(RaidStatus.OPEN)
                .createdBy(leader)
                .build());

        // 2) 모집 중 - 영웅 (2주 후 금요일)
        RaidSchedule openRaidHeroic = raidRepository.save(RaidSchedule.builder()
                .title("[영웅] 네루바르 궁전 영웅 공대 모집")
                .raidDate(LocalDateTime.now().plusDays(13).withHour(20).withMinute(30).withSecond(0))
                .difficulty(Difficulty.HEROIC)
                .maxTanks(2)
                .maxHealers(4)
                .maxDps(14)
                .notes("아이템 레벨 636 이상 / 노말 클리어 필수 / 파싱 우선 선발")
                .status(RaidStatus.OPEN)
                .createdBy(leader)
                .build());

        // 3) 마감 - 신화 (지난 주)
        RaidSchedule closedRaid = raidRepository.save(RaidSchedule.builder()
                .title("[신화] 네루바르 궁전 신화 진행")
                .raidDate(LocalDateTime.now().minusDays(7).withHour(21).withMinute(0).withSecond(0))
                .difficulty(Difficulty.MYTHIC)
                .maxTanks(2)
                .maxHealers(4)
                .maxDps(14)
                .notes("신화 경험자 필수 / 워크로그 제출 요망")
                .status(RaidStatus.CLOSED)
                .createdBy(leader)
                .build());

        log.info("[DataInitializer] 레이드 일정 3개 생성 완료");

        // ─── 신청 데이터 (노말 레이드) ────────────────────────────
        // 공격대장(팔라딘) 탱 신청 - CONFIRMED
        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidNormal)
                .user(leader)
                .characterName("팔라딘킹")
                .wowClass(WowClass.PALADIN)
                .wowSpec(WowSpec.PROTECTION_PALADIN)
                .role(RaidRole.TANK)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        // member1 - 죽기 탱 신청 - CONFIRMED
        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidNormal)
                .user(member1)
                .characterName("다크나이트")
                .wowClass(WowClass.DEATH_KNIGHT)
                .wowSpec(WowSpec.BLOOD)
                .role(RaidRole.TANK)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        // member2 - 사제 힐 신청 - CONFIRMED
        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidNormal)
                .user(member2)
                .characterName("힐봇나인천")
                .wowClass(WowClass.PRIEST)
                .wowSpec(WowSpec.HOLY_PRIEST)
                .role(RaidRole.HEALER)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        // member3 - 도적 딜 신청 - CONFIRMED
        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidNormal)
                .user(member3)
                .characterName("그림자도적")
                .wowClass(WowClass.ROGUE)
                .wowSpec(WowSpec.SUBTLETY)
                .role(RaidRole.DPS)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        // member4 - 마법사 딜 신청 - CONFIRMED
        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidNormal)
                .user(member4)
                .characterName("서리마법사")
                .wowClass(WowClass.MAGE)
                .wowSpec(WowSpec.FROST_MAGE)
                .role(RaidRole.DPS)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        // member5 - 드루이드 딜 신청 - WAITING (슬롯 추가 가정)
        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidNormal)
                .user(member5)
                .characterName("달빛치킨")
                .wowClass(WowClass.DRUID)
                .wowSpec(WowSpec.BALANCE)
                .role(RaidRole.DPS)
                .status(RegistrationStatus.WAITING)
                .build());

        // ─── 신청 데이터 (영웅 레이드) ───────────────────────────
        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidHeroic)
                .user(leader)
                .characterName("팔라딘킹")
                .wowClass(WowClass.PALADIN)
                .wowSpec(WowSpec.PROTECTION_PALADIN)
                .role(RaidRole.TANK)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidHeroic)
                .user(member3)
                .characterName("그림자도적")
                .wowClass(WowClass.ROGUE)
                .wowSpec(WowSpec.SUBTLETY)
                .role(RaidRole.DPS)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        log.info("[DataInitializer] 신청 데이터 생성 완료");

        // ─── 게시글 ────────────────────────────────────────────────
        postRepository.save(Post.builder()
                .boardType(BoardType.NOTICE)
                .title("[공지] 레이드 참가 규정 안내")
                .content("""
                        안녕하세요, 공격대장입니다.

                        레이드 참가 시 아래 규정을 꼭 지켜주세요.

                        1. 레이드 시작 10분 전까지 접속 완료
                        2. 디스코드 음성 채널 필참 (마이크 없어도 됩니다)
                        3. 약속된 캐릭터로 참가 (사전 변경 시 미리 알림)
                        4. 레이드 중 불참 시 반드시 불참 신고 등록
                        5. 연속 무단 불참 3회 시 공대 제외 처리

                        모두 즐거운 레이드 되세요!
                        """)
                .author(admin)
                .build());

        postRepository.save(Post.builder()
                .boardType(BoardType.NOTICE)
                .title("[공지] 7월 레이드 일정 공개")
                .content("""
                        7월 레이드 일정을 공개합니다.

                        • 7/5 (토) 21:00 - 노말 네루바르 궁전
                        • 7/12 (토) 20:30 - 영웅 네루바르 궁전
                        • 7/19 (토) 21:00 - 노말 재런
                        • 7/26 (토) 20:30 - 영웅 재런

                        신청은 레이드 일정 페이지에서 해주세요.
                        """)
                .author(admin)
                .build());

        postRepository.save(Post.builder()
                .boardType(BoardType.FREE)
                .title("이번 주 레이드 후기")
                .content("""
                        신화 레이드 3번 만에 1보스 잡았습니다!!

                        다들 수고 많으셨어요. 특히 힐러분들 고생하셨습니다 ㅠㅠ
                        다음 주도 파이팅!
                        """)
                .author(member1)
                .build());

        postRepository.save(Post.builder()
                .boardType(BoardType.FREE)
                .title("노말 레이드 신청했는데 처음인데 잘 부탁드립니다")
                .content("""
                        안녕하세요! 이번에 새로 가입한 달빛치킨입니다.

                        드루이드 균형 특성으로 딜러로 신청했는데
                        레이드가 처음이라 많이 미숙할 수 있어요.

                        잘 부탁드립니다!
                        """)
                .author(member5)
                .build());

        postRepository.save(Post.builder()
                .boardType(BoardType.FREE)
                .title("마법사 파싱 팁 공유")
                .content("""
                        서리 마법사 딜 파싱 팁 공유합니다.

                        1. 얼어붙기 - 아이시 베인스 유지 최우선
                        2. 한파 - 쿨타임마다 사용
                        3. 냉동 구체 - 얼어붙기 상태에서 사용하면 버프
                        4. 수석 마법사 버프 - 파티원과 겹치지 않게 조율

                        질문 있으신 분은 댓글로 달아주세요~
                        """)
                .author(member4)
                .build());

        log.info("[DataInitializer] 게시글 5개 생성 완료");
        log.info("[DataInitializer] ✅ 예시 데이터 삽입 완료!");
        log.info("[DataInitializer] 계정 목록 (비밀번호: password123)");
        log.info("[DataInitializer]   admin       - ADMIN");
        log.info("[DataInitializer]   raidleader  - RAID_LEADER");
        log.info("[DataInitializer]   darkknightzz - MEMBER");
        log.info("[DataInitializer]   healbot9000 - MEMBER");
        log.info("[DataInitializer]   shadowstab  - MEMBER");
        log.info("[DataInitializer]   frostmage   - MEMBER");
        log.info("[DataInitializer]   boomchicken - MEMBER");
    }
}
