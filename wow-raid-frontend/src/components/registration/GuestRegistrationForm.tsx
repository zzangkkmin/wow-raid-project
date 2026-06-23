import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { guestRegistrationApi } from '@/api/registration.api'
import { WowClass, WowSpec, RaidRole } from '@/types/enums'
import { WOW_CLASS_KR, WOW_SPEC_KR, WOW_CLASS_COLOR, RAID_ROLE_KR, CLASS_SPECS, SPEC_ROLE } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'

const schema = z.object({
  guestName:     z.string().min(1, '이름을 입력해주세요.').max(50),
  guestPassword: z.string().min(4, '비밀번호는 4자 이상이어야 합니다.'),
  characterName: z.string().min(1, '캐릭터명을 입력해주세요.'),
  wowClass:      z.nativeEnum(WowClass),
  wowSpec:       z.nativeEnum(WowSpec),
  role:          z.nativeEnum(RaidRole),
})
type FormData = z.infer<typeof schema>

interface Props {
  raidId:    string
  onSuccess: () => void
  onCancel:  () => void
}

const ROLE_STYLE: Record<RaidRole, { bg: string; text: string }> = {
  [RaidRole.TANK]:   { bg: 'bg-blue-900/50 border-blue-700',   text: 'text-blue-400'  },
  [RaidRole.HEALER]: { bg: 'bg-green-900/50 border-green-700', text: 'text-green-400' },
  [RaidRole.DPS]:    { bg: 'bg-red-900/50 border-red-700',     text: 'text-red-400'   },
}

const defaultSpec = CLASS_SPECS[WowClass.WARRIOR][0]

export default function GuestRegistrationForm({ raidId, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      wowClass: WowClass.WARRIOR,
      wowSpec:  defaultSpec,
      role:     SPEC_ROLE[defaultSpec],
    },
  })

  const selectedClass = watch('wowClass')
  const selectedSpec  = watch('wowSpec')
  const autoRole      = SPEC_ROLE[selectedSpec]

  useEffect(() => {
    const specs = CLASS_SPECS[selectedClass]
    if (specs?.length) setValue('wowSpec', specs[0])
  }, [selectedClass, setValue])

  useEffect(() => {
    setValue('role', SPEC_ROLE[selectedSpec])
  }, [selectedSpec, setValue])

  const mutation = useMutation({
    mutationFn: (data: FormData) => guestRegistrationApi.register(raidId, data),
    onSuccess,
  })

  const inputCls = 'w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors'

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <p className="text-xs text-yellow-500 bg-yellow-950 border border-yellow-800 rounded-lg px-3 py-2">
        ⚠ 수정/취소 시 이름과 비밀번호가 필요합니다. 잘 기억해두세요.
      </p>

      {/* 이름 + 비밀번호 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">이름 (표시명)</label>
          <input {...register('guestName')} placeholder="닉네임" className={inputCls} />
          {errors.guestName && <p className="text-red-400 text-xs mt-1">{errors.guestName.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">비밀번호 (4자 이상)</label>
          <input {...register('guestPassword')} type="password" placeholder="••••" className={inputCls} />
          {errors.guestPassword && <p className="text-red-400 text-xs mt-1">{errors.guestPassword.message}</p>}
        </div>
      </div>

      {/* 캐릭터명 */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">캐릭터명</label>
        <input {...register('characterName')} placeholder="캐릭터명 입력" className={inputCls} />
        {errors.characterName && <p className="text-red-400 text-xs mt-1">{errors.characterName.message}</p>}
      </div>

      {/* 직업 — 아이콘 그리드 */}
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

      {/* 특성 + 자동 역할 */}
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

      {mutation.error && (
        <p className="text-red-400 text-xs text-center">{mutation.error.message}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg text-sm transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
        >
          {mutation.isPending ? '신청 중...' : '비회원 신청'}
        </button>
      </div>
    </form>
  )
}
