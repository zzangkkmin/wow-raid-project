import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { Sword } from 'lucide-react'

const schema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})
type FormData = z.infer<typeof schema>

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-colors text-sm'
const labelCls = 'block text-sm font-medium text-gray-300 mb-1.5'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.accessToken, { username: data.username, role: data.role })
      navigate('/')
    },
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* 카드 */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-4">
              <Sword className="w-7 h-7 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">로그인</h1>
            <p className="text-gray-400 text-sm mt-1">WoW 레이드 관리 시스템</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <div>
              <label className={labelCls}>아이디</label>
              <input {...register('username')} placeholder="아이디 입력" className={inputCls} />
              {errors.username && <p className="text-red-400 text-xs mt-1.5">{errors.username.message}</p>}
            </div>

            <div>
              <label className={labelCls}>비밀번호</label>
              <input {...register('password')} type="password" placeholder="비밀번호 입력" className={inputCls} />
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {mutation.error && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                {mutation.error.message}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-lg transition-colors text-sm mt-2"
            >
              {mutation.isPending ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-3 text-sm text-center text-gray-400">
            <p>
              아이디가 기억나지 않으신가요?{' '}
              <Link to="/find-username" className="text-yellow-400 hover:text-yellow-300 font-medium">아이디 찾기</Link>
            </p>
            <p>
              계정이 없으신가요?{' '}
              <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-medium">회원가입</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
