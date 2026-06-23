import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { Sword } from 'lucide-react'
import { useState } from 'react'

const schema = z.object({
  username: z.string().min(3, '아이디는 3자 이상이어야 합니다.').max(20, '아이디는 20자 이하이어야 합니다.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  passwordConfirm: z.string(),
  battletag: z.string().optional(),
  raidLeaderCode: z.string().optional(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['passwordConfirm'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [isRaidLeader, setIsRaidLeader] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
        battletag: data.battletag,
        raidLeaderCode: data.raidLeaderCode,
      }),
    onSuccess: () => navigate('/login', { state: { registered: true } }),
  })

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Sword className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">회원가입</h1>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          {/* 아이디 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">아이디 <span className="text-red-400">*</span></label>
            <input
              {...register('username')}
              placeholder="3~20자"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">이메일 <span className="text-red-400">*</span></label>
            <input
              {...register('email')}
              type="email"
              placeholder="example@email.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">비밀번호 <span className="text-red-400">*</span></label>
            <input
              {...register('password')}
              type="password"
              placeholder="8자 이상"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">비밀번호 확인 <span className="text-red-400">*</span></label>
            <input
              {...register('passwordConfirm')}
              type="password"
              placeholder="비밀번호 재입력"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
            {errors.passwordConfirm && <p className="text-red-400 text-xs mt-1">{errors.passwordConfirm.message}</p>}
          </div>

          {/* 배틀태그 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">배틀태그 <span className="text-gray-500">(선택)</span></label>
            <input
              {...register('battletag')}
              placeholder="닉네임#12345"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          {/* 공격대장 체크박스 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRaidLeader"
              checked={isRaidLeader}
              onChange={(e) => setIsRaidLeader(e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            <label htmlFor="isRaidLeader" className="text-sm text-gray-300 cursor-pointer">
              공격대장으로 가입
            </label>
          </div>

          {/* 공격대장 인증코드 */}
          {isRaidLeader && (
            <div>
              <label className="block text-sm text-gray-300 mb-1">공격대장 인증코드 <span className="text-red-400">*</span></label>
              <input
                {...register('raidLeaderCode')}
                type="password"
                placeholder="인증코드 입력"
                className="w-full bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          )}

          {mutation.error && (
            <p className="text-red-400 text-sm text-center bg-red-950 border border-red-800 rounded-lg px-4 py-2">
              {mutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:cursor-not-allowed text-gray-900 font-semibold py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-yellow-400 hover:text-yellow-300">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
