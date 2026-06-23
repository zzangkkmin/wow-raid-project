import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import { UserRole } from '@/types/enums'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatDate } from '@/utils/date.util'
import { Trash2 } from 'lucide-react'
import type { Page } from '@/types/common.types'

interface UserItem {
  id: string
  username: string
  email: string
  battletag: string | null
  role: UserRole
  createdAt: string
}

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.ADMIN]: '관리자',
  [UserRole.RAID_LEADER]: '공격대장',
  [UserRole.MEMBER]: '공대원',
}

export default function AdminUserPage() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers() as unknown as Promise<Page<UserItem>>,
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => adminApi.changeRole(id, role),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.forceWithdraw,
    onSuccess: invalidate,
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">회원 관리</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="text-left px-5 py-3.5">아이디</th>
                <th className="text-left px-5 py-3.5">이메일</th>
                <th className="text-left px-5 py-3.5">역할</th>
                <th className="text-left px-5 py-3.5">가입일</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.content.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5 text-white font-medium">{u.username}</td>
                  <td className="px-5 py-3.5 text-gray-400">{u.email}</td>
                  <td className="px-5 py-3.5">
                    {u.role === UserRole.ADMIN ? (
                      <span className="text-red-400 text-xs font-bold bg-red-900/30 px-2 py-1 rounded">
                        {ROLE_LABEL[u.role]}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as UserRole })}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                      >
                        {[UserRole.MEMBER, UserRole.RAID_LEADER].map((r) => (
                          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    {u.role !== UserRole.ADMIN && (
                      <button
                        onClick={() => {
                          if (confirm(`${u.username}님을 강제 탈퇴하시겠습니까?`)) {
                            deleteMutation.mutate(u.id)
                          }
                        }}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
