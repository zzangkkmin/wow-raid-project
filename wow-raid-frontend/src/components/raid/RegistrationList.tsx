import type { RegistrationResponse } from '@/types/registration.types'
import { RaidRole, RegistrationStatus } from '@/types/enums'
import { WOW_SPEC_KR, WOW_CLASS_COLOR, RAID_ROLE_KR } from '@/utils/wowClass.util'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'

interface Props {
  registrations: RegistrationResponse[]
}

const ROLE_ORDER = [RaidRole.TANK, RaidRole.HEALER, RaidRole.DPS]

const ROLE_HEADER: Record<RaidRole, { border: string; text: string; bg: string }> = {
  [RaidRole.TANK]:   { border: 'border-blue-700',  text: 'text-blue-400',  bg: 'bg-blue-950/40'  },
  [RaidRole.HEALER]: { border: 'border-green-700', text: 'text-green-400', bg: 'bg-green-950/40' },
  [RaidRole.DPS]:    { border: 'border-red-800',   text: 'text-red-400',   bg: 'bg-red-950/30'   },
}

function SpecBadge({ r }: { r: RegistrationResponse }) {
  const color = WOW_CLASS_COLOR[r.wowClass]
  const absent = r.status === RegistrationStatus.ABSENT
  return (
    <div
      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-gray-800 border border-gray-700/60 ${absent ? 'opacity-40' : ''}`}
    >
      <span className="text-white text-xs font-medium truncate">
        {r.characterName}
        {r.isGuest && <span className="ml-1 text-gray-500 text-[10px]">비회</span>}
      </span>
      <span
        className="text-[11px] font-semibold shrink-0 px-1.5 py-0.5 rounded"
        style={{ color, backgroundColor: `${color}22` }}
        title={r.absenceReason ? `불참: ${r.absenceReason}` : undefined}
      >
        {WOW_SPEC_KR[r.wowSpec]}
        {r.status === RegistrationStatus.WAITING && <span className="ml-1 text-yellow-400">대기</span>}
        {absent && <span className="ml-1 text-red-400">불참</span>}
      </span>
    </div>
  )
}

export default function RegistrationList({ registrations }: Props) {
  const byRole = ROLE_ORDER.reduce<Record<RaidRole, RegistrationResponse[]>>(
    (acc, role) => {
      acc[role] = registrations.filter((r) => r.role === role)
      return acc
    },
    { [RaidRole.TANK]: [], [RaidRole.HEALER]: [], [RaidRole.DPS]: [] },
  )

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-3">신청자 목록</h2>
      <div className="space-y-3">
        {ROLE_ORDER.map((role) => {
          const { border, text, bg } = ROLE_HEADER[role]
          const cols = role === RaidRole.DPS ? 'grid-cols-3' : 'grid-cols-2'
          return (
            <div key={role} className={`rounded-xl border ${border} ${bg} overflow-hidden`}>
              {/* 역할 헤더 */}
              <div className={`flex items-center gap-2 px-3 py-2 border-b ${border} ${text}`}>
                <RaidRoleIcon role={role} size="sm" />
                <span className="text-sm font-semibold">{RAID_ROLE_KR[role]}</span>
                <span className="text-gray-500 font-normal text-xs">({byRole[role].length}명)</span>
              </div>

              {byRole[role].length === 0 ? (
                <p className="text-gray-600 text-xs px-3 py-2">신청자 없음</p>
              ) : (
                <div className={`grid ${cols} gap-1.5 p-2`}>
                  {byRole[role].map((r) => (
                    <SpecBadge key={r.id} r={r} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
