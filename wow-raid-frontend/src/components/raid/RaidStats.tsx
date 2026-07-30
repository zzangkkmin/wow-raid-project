import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { RaidStatsResponse, RoleStats } from '@/types/raid.types'
import type { RegistrationResponse } from '@/types/registration.types'
import { WowClass, RaidRole, RegistrationStatus } from '@/types/enums'
import { WOW_CLASS_KR, WOW_CLASS_COLOR, WOW_SPEC_KR, RAID_ROLE_KR, REGISTRATION_STATUS_KR, SPEC_DPS_TYPE } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Settings } from 'lucide-react'
import GuestActionModal from '@/components/registration/GuestActionModal'
import { registrationApi, guestRegistrationApi } from '@/api/registration.api'

interface Props {
  raidId: string
  isClosed: boolean
  isOwner: boolean
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

const STATUS_OPTIONS = [
  { value: RegistrationStatus.CONFIRMED, label: '확정', dot: 'bg-green-400' },
  { value: RegistrationStatus.WAITING,   label: '대기', dot: 'bg-yellow-400' },
  { value: RegistrationStatus.ABSENT,    label: '불참', dot: 'bg-red-500' },
]

function StatusDot({ reg, raidId, isOwner }: { reg: RegistrationResponse; raidId: string; isOwner: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const mutation = useMutation({
    mutationFn: (status: RegistrationStatus) =>
      reg.isGuest
        ? guestRegistrationApi.changeStatus(raidId, reg.id, status)
        : registrationApi.changeStatus(raidId, reg.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raid', raidId] })
      setOpen(false)
    },
  })

  const dotColor = reg.status === RegistrationStatus.CONFIRMED ? 'bg-green-400'
    : reg.status === RegistrationStatus.WAITING ? 'bg-yellow-400'
    : 'bg-red-500'

  if (!isOwner) {
    return <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="상태 변경"
        className={`w-2 h-2 rounded-full block hover:ring-2 hover:ring-white/30 transition-all ${dotColor}`}
      />
      {open && (
        <div className="absolute left-0 top-3 z-20 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden w-16">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => mutation.mutate(opt.value)}
              disabled={mutation.isPending || reg.status === opt.value}
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] hover:bg-gray-700 transition-colors disabled:opacity-40 ${
                reg.status === opt.value ? 'text-white' : 'text-gray-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RoleCard({
  role,
  roleStats,
  roleRegistrations,
  raidId,
  isClosed,
  isOwner,
}: {
  role: RaidRole
  roleStats: RoleStats
  roleRegistrations: RegistrationResponse[]
  raidId: string
  isClosed: boolean
  isOwner: boolean
}) {
  const [guestTarget, setGuestTarget] = useState<RegistrationResponse | null>(null)

  const fillPct = roleStats.maxSlots > 0
    ? Math.min(100, Math.round((roleStats.confirmed / roleStats.maxSlots) * 100))
    : 0

  const confirmedRegs = roleRegistrations.filter((r) => r.status === RegistrationStatus.CONFIRMED)
  const meleeCount  = role === RaidRole.DPS ? confirmedRegs.filter((r) => SPEC_DPS_TYPE[r.wowSpec] === 'MELEE').length : 0
  const rangedCount = role === RaidRole.DPS ? confirmedRegs.filter((r) => SPEC_DPS_TYPE[r.wowSpec] === 'RANGED').length : 0

  return (
    <div className={`bg-gray-900 border rounded-2xl p-5 flex flex-col gap-4 ${ROLE_BORDER[role]}`}>

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <RaidRoleIcon role={role} size="md" />
          <span className={`font-bold ${ROLE_TEXT[role]}`}>{RAID_ROLE_KR[role]}</span>
          {role === RaidRole.DPS && (
            <>
              <span className="text-gray-600 text-xs">·</span>
              <span className="text-[11px] text-orange-400">근딜 {meleeCount}</span>
              <span className="text-gray-600 text-[11px]">·</span>
              <span className="text-[11px] text-sky-400">원딜 {rangedCount}</span>
            </>
          )}
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
        <div className={`grid gap-1 ${role === RaidRole.DPS ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {roleRegistrations.map((r) => (
            <div
              key={r.id}
              title={[
                r.isGuest ? `${r.displayName} (비회원)` : r.displayName,
                r.status === RegistrationStatus.CONFIRMED ? '확정'
                : r.status === RegistrationStatus.WAITING ? '대기 중'
                : `불참${r.absenceReason ? `: ${r.absenceReason}` : ''}`,
              ].join(' · ')}
              className={`flex items-center justify-between gap-1.5 px-2 py-1.5 bg-gray-800 rounded-md ${
                r.status === RegistrationStatus.ABSENT ? 'opacity-40' : ''
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <StatusDot reg={r} raidId={raidId} isOwner={isOwner} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-white text-xs font-medium truncate">{r.characterName}</span>
                    {r.isGuest && <span className="text-gray-500 text-[9px] shrink-0">(비회원)</span>}
                  </div>
                  {r.server && (
                    <span className="text-[10px] text-gray-500 leading-none truncate">{r.server}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ color: WOW_CLASS_COLOR[r.wowClass], backgroundColor: `${WOW_CLASS_COLOR[r.wowClass]}22` }}
                >
                  {WOW_SPEC_KR[r.wowSpec]}
                </span>
                {r.isGuest && !isClosed && (
                  <button
                    onClick={() => setGuestTarget(r)}
                    className="text-gray-600 hover:text-gray-300 transition-colors"
                    title="비회원 신청 관리"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {guestTarget && (
        <GuestActionModal
          raidId={raidId}
          registration={guestTarget}
          onClose={() => setGuestTarget(null)}
        />
      )}

    </div>
  )
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────────────

export default function RaidStats({ raidId, isClosed, isOwner, stats, registrations }: Props) {
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

      <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_6fr] gap-4">
        {ROLE_ORDER.map((role) => (
          <RoleCard
            key={role}
            role={role}
            roleStats={getRoleStats(stats, role)}
            roleRegistrations={registrations.filter((r) => r.role === role)}
            raidId={raidId}
            isClosed={isClosed}
            isOwner={isOwner}
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
