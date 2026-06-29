import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { registrationApi } from '@/api/registration.api'
import { userApi } from '@/api/user.api'
import { WowClass, WowSpec, RaidRole } from '@/types/enums'
import { WOW_CLASS_KR, WOW_SPEC_KR, WOW_CLASS_COLOR, RAID_ROLE_KR, CLASS_SPECS, SPEC_ROLE } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'
import { Star } from 'lucide-react'

const schema = z.object({
  characterName: z.string().min(1, '캐릭터명을 입력해주세요.'),
  wowClass: z.nativeEnum(WowClass),
  wowSpec: z.nativeEnum(WowSpec),
  role: z.nativeEnum(RaidRole),
})
type FormData = z.infer<typeof schema>

interface Props {
  raidId: string
  onSuccess: () => void
}

const ROLE_STYLE: Record<RaidRole, { bg: string; text: string }> = {
  [RaidRole.TANK]:   { bg: 'bg-blue-900/50 border-blue-700',   text: 'text-blue-400' },
  [RaidRole.HEALER]: { bg: 'bg-green-900/50 border-green-700', text: 'text-green-400' },
  [RaidRole.DPS]:    { bg: 'bg-red-900/50 border-red-700',     text: 'text-red-400' },
}

const defaultSpec = CLASS_SPECS[WowClass.WARRIOR][0]

export default function MemberRegistrationForm({ raidId, onSuccess }: Props) {
  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: userApi.getCharacters,
  })

  const [mode, setMode] = useState<'my' | 'manual'>(characters.length > 0 ? 'my' : 'manual')
  const selectingChar = useRef(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      wowClass: WowClass.WARRIOR,
      wowSpec: defaultSpec,
      role: SPEC_ROLE[defaultSpec],
    },
  })

  const selectedClass = watch('wowClass')
  const selectedSpec  = watch('wowSpec')
  const autoRole      = SPEC_ROLE[selectedSpec]

  // 캐릭터 로드 시 모드 초기화 + 대표 캐릭터 자동 선택
  useEffect(() => {
    if (characters.length > 0) {
      setMode('my')
      const main = characters.find((c) => c.isMain) ?? characters[0]
      setValue('characterName', main.characterName)
      setValue('wowClass', main.wowClass)
      setValue('wowSpec', main.wowSpec)
      setValue('role', SPEC_ROLE[main.wowSpec])
    }
  }, [characters, setValue])

  // 직업 변경 시 첫 번째 특성으로 리셋 (캐릭터 선택 중엔 건너뜀)
  useEffect(() => {
    if (selectingChar.current) return
    const specs = CLASS_SPECS[selectedClass]
    if (specs?.length) {
      setValue('wowSpec', specs[0])
    }
  }, [selectedClass, setValue])

  // 특성 변경 시 역할 자동 설정
  useEffect(() => {
    setValue('role', SPEC_ROLE[selectedSpec])
  }, [selectedSpec, setValue])

  const mutation = useMutation({
    mutationFn: (data: FormData) => registrationApi.register(raidId, data),
    onSuccess,
  })

  const inputCls = 'w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors'

  const selectCharacter = (char: typeof characters[0]) => {
    selectingChar.current = true
    setValue('characterName', char.characterName)
    setValue('wowClass', char.wowClass)
    setValue('wowSpec', char.wowSpec)
    setValue('role', SPEC_ROLE[char.wowSpec])
    setTimeout(() => { selectingChar.current = false }, 0)
  }

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">

      {/* 탭 전환 (캐릭터 있을 때만) */}
      {characters.length > 0 && (
        <div className="flex rounded-lg bg-gray-800 p-1 gap-1">
          <button
            type="button"
            onClick={() => setMode('my')}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'my' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            내 캐릭터 선택
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'manual' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            직접 입력
          </button>
        </div>
      )}

      {/* 내 캐릭터 선택 모드 */}
      {mode === 'my' && (
        <div className="space-y-1.5">
          {[...characters]
            .sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0))
            .map((char) => {
              const isSelected = watch('characterName') === char.characterName && watch('wowClass') === char.wowClass
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => selectCharacter(char)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    isSelected ? 'border-yellow-500 bg-gray-600' : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <WowClassIcon wowClass={char.wowClass} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {char.isMain && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                      <span className="text-white text-sm font-medium">{char.characterName}</span>
                    </div>
                    <span className="text-xs" style={{ color: WOW_CLASS_COLOR[char.wowClass] }}>
                      {WOW_CLASS_KR[char.wowClass]} · {WOW_SPEC_KR[char.wowSpec]}
                    </span>
                  </div>
                  {isSelected && <span className="text-xs text-yellow-400 shrink-0">선택됨</span>}
                </button>
              )
            })}
        </div>
      )}

      {/* 직접 입력 모드 */}
      {mode === 'manual' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">캐릭터명</label>
            <input {...register('characterName')} placeholder="캐릭터명 입력" className={inputCls} />
            {errors.characterName && <p className="text-red-400 text-xs mt-1">{errors.characterName.message}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">직업</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {Object.values(WowClass).map((cls) => {
                const isSelected = selectedClass === cls
                return (
                  <label
                    key={cls}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-pointer border transition-all ${
                      isSelected ? 'border-yellow-500 bg-gray-600' : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <input {...register('wowClass')} type="radio" value={cls} className="sr-only" />
                    <WowClassIcon wowClass={cls} size="md" />
                    <span className="text-[10px] text-center leading-tight" style={{ color: isSelected ? WOW_CLASS_COLOR[cls] : '#9ca3af' }}>
                      {WOW_CLASS_KR[cls]}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">특성</label>
              <select {...register('wowSpec')} className={inputCls}>
                {(CLASS_SPECS[selectedClass] ?? []).map((spec) => (
                  <option key={spec} value={spec}>{WOW_SPEC_KR[spec]}</option>
                ))}
              </select>
            </div>
            {autoRole && (
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium shrink-0 ${ROLE_STYLE[autoRole].bg} ${ROLE_STYLE[autoRole].text}`}>
                <RaidRoleIcon role={autoRole} size="sm" />
                {RAID_ROLE_KR[autoRole]}
              </div>
            )}
          </div>
        </>
      )}

      {mutation.error && (
        <p className="text-red-400 text-xs text-center">{mutation.error.message}</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {mutation.isPending ? '신청 중...' : '신청하기'}
      </button>
    </form>
  )
}
