import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { raidApi } from '@/api/raid.api'
import { RaidStatus, Difficulty, UserRole, RaidRole } from '@/types/enums'
import { useAuthStore } from '@/stores/auth.store'
import { DIFFICULTY_KR } from '@/utils/wowClass.util'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'
import { formatDate } from '@/utils/date.util'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Plus, Sword, Clock } from 'lucide-react'

const STATUS_TABS = [
  { label: '모집 중', value: RaidStatus.OPEN },
  { label: '마감',   value: RaidStatus.CLOSED },
]

const DIFFICULTY_BG: Record<Difficulty, string> = {
  [Difficulty.NORMAL]: 'bg-green-900/30 text-green-400',
  [Difficulty.HEROIC]: 'bg-blue-900/30 text-blue-400',
  [Difficulty.MYTHIC]: 'bg-purple-900/30 text-purple-400',
}

const ROLE_SLOTS = (raid: {
  confirmedTanks: number; maxTanks: number
  confirmedHealers: number; maxHealers: number
  confirmedDps: number; maxDps: number
}) => [
  { role: RaidRole.TANK,   confirmed: raid.confirmedTanks,   max: raid.maxTanks,   color: 'text-blue-400' },
  { role: RaidRole.HEALER, confirmed: raid.confirmedHealers, max: raid.maxHealers, color: 'text-green-400' },
  { role: RaidRole.DPS,    confirmed: raid.confirmedDps,     max: raid.maxDps,     color: 'text-red-400' },
]

export default function RaidListPage() {
  const [status, setStatus] = useState<RaidStatus>(RaidStatus.OPEN)
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['raids', status],
    queryFn: () => raidApi.getList({ status }),
  })

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sword className="w-8 h-8 text-yellow-400" />
            레이드 일정
          </h1>
          <p className="text-gray-400 mt-2">공격대 레이드 일정을 확인하고 신청하세요</p>
        </div>
        {user?.role === UserRole.RAID_LEADER && (
          <Link
            to="/raids/new"
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            레이드 생성
          </Link>
        )}
      </div>

      {/* 상태 탭 */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit border border-gray-700">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-yellow-500 text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.content.length ? (
        <div className="text-center py-24 text-gray-500">
          <Sword className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="text-lg">등록된 레이드가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.content.map((raid) => (
            <Link
              key={raid.id}
              to={`/raids/${raid.id}`}
              className="block bg-gray-800 hover:bg-gray-800/80 border border-gray-700 hover:border-yellow-600/50 rounded-xl p-5 transition-all group"
            >
              <div className="flex items-center justify-between gap-6">
                {/* 왼쪽: 난이도 배지 + 제목 + 메타 */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${DIFFICULTY_BG[raid.difficulty]}`}>
                      {DIFFICULTY_KR[raid.difficulty]}
                    </span>
                    <h2 className="text-white font-semibold text-base group-hover:text-yellow-400 transition-colors truncate">
                      {raid.title}
                    </h2>
                    <span className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      raid.status === RaidStatus.OPEN
                        ? 'bg-green-900/50 text-green-400 border border-green-800'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {raid.status === RaidStatus.OPEN ? '● 모집 중' : '■ 마감'}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {formatDate(raid.raidDate)}
                    </span>
                    <span className="text-gray-500">공격대장: {raid.createdBy}</span>
                  </div>
                </div>

                {/* 오른쪽: 역할별 확정/총 인원 */}
                <div className="flex items-center gap-4 shrink-0">
                  {ROLE_SLOTS(raid).map(({ role, confirmed, max, color }) => (
                    <div key={role} className="flex flex-col items-center gap-1.5 w-16">
                      <RaidRoleIcon role={role} size="lg" />
                      <span className={`text-sm font-bold ${color}`}>
                        {confirmed}
                        <span className="text-gray-400 font-normal">/{max}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
