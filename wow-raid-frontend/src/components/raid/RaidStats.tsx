import type { RaidStatsResponse, RoleStats } from '@/types/raid.types'
import type { RegistrationResponse } from '@/types/registration.types'
import { WowClass, RaidRole, RegistrationStatus } from '@/types/enums'
import { WOW_CLASS_KR, WOW_CLASS_COLOR, WOW_SPEC_KR, RAID_ROLE_KR, REGISTRATION_STATUS_KR } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  stats: RaidStatsResponse
  registrations: RegistrationResponse[]
}

// ── 직업 도넛 차트 (Recharts) ────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; count: number; color: string } }[] }) {
  if (!active || !payload?.length) return null
  const { name, count, color } = payload[0].payload
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <span style={{ color }} className="font-semibold">{name}</span>
      <span className="text-gray-300 ml-2">{count}명</span>
    </div>
  )
}

const RADIAN = Math.PI / 180

function OuterLabel({ cx, cy, midAngle, outerRadius, name, count }: {
  cx: number; cy: number; midAngle: number; outerRadius: number; name: string; count: number
  [key: string]: unknown
}) {
  const radius = outerRadius + 28
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  const anchor = x > cx ? 'start' : 'end'
  return (
    <text x={x} y={y} textAnchor={anchor} fill="#9ca3af" fontSize={11}>
      <tspan x={x} dy="0">{name}</tspan>
      <tspan x={x} dy="14" fill="#6b7280">{count}명</tspan>
    </text>
  )
}


function ClassDonut({ roleStats }: { roleStats: RoleStats }) {
  const data = Object.values(WowClass)
    .map((cls) => ({ cls, name: WOW_CLASS_KR[cls], count: roleStats.classCounts[cls] ?? 0, color: WOW_CLASS_COLOR[cls] }))
    .filter((s) => s.count > 0)

  const total = data.reduce((sum, s) => sum + s.count, 0)

  if (total === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-600 text-xs">신청자 없음</div>
    )
  }

  const CenterLabel = ({ viewBox }: { viewBox?: { cx: number; cy: number } }) => {
    const { cx = 0, cy = 0 } = viewBox ?? {}
    return (
      <>
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={20} fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280" fontSize={11}>/ {roleStats.maxSlots}</text>
      </>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 24, right: 48, bottom: 24, left: 48 }}>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="38%"
            outerRadius="55%"
            paddingAngle={2}
            strokeWidth={0}
            label={(props) => <OuterLabel {...props} />}
            labelLine={{ stroke: '#4b5563', strokeWidth: 1 }}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {/* 중앙 총원 표시 */}
          <text x="50%" y="44%" textAnchor="middle" fill="white" fontSize={20} fontWeight="bold" dominantBaseline="middle">{total}</text>
          <text x="50%" y="56%" textAnchor="middle" fill="#6b7280" fontSize={11} dominantBaseline="middle">/ {roleStats.maxSlots}</text>
        </PieChart>
      </ResponsiveContainer>
    </div>
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
        <div className={`grid gap-1 ${role === RaidRole.DPS ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {roleRegistrations.map((r) => (
            <div
              key={r.id}
              title={
                r.status === RegistrationStatus.CONFIRMED ? '확정'
                : r.status === RegistrationStatus.WAITING ? '대기 중'
                : `불참${r.absenceReason ? `: ${r.absenceReason}` : ''}`
              }
              className={`flex items-center justify-between gap-1.5 px-2 py-1.5 bg-gray-800 rounded-md ${
                r.status === RegistrationStatus.ABSENT ? 'opacity-40' : ''
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  r.status === RegistrationStatus.CONFIRMED ? 'bg-green-400'
                  : r.status === RegistrationStatus.WAITING ? 'bg-yellow-400'
                  : 'bg-red-500'
                }`} />
                <span className="text-white text-xs font-medium truncate">
                  {r.characterName}
                  {r.isGuest && <span className="ml-0.5 text-gray-500 text-[9px]">비회</span>}
                </span>
              </div>
              <span
                className="text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded"
                style={{ color: WOW_CLASS_COLOR[r.wowClass], backgroundColor: `${WOW_CLASS_COLOR[r.wowClass]}22` }}
              >
                {WOW_SPEC_KR[r.wowSpec]}
              </span>
            </div>
          ))}
        </div>
      )}

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

      {/* 직업 분포 도넛 카드 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
        <p className="text-sm text-gray-400 font-medium mb-4">직업 분포</p>
        <div className="grid grid-cols-3 gap-4">
          {ROLE_ORDER.map((role) => {
            const roleStats = getRoleStats(stats, role)
            return (
              <div key={role} className="flex flex-col items-center gap-2">
                <span className={`text-xs font-semibold ${ROLE_TEXT[role]}`}>{RAID_ROLE_KR[role]}</span>
                <ClassDonut roleStats={roleStats} />
              </div>
            )
          })}
        </div>
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
