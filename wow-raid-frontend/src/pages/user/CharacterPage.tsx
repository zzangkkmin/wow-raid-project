import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/user.api'
import { WowClass, WowSpec } from '@/types/enums'
import { WOW_CLASS_KR, WOW_SPEC_KR, WOW_CLASS_COLOR, CLASS_SPECS } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ChevronLeft, Plus, Star, Trash2 } from 'lucide-react'

const schema = z.object({
  characterName: z.string().min(1, '캐릭터명을 입력해주세요.').max(50),
  wowClass: z.nativeEnum(WowClass),
  wowSpec: z.nativeEnum(WowSpec),
})
type FormData = z.infer<typeof schema>

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-colors text-sm'

export default function CharacterPage() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['characters'] })

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: userApi.getCharacters,
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { wowClass: WowClass.WARRIOR },
  })

  const selectedClass = watch('wowClass')
  const availableSpecs = CLASS_SPECS[selectedClass] ?? []

  useEffect(() => {
    if (availableSpecs.length) setValue('wowSpec', availableSpecs[0])
  }, [selectedClass]) // eslint-disable-line react-hooks/exhaustive-deps

  const addMutation = useMutation({ mutationFn: userApi.addCharacter, onSuccess: () => { invalidate(); reset() } })
  const mainMutation = useMutation({ mutationFn: userApi.setMainCharacter, onSuccess: invalidate })
  const deleteMutation = useMutation({ mutationFn: userApi.deleteCharacter, onSuccess: invalidate })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link to="/my" className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">캐릭터 관리</h1>
      </div>

      {/* 캐릭터 목록 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">내 캐릭터</h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : characters.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">등록된 캐릭터가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {[...characters].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0)).map((char) => (
              <div
                key={char.id}
                className={`flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3.5 ${
                  char.isMain ? 'ring-1 ring-yellow-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 직업 아이콘 */}
                  <WowClassIcon wowClass={char.wowClass} size="lg" />

                  <div>
                    <div className="flex items-center gap-2">
                      {char.isMain && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
                      <span className="text-white font-medium">{char.characterName}</span>
                    </div>
                    <span className="text-sm" style={{ color: WOW_CLASS_COLOR[char.wowClass] }}>
                      {WOW_CLASS_KR[char.wowClass]} · {WOW_SPEC_KR[char.wowSpec]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!char.isMain && (
                    <button
                      onClick={() => mainMutation.mutate(char.id)}
                      className="text-xs text-gray-400 hover:text-yellow-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-700"
                    >
                      대표 설정
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`'${char.characterName}' 캐릭터를 삭제하시겠습니까?`)) {
                        deleteMutation.mutate(char.id)
                      }
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 캐릭터 추가 폼 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-yellow-400" />
          캐릭터 추가
        </h2>
        <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">캐릭터명</label>
            <input {...register('characterName')} placeholder="캐릭터명 입력" className={inputCls} />
            {errors.characterName && <p className="text-red-400 text-xs mt-1">{errors.characterName.message}</p>}
          </div>

          {/* 직업 선택 — 아이콘 포함 */}
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-2">직업</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {Object.values(WowClass).map((cls) => {
                const isSelected = selectedClass === cls
                return (
                  <label
                    key={cls}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? 'border-yellow-500 bg-gray-700'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <input {...register('wowClass')} type="radio" value={cls} className="sr-only" />
                    <WowClassIcon wowClass={cls} size="md" />
                    <span
                      className="text-xs text-center leading-tight"
                      style={{ color: isSelected ? WOW_CLASS_COLOR[cls] : '#9ca3af' }}
                    >
                      {WOW_CLASS_KR[cls]}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">특성</label>
            <select {...register('wowSpec')} className={inputCls}>
              {availableSpecs.map((spec) => (
                <option key={spec} value={spec}>{WOW_SPEC_KR[spec]}</option>
              ))}
            </select>
          </div>

          {addMutation.error && (
            <p className="col-span-2 text-red-400 text-xs">{addMutation.error.message}</p>
          )}
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="col-span-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-gray-900 font-semibold py-3 rounded-lg text-sm transition-colors"
          >
            {addMutation.isPending ? '추가 중...' : '캐릭터 추가'}
          </button>
        </form>
      </div>
    </div>
  )
}
