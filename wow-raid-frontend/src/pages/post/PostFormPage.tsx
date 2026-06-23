import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postApi } from '@/api/post.api'
import { BoardType, UserRole } from '@/types/enums'
import { useAuthStore } from '@/stores/auth.store'
import { ChevronLeft } from 'lucide-react'
import { useEffect } from 'react'

const schema = z.object({
  boardType: z.nativeEnum(BoardType),
  title: z.string().min(1, '제목을 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
})
type FormData = z.infer<typeof schema>

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-colors text-sm'

export default function PostFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const defaultBoardType = (location.state?.boardType as BoardType) ?? BoardType.FREE

  const { data: existing } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postApi.getDetail(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { boardType: defaultBoardType },
  })

  useEffect(() => {
    if (existing) {
      reset({ boardType: existing.boardType, title: existing.title, content: existing.content })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? postApi.update(id!, data) : postApi.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate(`/posts/${result.id}`)
    },
  })

  const isAdmin = user?.role === UserRole.ADMIN

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        뒤로가기
      </button>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-7">
        <h1 className="text-xl font-bold text-white mb-6">
          {isEdit ? '게시글 수정' : '게시글 작성'}
        </h1>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          {!isEdit && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">게시판</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...register('boardType')} type="radio" value={BoardType.FREE} className="accent-yellow-500" />
                  <span className="text-sm text-gray-300">자유게시판</span>
                </label>
                {isAdmin && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input {...register('boardType')} type="radio" value={BoardType.NOTICE} className="accent-yellow-500" />
                    <span className="text-sm text-gray-300">공지사항</span>
                  </label>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">제목 <span className="text-red-400">*</span></label>
            <input {...register('title')} placeholder="제목을 입력하세요" className={inputCls} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">내용 <span className="text-red-400">*</span></label>
            <textarea
              {...register('content')}
              rows={14}
              placeholder="내용을 입력하세요"
              className={`${inputCls} resize-none`}
            />
            {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>}
          </div>

          {mutation.error && (
            <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
              {mutation.error.message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors text-sm"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-gray-900 font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              {mutation.isPending ? '저장 중...' : isEdit ? '수정 완료' : '작성 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
