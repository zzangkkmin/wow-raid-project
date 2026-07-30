import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi, type CharacterResponse } from '@/api/user.api'
import { WowClass, WowSpec } from '@/types/enums'
import { WOW_CLASS_KR, WOW_SPEC_KR, WOW_CLASS_COLOR, CLASS_SPECS, WOW_SERVERS } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ChevronLeft, Plus, Star, Trash2, Pencil, X, Check } from 'lucide-react'

const schema = z.object({
  server: z.string().min(1, '서버를 선택해주세요.'),
  characterName: z.string().min(1, '캐릭터명을 입력해주세요.').max(50),
  wowClass: z.nativeEnum(WowClass),
  wowSpec: z.nativeEnum(WowSpec),
})
type FormData = z.infer<typeof schema>

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-colors text-sm'
const inputSmCls = 'w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-colors text-sm'

// ── 인라인 수정 폼 ─────────────────────────────────────────────────────────────

function EditCharacterForm({ char, onClose, onSave }: {
  char: CharacterResponse
  onClose: () => void
  onSave: (id: string, data: FormData) => void
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      server: char.server,
      characterName: char.characterName,
      wowClass: char.wowClass,
      wowSpec: char.wowSpec,
    },
  })

  const selectedClass = watch('wowClass')
  const availableSpecs = CLASS_SPECS[selectedClass] ?? []

  useEffect(() => {
    if (!availableSpecs.includes(watch('wowSpec'))) {
      setValue('wowSpec', availableSpecs[0])
    }
  }, [selectedClass]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      onSubmit={handleSubmit((d) => onSave(char.id, d))}
      className="mt-1 bg-gray-800/80 border border-yellow-500/30 rounded-xl px-4 py-4 space-y-3"
    >
      {/* 서버 + 캐릭터명 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">서버</label>
          <select {...register('server')} className={inputSmCls}>
            {WOW_SERVERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">캐릭터명</label>
          <input {...register('characterName')} className={inputSmCls} />
          {errors.characterName && <p className="text-red-400 text-xs mt-0.5">{errors.characterName.message}</p>}
        </div>
      </div>

      {/* 직업 */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">직업</label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {Object.values(WowClass).map((cls) => {
            const isSelected = selectedClass === cls
            return (
              <label
                key={cls}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-pointer border transition-all ${
                  isSelected ? 'border-yellow-500 bg-gray-700' : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <input {...register('wowClass')} type="radio" value={cls} className="sr-only" />
                <WowClassIcon wowClass={cls} size="sm" />
                <span className="text-[10px] text-center leading-tight" style={{ color: isSelected ? WOW_CLASS_COLOR[cls] : '#9ca3af' }}>
                  {WOW_CLASS_KR[cls]}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* 특성 */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">특성</label>
        <select {...register('wowSpec')} className={inputSmCls}>
          {availableSpecs.map((spec) => (
            <option key={spec} value={spec}>{WOW_SPEC_KR[spec]}</option>
          ))}
        </select>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" /> 취소
        </button>
        <button
          type="submit"
          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold text-xs rounded-lg transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> 저장
        </button>
      </div>
    </form>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function CharacterPage() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['characters'] })
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: userApi.getCharacters,
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { server: WOW_SERVERS[0], wowClass: WowClass.WARRIOR },
  })

  const selectedClass = watch('wowClass')
  const availableSpecs = CLASS_SPECS[selectedClass] ?? []

  useEffect(() => {
    if (availableSpecs.length) setValue('wowSpec', availableSpecs[0])
  }, [selectedClass]) // eslint-disable-line react-hooks/exhaustive-deps

  const addMutation = useMutation({ mutationFn: userApi.addCharacter, onSuccess: () => { invalidate(); reset({ server: WOW_SERVERS[0], wowClass: WowClass.WARRIOR }) } })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => userApi.updateCharacter(id, data),
    onSuccess: () => { invalidate(); setEditTargetId(null) },
  })
  const mainMutation = useMutation({ mutationFn: userApi.setMainCharacter, onSuccess: invalidate })
  const deleteMutation = useMutation({ mutationFn: userApi.deleteCharacter, onSuccess: () => { invalidate(); setDeleteTargetId(null) } })

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
              <div key={char.id}>
                <div
                  className={`flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3.5 ${
                    char.isMain ? 'ring-1 ring-yellow-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <WowClassIcon wowClass={char.wowClass} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        {char.isMain && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
                        <span className="text-white font-medium">{char.characterName}</span>
                        <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">{char.server}</span>
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
                      onClick={() => { setEditTargetId(editTargetId === char.id ? null : char.id); setDeleteTargetId(null) }}
                      className={`transition-colors p-1.5 rounded-lg hover:bg-gray-700 ${editTargetId === char.id ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setDeleteTargetId(deleteTargetId === char.id ? null : char.id); setEditTargetId(null) }}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* 인라인 수정 폼 */}
                {editTargetId === char.id && (
                  <EditCharacterForm
                    char={char}
                    onClose={() => setEditTargetId(null)}
                    onSave={(id, data) => updateMutation.mutate({ id, data })}
                  />
                )}

                {/* 인라인 삭제 확인 */}
                {deleteTargetId === char.id && (
                  <div className="flex items-center justify-end gap-2 mt-1 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
                    <span className="text-red-300 text-xs flex-1">'{char.characterName}' 캐릭터를 삭제하시겠습니까?</span>
                    <button
                      onClick={() => deleteMutation.mutate(char.id)}
                      disabled={deleteMutation.isPending}
                      className="px-2.5 py-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors"
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(null)}
                      className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-md transition-colors"
                    >
                      취소
                    </button>
                  </div>
                )}
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

          {/* 서버 선택 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">서버 <span className="text-red-400">*</span></label>
            <select {...register('server')} className={inputCls}>
              {WOW_SERVERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.server && <p className="text-red-400 text-xs mt-1">{errors.server.message}</p>}
          </div>

          {/* 캐릭터명 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">캐릭터명 <span className="text-red-400">*</span></label>
            <input {...register('characterName')} placeholder="캐릭터명 입력" className={inputCls} />
            {errors.characterName && <p className="text-red-400 text-xs mt-1">{errors.characterName.message}</p>}
          </div>

          {/* 직업 선택 */}
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-2">직업</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {Object.values(WowClass).map((cls) => {
                const isSelected = selectedClass === cls
                return (
                  <label
                    key={cls}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer border transition-all ${
                      isSelected ? 'border-yellow-500 bg-gray-700' : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <input {...register('wowClass')} type="radio" value={cls} className="sr-only" />
                    <WowClassIcon wowClass={cls} size="md" />
                    <span className="text-xs text-center leading-tight" style={{ color: isSelected ? WOW_CLASS_COLOR[cls] : '#9ca3af' }}>
                      {WOW_CLASS_KR[cls]}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 특성 선택 */}
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
