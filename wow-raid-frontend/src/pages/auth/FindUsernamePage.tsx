import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { Sword } from 'lucide-react'

const schema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
})
type FormData = z.infer<typeof schema>

export default function FindUsernamePage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({ mutationFn: authApi.findUsername })

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Sword className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">아이디 찾기</h1>
          <p className="text-gray-400 mt-1 text-sm">가입 시 등록한 이메일을 입력해주세요.</p>
        </div>

        {mutation.isSuccess ? (
          <div className="text-center space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">회원님의 아이디는</p>
              <p className="text-yellow-400 text-2xl font-bold">{mutation.data.username}</p>
              <p className="text-gray-400 text-sm mt-2">입니다.</p>
            </div>
            <Link
              to="/login"
              className="block w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors text-center"
            >
              로그인하러 가기
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">이메일</label>
              <input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

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
              {mutation.isPending ? '조회 중...' : '아이디 찾기'}
            </button>

            <p className="text-center text-sm text-gray-400">
              <Link to="/login" className="text-yellow-400 hover:text-yellow-300">
                로그인으로 돌아가기
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
