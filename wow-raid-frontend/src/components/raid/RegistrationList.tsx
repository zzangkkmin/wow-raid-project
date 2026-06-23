import type { RegistrationResponse } from '@/types/registration.types'
import { RaidRole, RegistrationStatus } from '@/types/enums'
import { WOW_CLASS_KR, WOW_SPEC_KR, WOW_CLASS_COLOR, RAID_ROLE_KR, REGISTRATION_STATUS_KR } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'

interface Props {
  registrations: RegistrationResponse[]
}

const STATUS_STYLE: Record<RegistrationStatus, string> = {
  [RegistrationStatus.CONFIRMED]: 'bg-green-900/60 text-green-400',
  [RegistrationStatus.WAITING]:   'bg-yellow-900/60 text-yellow-400',
  [RegistrationStatus.ABSENT]:    'bg-red-900/60 text-red-400',
}

const ROLE_LABEL_COLOR: Record<RaidRole, string> = {
  [RaidRole.TANK]:   'text-blue-400',
  [RaidRole.HEALER]: 'text-green-400',
  [RaidRole.DPS]:    'text-red-400',
}

const ROLE_ORDER = [RaidRole.TANK, RaidRole.HEALER, RaidRole.DPS]

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
      <div className="space-y-5">
        {ROLE_ORDER.map((role) => (
          <div key={role}>
            {/* 역할 헤더 */}
            <div className={`flex items-center gap-2 mb-2 ${ROLE_LABEL_COLOR[role]}`}>
              <RaidRoleIcon role={role} size="sm" />
              <h3 className="text-sm font-semibold">
                {RAID_ROLE_KR[role]}
                <span className="ml-1.5 text-gray-500 font-normal">({byRole[role].length}명)</span>
              </h3>
            </div>

            {byRole[role].length === 0 ? (
              <p className="text-gray-600 text-sm pl-2">신청자 없음</p>
            ) : (
              <div className="space-y-1.5">
                {byRole[role].map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2.5 ${
                      r.status === RegistrationStatus.ABSENT ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 직업 아이콘 */}
                      <WowClassIcon wowClass={r.wowClass} size="md" />

                      <div>
                        {/* 캐릭터명 */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium text-sm">{r.characterName}</span>
                          {r.isGuest && (
                            <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">비회원</span>
                          )}
                        </div>
                        {/* 직업/특성 · 닉네임 */}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ color: WOW_CLASS_COLOR[r.wowClass] }}>
                            {WOW_CLASS_KR[r.wowClass]} · {WOW_SPEC_KR[r.wowSpec]}
                          </span>
                          <span className="text-xs text-gray-500">{r.displayName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.absenceReason && (
                        <span className="text-xs text-gray-500 truncate max-w-32" title={r.absenceReason}>
                          사유: {r.absenceReason}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[r.status]}`}>
                        {REGISTRATION_STATUS_KR[r.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
