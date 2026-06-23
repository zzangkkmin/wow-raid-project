import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { raidApi } from '@/api/raid.api'
import { Difficulty } from '@/types/enums'
import { DIFFICULTY_KR } from '@/utils/wowClass.util'
import { ChevronLeft } from 'lucide-react'
import { useEffect } from 'react'

const schema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  raidDate: z.string().min(1, '날짜를 입력해주세요.'),
  difficulty: z.nativeEnum(Difficulty),
  maxTanks: z.number().int().min(1).max(10),
  maxHealers: z.number().int().min(1).max(10),
  maxDps: z.number().int().min(1).max(30),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RaidFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: existing } = useQuery({
    queryKey: ['raid', id],
    queryFn: () => raidApi.getDetail(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: Difficulty.NORMAL, maxTanks: 2, maxHealers: 4, maxDps: 14 },
  })

  // 수정 모드: 기존 데이터 채우기
  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        raidDate: existing.raidDate.slice(0, 16), // datetime-local format
        difficulty: existing.difficulty,
        maxTanks: existing.maxTanks,
        maxHealers: existing.maxHealers,
        maxDps: existing.maxDps,
        notes: existing.notes ?? '',
      })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? raidApi.update(id!, data)
        : raidApi.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['raids'] })
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['raid', id] })
      navigate(`/raids/${result.id}`)
    },
  })

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500 transition-colors'
  const labelCls = 'block text-sm text-gray-300 mb-1'

  return (
    <div className="max-w-2xl mx-auto">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        뒤로가기
      </button>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
        <h1 className="text-xl font-bold text-white mb-6">
          {isEdit ? '레이드 수정' : '레이드 생성'}
        </h1>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          {/* 제목 */}
          <div>
            <label className={labelCls}>제목 <span className="text-red-400">*</span></label>
            <input {...register('title')} placeholder="레이드 제목 입력" className={inputCls} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* 날짜 */}
          <div>
            <label className={labelCls}>레이드 날짜/시간 <span className="text-red-400">*</span></label>
            <input {...register('raidDate')} type="datetime-local" className={inputCls} />
            {errors.raidDate && <p className="text-red-400 text-xs mt-1">{errors.raidDate.message}</p>}
          </div>

          {/* 난이도 */}
          <div>
            <label className={labelCls}>난이도 <span className="text-red-400">*</span></label>
            <div className="flex gap-3">
              {Object.values(Difficulty).map((diff) => (
                <label
                  key={diff}
                  className="flex items-center gap-2 bg-gray-700 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  <input
                    {...register('difficulty')}
                    type="radio"
                    value={diff}
                    className="accent-yellow-500"
                  />
                  <span className={`text-sm font-medium ${
                    diff === Difficulty.NORMAL ? 'text-green-400' :
                    diff === Difficulty.HEROIC ? 'text-blue-400' : 'text-purple-400'
                  }`}>
                    {DIFFICULTY_KR[diff]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 모집 인원 */}
          <div>
            <label className={labelCls}>모집 인원 <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-blue-400 mb-1">탱커</label>
                <input {...register('maxTanks', { valueAsNumber: true })} type="number" min={1} max={10} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-green-400 mb-1">힐러</label>
                <input {...register('maxHealers', { valueAsNumber: true })} type="number" min={1} max={10} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-red-400 mb-1">딜러</label>
                <input {...register('maxDps', { valueAsNumber: true })} type="number" min={1} max={30} className={inputCls} />
              </div>
            </div>
          </div>

          {/* 공지사항 */}
          <div>
            <label className={labelCls}>공지사항 <span className="text-gray-500">(선택)</span></label>
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="레이드 관련 공지사항을 입력하세요."
              className={`${inputCls} resize-none`}
            />
          </div>

          {mutation.error && (
            <p className="text-red-400 text-sm text-center bg-red-950 border border-red-800 rounded-lg px-4 py-2">
              {mutation.error.message}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors"
            >
              {mutation.isPending ? '저장 중...' : isEdit ? '수정 완료' : '레이드 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
