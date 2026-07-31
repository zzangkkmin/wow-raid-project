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

        // ─── 꽉 찬 레이드용 추가 유저 (탱2/힐4/딜14 = 20명) ───────
        User ironwall = userRepository.save(User.builder()
                .username("ironwall").email("tank2@wowraid.com").password(pw)
                .battletag("IronWall#1001").role(UserRole.MEMBER).build());

        User heal2 = userRepository.save(User.builder()
                .username("holylight").email("heal2@wowraid.com").password(pw)
                .battletag("HolyLight#1002").role(UserRole.MEMBER).build());
        User heal3 = userRepository.save(User.builder()
                .username("mistweave").email("heal3@wowraid.com").password(pw)
                .battletag("MistWeave#1003").role(UserRole.MEMBER).build());
        User heal4 = userRepository.save(User.builder()
                .username("restodruid").email("heal4@wowraid.com").password(pw)
                .battletag("RestoDruid#1004").role(UserRole.MEMBER).build());

        User dps1  = userRepository.save(User.builder()
                .username("havocblade").email("dps1@wowraid.com").password(pw)
                .battletag("HavocBlade#2001").role(UserRole.MEMBER).build());
        User dps2  = userRepository.save(User.builder()
                .username("windpunch").email("dps2@wowraid.com").password(pw)
                .battletag("WindPunch#2002").role(UserRole.MEMBER).build());
        User dps3  = userRepository.save(User.builder()
                .username("firemage99").email("dps3@wowraid.com").password(pw)
                .battletag("FireMage#2003").role(UserRole.MEMBER).build());
        User dps4  = userRepository.save(User.builder()
                .username("afflockz").email("dps4@wowraid.com").password(pw)
                .battletag("AfflockZ#2004").role(UserRole.MEMBER).build());
        User dps5  = userRepository.save(User.builder()
                .username("shadowpriest").email("dps5@wowraid.com").password(pw)
                .battletag("ShadowPriest#2005").role(UserRole.MEMBER).build());
        User dps6  = userRepository.save(User.builder()
                .username("furywarrior").email("dps6@wowraid.com").password(pw)
                .battletag("FuryWarrior#2006").role(UserRole.MEMBER).build());
        User dps7  = userRepository.save(User.builder()
                .username("beastmaster").email("dps7@wowraid.com").password(pw)
                .battletag("BeastMaster#2007").role(UserRole.MEMBER).build());
        User dps8  = userRepository.save(User.builder()
                .username("retpaladin").email("dps8@wowraid.com").password(pw)
                .battletag("RetPaladin#2008").role(UserRole.MEMBER).build());
        User dps9  = userRepository.save(User.builder()
                .username("elemental99").email("dps9@wowraid.com").password(pw)
                .battletag("Elemental#2009").role(UserRole.MEMBER).build());
        User dps10 = userRepository.save(User.builder()
                .username("outlaw99").email("dps10@wowraid.com").password(pw)
                .battletag("Outlaw#2010").role(UserRole.MEMBER).build());
        User dps11 = userRepository.save(User.builder()
                .username("unholy99").email("dps11@wowraid.com").password(pw)
                .battletag("Unholy#2011").role(UserRole.MEMBER).build());
        User dps12 = userRepository.save(User.builder()
                .username("devastation").email("dps12@wowraid.com").password(pw)
                .battletag("Devastation#2012").role(UserRole.MEMBER).build());
        User tank3 = userRepository.save(User.builder()
                .username("voidtank").email("tank3@wowraid.com").password(pw)
                .battletag("VoidTank#1003").role(UserRole.MEMBER).build());
        User heal5 = userRepository.save(User.builder()
                .username("lightwarden").email("heal5@wowraid.com").password(pw)
                .battletag("LightWarden#1005").role(UserRole.MEMBER).build());
        User dps13 = userRepository.save(User.builder()
                .username("arcaneshot").email("dps13@wowraid.com").password(pw)
                .battletag("ArcaneShot#2013").role(UserRole.MEMBER).build());
        User dps14 = userRepository.save(User.builder()
                .username("augdragon").email("dps14@wowraid.com").password(pw)
                .battletag("AugDragon#2014").role(UserRole.MEMBER).build());

        log.info("[DataInitializer] 유저 생성 완료");

        // ─── 캐릭터 생성 ───────────────────────────────────────────
        // raidleader - 성기사 탱커
        characterRepository.save(UserCharacter.builder()
                .user(leader).server("아즈샤라")
                .characterName("팔라딘킹")
                .wowClass(WowClass.PALADIN).wowSpec(WowSpec.PROTECTION_PALADIN).isMain(true).build());

        // member1 - 죽음의 기사 탱커 (메인) + 전사 딜러 (부캐)
        characterRepository.save(UserCharacter.builder()
                .user(member1).server("아즈샤라")
                .characterName("다크나이트")
                .wowClass(WowClass.DEATH_KNIGHT).wowSpec(WowSpec.BLOOD).isMain(true).build());
        characterRepository.save(UserCharacter.builder()
                .user(member1).server("하이잘")
                .characterName("퓨리워리어")
                .wowClass(WowClass.WARRIOR).wowSpec(WowSpec.FURY).isMain(false).build());

        // member2 - 사제 힐러
        characterRepository.save(UserCharacter.builder()
                .user(member2).server("아즈샤라")
                .characterName("힐봇나인천")
                .wowClass(WowClass.PRIEST).wowSpec(WowSpec.HOLY_PRIEST).isMain(true).build());

        // member3 - 도적 딜러
        characterRepository.save(UserCharacter.builder()
                .user(member3).server("아즈샤라")
                .characterName("그림자도적")
                .wowClass(WowClass.ROGUE).wowSpec(WowSpec.SUBTLETY).isMain(true).build());

        // member4 - 마법사 딜러
        characterRepository.save(UserCharacter.builder()
                .user(member4).server("하이잘")
                .characterName("서리마법사")
                .wowClass(WowClass.MAGE).wowSpec(WowSpec.FROST_MAGE).isMain(true).build());

        // member5 - 드루이드 딜러
        characterRepository.save(UserCharacter.builder()
                .user(member5).server("줄진")
                .characterName("달빛치킨")
                .wowClass(WowClass.DRUID).wowSpec(WowSpec.BALANCE).isMain(true).build());

        // ─── 꽉 찬 레이드용 추가 캐릭터 (탱2/힐4/딜14) ──────────
        characterRepository.save(UserCharacter.builder().user(ironwall).server("아즈샤라").characterName("아이언월").wowClass(WowClass.WARRIOR).wowSpec(WowSpec.PROTECTION_WARRIOR).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(tank3).server("아즈샤라").characterName("공허수호").wowClass(WowClass.DEMON_HUNTER).wowSpec(WowSpec.VENGEANCE).isMain(true).build());

        characterRepository.save(UserCharacter.builder().user(heal2).server("아즈샤라").characterName("성광치유").wowClass(WowClass.PALADIN).wowSpec(WowSpec.HOLY_PALADIN).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(heal3).server("하이잘").characterName("안개직조").wowClass(WowClass.MONK).wowSpec(WowSpec.MISTWEAVER).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(heal4).server("줄진").characterName("자연치유").wowClass(WowClass.DRUID).wowSpec(WowSpec.RESTORATION_DRUID).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(heal5).server("아즈샤라").characterName("빛의수호").wowClass(WowClass.PRIEST).wowSpec(WowSpec.DISCIPLINE).isMain(true).build());

        characterRepository.save(UserCharacter.builder().user(dps1).server("아즈샤라").characterName("파멸사냥꾼").wowClass(WowClass.DEMON_HUNTER).wowSpec(WowSpec.HAVOC).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps2).server("하이잘").characterName("풍운격격").wowClass(WowClass.MONK).wowSpec(WowSpec.WINDWALKER).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps3).server("아즈샤라").characterName("화염비").wowClass(WowClass.MAGE).wowSpec(WowSpec.FIRE).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps4).server("줄진").characterName("고통술사").wowClass(WowClass.WARLOCK).wowSpec(WowSpec.AFFLICTION).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps5).server("아즈샤라").characterName("암흑사제").wowClass(WowClass.PRIEST).wowSpec(WowSpec.SHADOW).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps6).server("하이잘").characterName("분노전사").wowClass(WowClass.WARRIOR).wowSpec(WowSpec.FURY).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps7).server("아즈샤라").characterName("야수지배").wowClass(WowClass.HUNTER).wowSpec(WowSpec.BEAST_MASTERY).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps8).server("줄진").characterName("징벌성기").wowClass(WowClass.PALADIN).wowSpec(WowSpec.RETRIBUTION).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps9).server("아즈샤라").characterName("원소폭풍").wowClass(WowClass.SHAMAN).wowSpec(WowSpec.ELEMENTAL).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps10).server("하이잘").characterName("무법자").wowClass(WowClass.ROGUE).wowSpec(WowSpec.OUTLAW).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps11).server("아즈샤라").characterName("부정기사").wowClass(WowClass.DEATH_KNIGHT).wowSpec(WowSpec.UNHOLY).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps12).server("줄진").characterName("황폐용기").wowClass(WowClass.EVOKER).wowSpec(WowSpec.DEVASTATION).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps13).server("아즈샤라").characterName("사격수").wowClass(WowClass.HUNTER).wowSpec(WowSpec.MARKSMANSHIP).isMain(true).build());
        characterRepository.save(UserCharacter.builder().user(dps14).server("줄진").characterName("증강용기").wowClass(WowClass.EVOKER).wowSpec(WowSpec.AUGMENTATION).isMain(true).build());

        log.info("[DataInitializer] 캐릭터 생성 완료");

        // ─── 레이드 일정 생성 ──────────────────────────────────────
        // 1) 모집 중 - 공허첨탑 노말 (다음 주 토요일)
        RaidSchedule openRaidNormal = raidRepository.save(RaidSchedule.builder()
                .title("[노말] 공허첨탑 공격대 모집")
                .raidDate(LocalDateTime.now().plusDays(7).withHour(21).withMinute(0).withSecond(0))
                .difficulty(Difficulty.NORMAL)
                .maxTanks(2)
                .maxHealers(3)
                .maxDps(15)
                .notes("아이템 레벨 246 이상 / 초보 환영 / 디스코드 필참\n보스 순서: 전제군주 아베르지안 → 보라시우스 → 몰락한 왕 살라다르 → 바엘고어&에조라크 → 빛에 눈이 먼 선봉대 → 우주의 왕관")
                .status(RaidStatus.OPEN)
                .createdBy(leader)
                .build());

        // 2) 모집 중 - 공허첨탑 영웅 (2주 후 금요일)
        RaidSchedule openRaidHeroic = raidRepository.save(RaidSchedule.builder()
                .title("[영웅] 공허첨탑 영웅 공대 모집")
                .raidDate(LocalDateTime.now().plusDays(13).withHour(20).withMinute(30).withSecond(0))
                .difficulty(Difficulty.HEROIC)
                .maxTanks(2)
                .maxHealers(4)
                .maxDps(14)
                .notes("아이템 레벨 259 이상 / 노말 클리어 필수 / 파싱 우선 선발\n최종 보스 우주의 왕관(알레리아 윈드러너) 경험자 우대")
                .status(RaidStatus.OPEN)
                .createdBy(leader)
                .build());

        // 3) 마감 - 쿠엘탈라스 진격로 신화 (지난 주)
        RaidSchedule closedRaid = raidRepository.save(RaidSchedule.builder()
                .title("[신화] 쿠엘탈라스 진격로 신화 진행")
                .raidDate(LocalDateTime.now().minusDays(7).withHour(21).withMinute(0).withSecond(0))
                .difficulty(Difficulty.MYTHIC)
                .maxTanks(2)
                .maxHealers(4)
                .maxDps(14)
                .notes("신화 경험자 필수 / 워크로그 제출 요망\n보스: 알라르의 자손 벨로렌 → 한밤의 도래(르우라)")
                .status(RaidStatus.CLOSED)
                .createdBy(leader)
                .build());

        // 4) 모집 중 - 공허첨탑 신화 (3주 후 토요일) - 디스코드 링크 포함
        raidRepository.save(RaidSchedule.builder()
                .title("[신화] 공허첨탑 신화 도전 — 디스코드 필참")
                .raidDate(LocalDateTime.now().plusDays(21).withHour(20).withMinute(0).withSecond(0))
                .difficulty(Difficulty.MYTHIC)
                .maxTanks(2)
                .maxHealers(4)
                .maxDps(14)
                .notes("신화 경험자 우대 / 영웅 전 보스 클리어 필수\n파싱 기준: 딜러 75파센타일 이상 / 힐러 70파센타일 이상\n공략 디스코드에서 사전 숙지 후 참가 바랍니다.")
                .discordUrl("https://discord.gg/UdFwCf9kb")
                .status(RaidStatus.OPEN)
                .createdBy(leader)
                .build());

        log.info("[DataInitializer] 레이드 일정 4개 생성 완료");

        // ─── 신청 데이터 (노말 레이드) ────────────────────────────
        // 공격대장(팔라딘) 탱 신청 - CONFIRMED
        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidNormal)
                .user(leader)
                .server("아즈샤라")
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
                .server("아즈샤라")
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
                .server("하이잘")
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
                .server("아즈샤라")
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
                .server("렉사르")
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
                .server("헬스크림")
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
                .server("아즈샤라")
                .characterName("팔라딘킹")
                .wowClass(WowClass.PALADIN)
                .wowSpec(WowSpec.PROTECTION_PALADIN)
                .role(RaidRole.TANK)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        registrationRepository.save(Registration.builder()
                .raidSchedule(openRaidHeroic)
                .user(member3)
                .server("아즈샤라")
                .characterName("그림자도적")
                .wowClass(WowClass.ROGUE)
                .wowSpec(WowSpec.SUBTLETY)
                .role(RaidRole.DPS)
                .status(RegistrationStatus.CONFIRMED)
                .build());

        log.info("[DataInitializer] 신청 데이터 생성 완료");

        // ─── 꽉 찬 레이드 (탱2/힐4/딜14 = 20명 전원 CONFIRMED) ──
        RaidSchedule fullRaid = raidRepository.save(RaidSchedule.builder()
                .title("[영웅] 공허첨탑 풀파티 진행 (마감)")
                .raidDate(LocalDateTime.now().plusDays(3).withHour(20).withMinute(0).withSecond(0))
                .difficulty(Difficulty.HEROIC)
                .maxTanks(2)
                .maxHealers(4)
                .maxDps(14)
                .notes("정원이 꽉 찬 예시 레이드입니다.")
                .status(RaidStatus.OPEN)
                .createdBy(leader)
                .build());

        // 탱 2명
        for (Object[] entry : new Object[][]{
                {ironwall, "아즈샤라", "아이언월", WowClass.WARRIOR,      WowSpec.PROTECTION_WARRIOR, RaidRole.TANK},
                {tank3,    "하이잘",   "공허수호", WowClass.DEMON_HUNTER, WowSpec.VENGEANCE,          RaidRole.TANK},
        }) {
            registrationRepository.save(Registration.builder()
                    .raidSchedule(fullRaid).user((User) entry[0])
                    .server((String) entry[1]).characterName((String) entry[2])
                    .wowClass((WowClass) entry[3]).wowSpec((WowSpec) entry[4]).role((RaidRole) entry[5])
                    .status(RegistrationStatus.CONFIRMED).build());
        }
        // 힐 4명
        for (Object[] entry : new Object[][]{
                {heal2, "아즈샤라", "성광치유", WowClass.PALADIN, WowSpec.HOLY_PALADIN,      RaidRole.HEALER},
                {heal3, "렉사르",   "안개직조", WowClass.MONK,    WowSpec.MISTWEAVER,        RaidRole.HEALER},
                {heal4, "스톰레이지","자연치유", WowClass.DRUID,   WowSpec.RESTORATION_DRUID, RaidRole.HEALER},
                {heal5, "세나리우스","빛의수호", WowClass.PRIEST,  WowSpec.DISCIPLINE,        RaidRole.HEALER},
        }) {
            registrationRepository.save(Registration.builder()
                    .raidSchedule(fullRaid).user((User) entry[0])
                    .server((String) entry[1]).characterName((String) entry[2])
                    .wowClass((WowClass) entry[3]).wowSpec((WowSpec) entry[4]).role((RaidRole) entry[5])
                    .status(RegistrationStatus.CONFIRMED).build());
        }
        // 딜 14명
        for (Object[] entry : new Object[][]{
                {dps1,  "아즈샤라",  "파멸사냥꾼", WowClass.DEMON_HUNTER, WowSpec.HAVOC,         RaidRole.DPS},
                {dps2,  "하이잘",    "풍운격격",   WowClass.MONK,         WowSpec.WINDWALKER,    RaidRole.DPS},
                {dps3,  "렉사르",    "화염비",     WowClass.MAGE,         WowSpec.FIRE,          RaidRole.DPS},
                {dps4,  "와일드해머","고통술사",   WowClass.WARLOCK,      WowSpec.AFFLICTION,    RaidRole.DPS},
                {dps5,  "헬스크림",  "암흑사제",   WowClass.PRIEST,       WowSpec.SHADOW,        RaidRole.DPS},
                {dps6,  "아즈샤라",  "분노전사",   WowClass.WARRIOR,      WowSpec.FURY,          RaidRole.DPS},
                {dps7,  "스톰레이지","야수지배",   WowClass.HUNTER,       WowSpec.BEAST_MASTERY, RaidRole.DPS},
                {dps8,  "세나리우스","징벌성기",   WowClass.PALADIN,      WowSpec.RETRIBUTION,   RaidRole.DPS},
                {dps9,  "하이잘",    "원소폭풍",   WowClass.SHAMAN,       WowSpec.ELEMENTAL,     RaidRole.DPS},
                {dps10, "아즈샤라",  "무법자",     WowClass.ROGUE,        WowSpec.OUTLAW,        RaidRole.DPS},
                {dps11, "렉사르",    "부정기사",   WowClass.DEATH_KNIGHT, WowSpec.UNHOLY,        RaidRole.DPS},
                {dps12, "와일드해머","황폐용기",   WowClass.EVOKER,       WowSpec.DEVASTATION,   RaidRole.DPS},
                {dps13, "스톰레이지","사격수",     WowClass.HUNTER,       WowSpec.MARKSMANSHIP,  RaidRole.DPS},
                {dps14, "세나리우스","증강용기",   WowClass.EVOKER,       WowSpec.AUGMENTATION,  RaidRole.DPS},
        }) {
            registrationRepository.save(Registration.builder()
                    .raidSchedule(fullRaid).user((User) entry[0])
                    .server((String) entry[1]).characterName((String) entry[2])
                    .wowClass((WowClass) entry[3]).wowSpec((WowSpec) entry[4]).role((RaidRole) entry[5])
                    .status(RegistrationStatus.CONFIRMED).build());
        }
        log.info("[DataInitializer] 꽉 찬 레이드 데이터 생성 완료 (20명 CONFIRMED)");

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
                .title("[공지] 7월 레이드 일정 공개 - 공허첨탑 / 쿠엘탈라스 진격로")
                .content("""
                        7월 레이드 일정을 공개합니다.

                        • 7/5 (토) 21:00 - 노말 공허첨탑
                        • 7/12 (토) 20:30 - 영웅 공허첨탑
                        • 7/19 (토) 21:00 - 노말 공허첨탑 (2회차)
                        • 7/26 (토) 20:30 - 쿠엘탈라스 진격로 신화

                        꿈의 균열(1보스 카이메루스) 공략은 추후 일정 잡을 예정입니다.
                        신청은 레이드 일정 페이지에서 해주세요.
                        """)
                .author(admin)
                .build());

        postRepository.save(Post.builder()
                .boardType(BoardType.FREE)
                .title("쿠엘탈라스 진격로 신화 후기")
                .content("""
                        신화 쿠엘탈라스 진격로 드디어 한밤의 도래(르우라) 잡았습니다!!

                        2보스 르우라 패턴이 생각보다 빡세네요.
                        공허 균열 피하랴 불기둥 피하랴 정신없었지만 결국 클리어!
                        다들 수고 많으셨어요. 힐러분들 특히 고생하셨습니다 ㅠㅠ
                        다음엔 공허첨탑 신화 도전해봅시다!
                        """)
                .author(member1)
                .build());

        postRepository.save(Post.builder()
                .boardType(BoardType.FREE)
                .title("공허첨탑 노말 처음 신청했습니다 잘 부탁드려요!")
                .content("""
                        안녕하세요! 이번에 새로 가입한 달빛치킨입니다.

                        드루이드 균형 특성으로 딜러로 신청했는데
                        공허첨탑이 처음이라 많이 미숙할 수 있어요.
                        전제군주 아베르지안부터 차근차근 배워보겠습니다!

                        잘 부탁드립니다!
                        """)
                .author(member5)
                .build());

        postRepository.save(Post.builder()
                .boardType(BoardType.FREE)
                .title("서리 마법사 공허첨탑 딜 파싱 팁 공유")
                .content("""
                        서리 마법사로 공허첨탑 공략 팁 공유합니다.

                        1. 얼어붙기 - 아이시 베인스 유지 최우선
                        2. 한파 - 쿨타임마다 사용
                        3. 냉동 구체 - 얼어붙기 상태에서 사용하면 버프
                        4. 4보스 바엘고어&에조라크 - 듀얼보스라 타겟 전환 타이밍 주의
                        5. 최종 보스 우주의 왕관(알레리아) - 광역 공허 폭발 반드시 분산
                        6. 수석 마법사 버프 - 파티원과 겹치지 않게 조율

                        질문 있으신 분은 댓글로 달아주세요~
                        """)
                .author(member4)
                .build());

        log.info("[DataInitializer] 게시글 5개 생성 완료");
        log.info("[DataInitializer] ✅ 예시 데이터 삽입 완료!");
        log.info("[DataInitializer] 계정 목록 (비밀번호: password123)");
        log.info("[DataInitializer]   admin       - ADMIN");
        log.info("[DataInitializer]   raidleader  - RAID_LEADER");
        log.info("[DataInitializer]   darkknightzz - MEMBER (탱)");
        log.info("[DataInitializer]   healbot9000  - MEMBER (힐)");
        log.info("[DataInitializer]   shadowstab   - MEMBER (딜)");
        log.info("[DataInitializer]   frostmage    - MEMBER (딜)");
        log.info("[DataInitializer]   boomchicken  - MEMBER (딜)");
        log.info("[DataInitializer] 꽉 찬 레이드 전용 유저 (탱2/힐4/딜14):");
        log.info("[DataInitializer]   ironwall/voidtank (탱), holylight/mistweave/restodruid/lightwarden (힐)");
        log.info("[DataInitializer]   havocblade/windpunch/firemage99/afflockz/shadowpriest/furywarrior/beastmaster/retpaladin/elemental99/outlaw99/unholy99/devastation/arcaneshot/augdragon (딜)");
    }
}
