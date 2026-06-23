import { WowClass, WowSpec, RaidRole, Difficulty, RegistrationStatus } from '@/types/enums'

const ICON_BASE = 'https://wow.zamimg.com/images/wow/icons'
export function wowIconUrl(iconName: string, size: 'small' | 'medium' | 'large' = 'medium') {
  return `${ICON_BASE}/${size}/${iconName}.jpg`
}

export const WOW_CLASS_ICON: Record<WowClass, string> = {
  [WowClass.WARRIOR]:      'classicon_warrior',
  [WowClass.PALADIN]:      'classicon_paladin',
  [WowClass.HUNTER]:       'classicon_hunter',
  [WowClass.ROGUE]:        'classicon_rogue',
  [WowClass.PRIEST]:       'classicon_priest',
  [WowClass.DEATH_KNIGHT]: 'classicon_deathknight',
  [WowClass.SHAMAN]:       'classicon_shaman',
  [WowClass.MAGE]:         'classicon_mage',
  [WowClass.WARLOCK]:      'classicon_warlock',
  [WowClass.MONK]:         'classicon_monk',
  [WowClass.DRUID]:        'classicon_druid',
  [WowClass.DEMON_HUNTER]: 'classicon_demonhunter',
  [WowClass.EVOKER]:       'classicon_evoker',
}

export const RAID_ROLE_ICON: Record<RaidRole, string> = {
  [RaidRole.TANK]:   'ability_warrior_defensivestance',
  [RaidRole.HEALER]: 'spell_holy_flashheal',
  [RaidRole.DPS]:    'ability_dualwield',
}

export const WOW_CLASS_KR: Record<WowClass, string> = {
  [WowClass.WARRIOR]: '전사',
  [WowClass.PALADIN]: '성기사',
  [WowClass.HUNTER]: '사냥꾼',
  [WowClass.ROGUE]: '도적',
  [WowClass.PRIEST]: '사제',
  [WowClass.DEATH_KNIGHT]: '죽음의 기사',
  [WowClass.SHAMAN]: '주술사',
  [WowClass.MAGE]: '마법사',
  [WowClass.WARLOCK]: '흑마법사',
  [WowClass.MONK]: '수도사',
  [WowClass.DRUID]: '드루이드',
  [WowClass.DEMON_HUNTER]: '악마사냥꾼',
  [WowClass.EVOKER]: '기원사',
}

export const WOW_SPEC_KR: Record<WowSpec, string> = {
  [WowSpec.ARMS]: '무기', [WowSpec.FURY]: '분노', [WowSpec.PROTECTION_WARRIOR]: '방어',
  [WowSpec.HOLY_PALADIN]: '신성', [WowSpec.PROTECTION_PALADIN]: '보호', [WowSpec.RETRIBUTION]: '징벌',
  [WowSpec.BEAST_MASTERY]: '야수', [WowSpec.MARKSMANSHIP]: '사격', [WowSpec.SURVIVAL]: '생존',
  [WowSpec.ASSASSINATION]: '암살', [WowSpec.OUTLAW]: '무법', [WowSpec.SUBTLETY]: '잠행',
  [WowSpec.DISCIPLINE]: '수양', [WowSpec.HOLY_PRIEST]: '신성', [WowSpec.SHADOW]: '암흑',
  [WowSpec.BLOOD]: '혈기', [WowSpec.FROST_DK]: '냉기', [WowSpec.UNHOLY]: '부정',
  [WowSpec.ELEMENTAL]: '정기', [WowSpec.ENHANCEMENT]: '고양', [WowSpec.RESTORATION_SHAMAN]: '복원',
  [WowSpec.ARCANE]: '비전', [WowSpec.FIRE]: '화염', [WowSpec.FROST_MAGE]: '냉기',
  [WowSpec.AFFLICTION]: '고통', [WowSpec.DEMONOLOGY]: '악마', [WowSpec.DESTRUCTION]: '파괴',
  [WowSpec.BREWMASTER]: '양조', [WowSpec.MISTWEAVER]: '운무', [WowSpec.WINDWALKER]: '풍운',
  [WowSpec.BALANCE]: '조화', [WowSpec.FERAL]: '야성', [WowSpec.GUARDIAN]: '수호', [WowSpec.RESTORATION_DRUID]: '회복',
  [WowSpec.HAVOC]: '파멸', [WowSpec.VENGEANCE]: '복수', [WowSpec.DEVOURER]: '포식',
  [WowSpec.DEVASTATION]: '황폐', [WowSpec.PRESERVATION]: '보존', [WowSpec.AUGMENTATION]: '증강',
}

export const RAID_ROLE_KR: Record<RaidRole, string> = {
  [RaidRole.TANK]: '탱커',
  [RaidRole.HEALER]: '힐러',
  [RaidRole.DPS]: '딜러',
}

export const DIFFICULTY_KR: Record<Difficulty, string> = {
  [Difficulty.NORMAL]: '일반',
  [Difficulty.HEROIC]: '영웅',
  [Difficulty.MYTHIC]: '신화',
}

export const REGISTRATION_STATUS_KR: Record<RegistrationStatus, string> = {
  [RegistrationStatus.CONFIRMED]: '확정',
  [RegistrationStatus.WAITING]: '대기',
  [RegistrationStatus.ABSENT]: '불참',
}

// 직업별 클래스 색상 (WoW 공식 색상)
export const WOW_CLASS_COLOR: Record<WowClass, string> = {
  [WowClass.WARRIOR]: '#C79C6E',
  [WowClass.PALADIN]: '#F58CBA',
  [WowClass.HUNTER]: '#ABD473',
  [WowClass.ROGUE]: '#FFF569',
  [WowClass.PRIEST]: '#FFFFFF',
  [WowClass.DEATH_KNIGHT]: '#C41F3B',
  [WowClass.SHAMAN]: '#0070DE',
  [WowClass.MAGE]: '#69CCF0',
  [WowClass.WARLOCK]: '#9482C9',
  [WowClass.MONK]: '#00FF96',
  [WowClass.DRUID]: '#FF7D0A',
  [WowClass.DEMON_HUNTER]: '#A330C9',
  [WowClass.EVOKER]: '#33937F',
}

// 특성 → 역할 자동 매핑
export const SPEC_ROLE: Record<WowSpec, RaidRole> = {
  // 전사
  [WowSpec.ARMS]: RaidRole.DPS, [WowSpec.FURY]: RaidRole.DPS,
  [WowSpec.PROTECTION_WARRIOR]: RaidRole.TANK,
  // 성기사
  [WowSpec.HOLY_PALADIN]: RaidRole.HEALER,
  [WowSpec.PROTECTION_PALADIN]: RaidRole.TANK,
  [WowSpec.RETRIBUTION]: RaidRole.DPS,
  // 사냥꾼
  [WowSpec.BEAST_MASTERY]: RaidRole.DPS, [WowSpec.MARKSMANSHIP]: RaidRole.DPS,
  [WowSpec.SURVIVAL]: RaidRole.DPS,
  // 도적
  [WowSpec.ASSASSINATION]: RaidRole.DPS, [WowSpec.OUTLAW]: RaidRole.DPS,
  [WowSpec.SUBTLETY]: RaidRole.DPS,
  // 사제
  [WowSpec.DISCIPLINE]: RaidRole.HEALER, [WowSpec.HOLY_PRIEST]: RaidRole.HEALER,
  [WowSpec.SHADOW]: RaidRole.DPS,
  // 죽음의 기사
  [WowSpec.BLOOD]: RaidRole.TANK,
  [WowSpec.FROST_DK]: RaidRole.DPS, [WowSpec.UNHOLY]: RaidRole.DPS,
  // 주술사
  [WowSpec.ELEMENTAL]: RaidRole.DPS, [WowSpec.ENHANCEMENT]: RaidRole.DPS,
  [WowSpec.RESTORATION_SHAMAN]: RaidRole.HEALER,
  // 마법사
  [WowSpec.ARCANE]: RaidRole.DPS, [WowSpec.FIRE]: RaidRole.DPS,
  [WowSpec.FROST_MAGE]: RaidRole.DPS,
  // 흑마법사
  [WowSpec.AFFLICTION]: RaidRole.DPS, [WowSpec.DEMONOLOGY]: RaidRole.DPS,
  [WowSpec.DESTRUCTION]: RaidRole.DPS,
  // 수도사
  [WowSpec.BREWMASTER]: RaidRole.TANK, [WowSpec.MISTWEAVER]: RaidRole.HEALER,
  [WowSpec.WINDWALKER]: RaidRole.DPS,
  // 드루이드
  [WowSpec.BALANCE]: RaidRole.DPS, [WowSpec.FERAL]: RaidRole.DPS,
  [WowSpec.GUARDIAN]: RaidRole.TANK, [WowSpec.RESTORATION_DRUID]: RaidRole.HEALER,
  // 악마사냥꾼
  [WowSpec.HAVOC]: RaidRole.DPS, [WowSpec.VENGEANCE]: RaidRole.TANK,
  [WowSpec.DEVOURER]: RaidRole.DPS,
  // 기원사
  [WowSpec.DEVASTATION]: RaidRole.DPS, [WowSpec.PRESERVATION]: RaidRole.HEALER,
  [WowSpec.AUGMENTATION]: RaidRole.DPS,
}

// 직업별 소속 스펙 목록
export const CLASS_SPECS: Record<WowClass, WowSpec[]> = {
  [WowClass.WARRIOR]: [WowSpec.ARMS, WowSpec.FURY, WowSpec.PROTECTION_WARRIOR],
  [WowClass.PALADIN]: [WowSpec.HOLY_PALADIN, WowSpec.PROTECTION_PALADIN, WowSpec.RETRIBUTION],
  [WowClass.HUNTER]: [WowSpec.BEAST_MASTERY, WowSpec.MARKSMANSHIP, WowSpec.SURVIVAL],
  [WowClass.ROGUE]: [WowSpec.ASSASSINATION, WowSpec.OUTLAW, WowSpec.SUBTLETY],
  [WowClass.PRIEST]: [WowSpec.DISCIPLINE, WowSpec.HOLY_PRIEST, WowSpec.SHADOW],
  [WowClass.DEATH_KNIGHT]: [WowSpec.BLOOD, WowSpec.FROST_DK, WowSpec.UNHOLY],
  [WowClass.SHAMAN]: [WowSpec.ELEMENTAL, WowSpec.ENHANCEMENT, WowSpec.RESTORATION_SHAMAN],
  [WowClass.MAGE]: [WowSpec.ARCANE, WowSpec.FIRE, WowSpec.FROST_MAGE],
  [WowClass.WARLOCK]: [WowSpec.AFFLICTION, WowSpec.DEMONOLOGY, WowSpec.DESTRUCTION],
  [WowClass.MONK]: [WowSpec.BREWMASTER, WowSpec.MISTWEAVER, WowSpec.WINDWALKER],
  [WowClass.DRUID]: [WowSpec.BALANCE, WowSpec.FERAL, WowSpec.GUARDIAN, WowSpec.RESTORATION_DRUID],
  [WowClass.DEMON_HUNTER]: [WowSpec.HAVOC, WowSpec.VENGEANCE, WowSpec.DEVOURER],
  [WowClass.EVOKER]: [WowSpec.DEVASTATION, WowSpec.PRESERVATION, WowSpec.AUGMENTATION],
}
