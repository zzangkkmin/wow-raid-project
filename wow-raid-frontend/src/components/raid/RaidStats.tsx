import type { RaidStatsResponse, RoleStats } from '@/types/raid.types'
import type { RegistrationResponse } from '@/types/registration.types'
import { WowClass, RaidRole, RegistrationStatus } from '@/types/enums'
import { WOW_CLASS_KR, WOW_CLASS_COLOR, WOW_SPEC_KR, RAID_ROLE_KR, REGISTRATION_STATUS_KR } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'

interface Props {
  stats: RaidStatsResponse
  registrations: RegistrationResponse[]
}

// ── SVG 헬퍼 ────────────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number,
): string {
  const GAP = 2
  const s = startDeg + GAP / 2
  const e = endDeg - GAP / 2
  if (e - s < 0.1) return ''
  const o1 = polarToCartesian(cx, cy, outerR, s)
  const o2 = polarToCartesian(cx, cy, outerR, e)
  const i1 = polarToCartesian(cx, cy, innerR, s)
  const i2 = polarToCartesian(cx, cy, innerR, e)
  const large = e - s > 180 ? 1 : 0
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ')
}

// ── 직업 도넛 차트 ───────────────────────────────────────────────────────────

function ClassDonut({ roleStats }: { roleStats: RoleStats }) {
  const cx = 60, cy = 60, outerR = 52, innerR = 32

  const segments = Object.values(WowClass)
    .map((cls) => ({ cls, count: roleStats.classCounts[cls] ?? 0, color: WOW_CLASS_COLOR[cls] }))
    .filter((s) => s.count > 0)

  const total = segments.reduce((sum, s) => sum + s.count, 0)

  if (total === 0) {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28">
        <circle cx={cx} cy={cy} r={outerR} fill="#374151" opacity="0.3" />
        <circle cx={cx} cy={cy} r={innerR} fill="#111827" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#4b5563" fontSize="11">없음</text>
      </svg>
    )
  }

  let cursor = 0
  const slices = segments.map((seg) => {
    const span = (seg.count / total) * 360
    const sl = { ...seg, startDeg: cursor, endDeg: cursor + span }
    cursor += span
    return sl
  })

  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28">
      {slices.map((sl, i) => {
        const d = arcPath(cx, cy, outerR, innerR, sl.startDeg, sl.endDeg)
        return d ? <path key={i} d={d} fill={sl.color} /> : null
      })}
      <circle cx={cx} cy={cy} r={innerR - 1} fill="#111827" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
        {total}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="#6b7280" fontSize="10">
        / {roleStats.maxSlots}
      </text>
    </svg>
  )
}

// ── 상수 ────────────────────────────────────────────────────────────────────

const ROLE_ORDER = [RaidRole.TANK, RaidRole.HEALER, RaidRole.DPS] as const

const ROLE_BORDER: Record<RaidRole, string> = {
  [RaidRole.TANK]:   'border-blue-800',
  [RaidRole.HEALER]: 'border-green-800',
  [RaidRole.DPS]:    'border-red-800',
}
const ROLE_TEXT: Record<RaidRole, string> = {
  [RaidRole.TANK]:   'text-blue-400',
  [RaidRole.HEALER]: 'text-green-400',
  [RaidRole.DPS]:    'text-red-400',
}
const ROLE_BAR: Record<RaidRole, string> = {
  [RaidRole.TANK]:   'bg-blue-500',
  [RaidRole.HEALER]: 'bg-green-500',
  [RaidRole.DPS]:    'bg-red-500',
}
const STATUS_STYLE: Record<RegistrationStatus, string> = {
  [RegistrationStatus.CONFIRMED]: 'bg-green-900/60 text-green-400',
  [RegistrationStatus.WAITING]:   'bg-yellow-900/60 text-yellow-400',
  [RegistrationStatus.ABSENT]:    'bg-red-900/60 text-red-400',
}

function getRoleStats(stats: RaidStatsResponse, role: RaidRole): RoleStats {
  if (role === RaidRole.TANK)   return stats.tanks
  if (role === RaidRole.HEALER) return stats.healers
  return stats.dps
}

// ── 역할 카드 ────────────────────────────────────────────────────────────────

function RoleCard({
  role,
  roleStats,
  roleRegistrations,
}: {
  role: RaidRole
  roleStats: RoleStats
  roleRegistrations: RegistrationResponse[]
}) {
  const presentClasses = Object.values(WowClass)
    .map((cls) => ({ cls, count: roleStats.classCounts[cls] ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)

  const fillPct = roleStats.maxSlots > 0
    ? Math.min(100, Math.round((roleStats.confirmed / roleStats.maxSlots) * 100))
    : 0

  return (
    <div className={`bg-gray-900 border rounded-2xl p-5 flex flex-col gap-4 ${ROLE_BORDER[role]}`}>

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RaidRoleIcon role={role} size="md" />
          <span className={`font-bold ${ROLE_TEXT[role]}`}>{RAID_ROLE_KR[role]}</span>
        </div>
        <span className="text-sm text-gray-400">
          <span className="text-white font-bold">{roleStats.confirmed}</span>
          <span className="text-gray-600"> / {roleStats.maxSlots}</span>
          {roleStats.waiting > 0 && (
            <span className="text-yellow-500 ml-1 text-xs">(대기 {roleStats.waiting})</span>
          )}
        </span>
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 bg-gray-700 rounded-full -mt-2">
        <div
          className={`h-full rounded-full transition-all ${ROLE_BAR[role]}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {/* 신청자 목록 */}
      {roleRegistrations.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-1">신청자 없음</p>
      ) : (
        <div className="space-y-1.5">
          {roleRegistrations.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg ${
                r.status === RegistrationStatus.ABSENT ? 'opacity-40' : ''
              }`}
            >
              <WowClassIcon wowClass={r.wowClass} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-xs font-medium truncate">{r.characterName}</span>
                  {r.isGuest && (
                    <span className="text-[10px] text-gray-500 bg-gray-700 px-1 rounded shrink-0">비회원</span>
                  )}
                </div>
                <span className="text-[10px]" style={{ color: WOW_CLASS_COLOR[r.wowClass] }}>
                  {WOW_CLASS_KR[r.wowClass]} · {WOW_SPEC_KR[r.wowSpec]}
                </span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[r.status]}`}>
                {REGISTRATION_STATUS_KR[r.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 구분선 */}
      <div className="border-t border-gray-800" />

      {/* 도넛 차트 + 범례 */}
      <div className="flex items-center gap-4">
        <ClassDonut roleStats={roleStats} />

        {presentClasses.length > 0 ? (
          <div className="flex-1 space-y-1.5">
            {presentClasses.map(({ cls, count }) => (
              <div key={cls} className="flex items-center gap-1.5">
                <WowClassIcon wowClass={cls} size="sm" />
                <span className="text-xs flex-1 truncate" style={{ color: WOW_CLASS_COLOR[cls] }}>
                  {WOW_CLASS_KR[cls]}
                </span>
                <span className="text-xs text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600 flex-1">직업 없음</p>
        )}
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────────────

export default function RaidStats({ stats, registrations }: Props) {
  const allClasses = Object.values(WowClass)

  const overallMissing = allClasses.filter((cls) => {
    const t = stats.tanks.classCounts[cls] ?? 0
    const h = stats.healers.classCounts[cls] ?? 0
    const d = stats.dps.classCounts[cls] ?? 0
    return t + h + d === 0
  })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">공격대 구성</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLE_ORDER.map((role) => (
          <RoleCard
            key={role}
            role={role}
            roleStats={getRoleStats(stats, role)}
            roleRegistrations={registrations.filter((r) => r.role === role)}
          />
        ))}
      </div>

      {overallMissing.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
          <p className="text-sm text-gray-400 font-medium mb-3">레이드 미보유 직업</p>
          <div className="flex flex-wrap gap-2">
            {overallMissing.map((cls) => (
              <div
                key={cls}
                className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded-lg border border-gray-700"
              >
                <WowClassIcon wowClass={cls} size="sm" />
                <span className="text-xs" style={{ color: WOW_CLASS_COLOR[cls] }}>
                  {WOW_CLASS_KR[cls]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
