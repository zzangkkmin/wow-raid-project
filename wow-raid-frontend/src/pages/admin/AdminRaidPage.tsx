import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/admin.api'
import { raidApi } from '@/api/raid.api'
import { DIFFICULTY_KR } from '@/utils/wowClass.util'
import { formatDate } from '@/utils/date.util'
import { RaidStatus } from '@/types/enums'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Trash2, ExternalLink } from 'lucide-react'

export default function AdminRaidPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-raids'],
    queryFn: () => raidApi.getList(),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.forceDeleteRaid,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-raids'] }),
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">레이드 관리</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="text-left px-5 py-3.5">제목</th>
                <th className="text-left px-5 py-3.5">난이도</th>
                <th className="text-left px-5 py-3.5">날짜</th>
                <th className="text-left px-5 py-3.5">상태</th>
                <th className="text-left px-5 py-3.5">작성자</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.content.map((raid) => (
                <tr key={raid.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5 text-white max-w-[200px] truncate">{raid.title}</td>
                  <td className="px-5 py-3.5 text-gray-300">{DIFFICULTY_KR[raid.difficulty]}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(raid.raidDate)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs ${raid.status === RaidStatus.OPEN ? 'text-green-400' : 'text-gray-500'}`}>
                      {raid.status === RaidStatus.OPEN ? '모집 중' : '마감'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">{raid.createdBy}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link to={`/raids/${raid.id}`} className="text-gray-500 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('레이드를 강제 삭제하시겠습니까?')) deleteMutation.mutate(raid.id)
                        }}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
