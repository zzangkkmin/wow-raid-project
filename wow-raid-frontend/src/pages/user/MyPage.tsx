import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { userApi, type MyRegistrationResponse } from '@/api/user.api'
import { useAuthStore } from '@/stores/auth.store'
import { Difficulty, RaidStatus, RegistrationStatus, UserRole } from '@/types/enums'
import { User, Shield, Sword, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { formatDate } from '@/utils/date.util'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다.'),
  newPasswordConfirm: z.string(),
}).refine((d) => d.newPassword === d.newPasswordConfirm, {
  message: '새 비밀번호가 일치하지 않습니다.',
  path: ['newPasswordConfirm'],
})
type PasswordForm = z.infer<typeof passwordSchema>

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.ADMIN]: '관리자',
  [UserRole.RAID_LEADER]: '공격대장',
  [UserRole.MEMBER]: '공대원',
}
const ROLE_COLOR: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'text-red-400 bg-red-950 border-red-800',
  [UserRole.RAID_LEADER]: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  [UserRole.MEMBER]: 'text-blue-400 bg-blue-950 border-blue-800',
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-colors text-sm'

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  [Difficulty.NORMAL]: '일반',
  [Difficulty.HEROIC]: '영웅',
  [Difficulty.MYTHIC]: '신화',
}
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  [Difficulty.NORMAL]: 'text-gray-400 bg-gray-800',
  [Difficulty.HEROIC]: 'text-blue-400 bg-blue-950',
  [Difficulty.MYTHIC]: 'text-purple-400 bg-purple-950',
}

const REG_STATUS_CONFIG: Record<RegistrationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [RegistrationStatus.CONFIRMED]: {
    label: '참가 확정',
    color: 'text-emerald-400 bg-emerald-950 border-emerald-800',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  [RegistrationStatus.WAITING]: {
    label: '대기 중',
    color: 'text-yellow-400 bg-yellow-950 border-yellow-800',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  [RegistrationStatus.ABSENT]: {
    label: '불참',
    color: 'text-red-400 bg-red-950 border-red-800',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
}

function MyRegistrationCard({ reg }: { reg: MyRegistrationResponse }) {
  const statusCfg = REG_STATUS_CONFIG[reg.status]
  const isClosed = reg.raidStatus === RaidStatus.CLOSED

  return (
    <Link
      to={`/raids/${reg.raidId}`}
      className="flex items-center gap-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-3.5 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DIFFICULTY_COLOR[reg.difficulty]}`}>
            {DIFFICULTY_LABEL[reg.difficulty]}
          </span>
          {isClosed && (
            <span className="text-[10px] text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">마감</span>
          )}
          <span className="text-white font-medium text-sm truncate">{reg.raidTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{formatDate(reg.raidDate)}</span>
          <span className="text-gray-600">·</span>
          <span>{reg.characterName} ({reg.server})</span>
        </div>
      </div>
      <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border shrink-0 ${statusCfg.color}`}>
        {statusCfg.icon}
        {statusCfg.label}
      </span>
    </Link>
  )
}

export default function MyPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const { data: myRegistrations = [], isLoading: regLoading } = useQuery({
    queryKey: ['myRegistrations'],
    queryFn: userApi.getMyRegistrations,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const passwordMutation = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => { alert('비밀번호가 변경되었습니다.'); reset() },
  })

  const withdrawMutation = useMutation({
    mutationFn: userApi.withdraw,
    onSuccess: () => { logout(); navigate('/') },
  })

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">내 정보</h1>

      {/* 프로필 카드 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center">
            <User className="w-7 h-7 text-gray-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{user?.username}</p>
            {user?.role && (
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border mt-1.5 ${ROLE_COLOR[user.role]}`}>
                {user.role === UserRole.ADMIN && <Shield className="w-3 h-3" />}
                {user.role === UserRole.RAID_LEADER && <Sword className="w-3 h-3" />}
                {ROLE_LABEL[user.role]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 캐릭터 관리 바로가기 */}
      <Link
        to="/my/characters"
        className="flex items-center justify-between bg-gray-900 border border-gray-700 hover:border-yellow-600/50 rounded-2xl p-5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
            <Sword className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-white font-medium">캐릭터 관리</p>
            <p className="text-gray-400 text-sm mt-0.5">내 캐릭터를 등록하고 관리하세요</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
      </Link>

      {/* 내 레이드 신청 현황 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4">내 레이드 신청 현황</h2>
        {regLoading ? (
          <LoadingSpinner />
        ) : myRegistrations.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">신청한 레이드가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {myRegistrations.map((reg) => (
              <MyRegistrationCard key={reg.registrationId} reg={reg} />
            ))}
          </div>
        )}
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-5">비밀번호 변경</h2>
        <form onSubmit={handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">현재 비밀번호</label>
            <input {...register('currentPassword')} type="password" className={inputCls} />
            {errors.currentPassword && <p className="text-red-400 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">새 비밀번호</label>
            <input {...register('newPassword')} type="password" className={inputCls} />
            {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">새 비밀번호 확인</label>
            <input {...register('newPasswordConfirm')} type="password" className={inputCls} />
            {errors.newPasswordConfirm && <p className="text-red-400 text-xs mt-1">{errors.newPasswordConfirm.message}</p>}
          </div>
          {passwordMutation.error && (
            <p className="text-red-400 text-sm">{passwordMutation.error.message}</p>
          )}
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-gray-900 font-semibold py-3 rounded-lg text-sm transition-colors"
          >
            {passwordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>

      {/* 회원 탈퇴 */}
      <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-6">
        <h2 className="text-base font-bold text-red-400 mb-2">회원 탈퇴</h2>
        <p className="text-gray-400 text-sm mb-4">탈퇴 후 1일이 지나면 계정과 모든 데이터가 삭제됩니다.</p>
        <button
          onClick={() => {
            if (confirm('정말 탈퇴하시겠습니까? 탈퇴 후 1일 뒤 모든 데이터가 삭제됩니다.')) {
              withdrawMutation.mutate()
            }
          }}
          disabled={withdrawMutation.isPending}
          className="bg-red-900/50 hover:bg-red-900 border border-red-800 disabled:opacity-50 text-red-300 py-2 px-5 rounded-lg text-sm transition-colors"
        >
          {withdrawMutation.isPending ? '처리 중...' : '회원 탈퇴'}
        </button>
      </div>
    </div>
  )
}
