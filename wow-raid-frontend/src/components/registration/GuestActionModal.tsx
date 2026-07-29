import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { guestRegistrationApi } from '@/api/registration.api'
import type { RegistrationResponse } from '@/types/registration.types'
import { WowClass, WowSpec, RaidRole } from '@/types/enums'
import { WOW_CLASS_KR, WOW_SPEC_KR, WOW_CLASS_COLOR, RAID_ROLE_KR, CLASS_SPECS, SPEC_ROLE, WOW_SERVERS } from '@/utils/wowClass.util'
import WowClassIcon from '@/components/common/WowClassIcon'
import RaidRoleIcon from '@/components/common/RaidRoleIcon'
import { X } from 'lucide-react'

type Tab = 'edit' | 'cancel'

const ROLE_STYLE: Record<RaidRole, { bg: string; text: string }> = {
  [RaidRole.TANK]:   { bg: 'bg-blue-900/50 border-blue-700',   text: 'text-blue-400'  },
  [RaidRole.HEALER]: { bg: 'bg-green-900/50 border-green-700', text: 'text-green-400' },
  [RaidRole.DPS]:    { bg: 'bg-red-900/50 border-red-700',     text: 'text-red-400'   },
}

const authSchema = z.object({
  guestName:     z.string().min(1, '이름을 입력해주세요.'),
  guestPassword: z.string().min(1, '비밀번호를 입력해주세요.'),
  server:        z.string().min(1),
  characterName: z.string().min(1, '캐릭터명을 입력해주세요.'),
  wowClass:      z.nativeEnum(WowClass),
  wowSpec:       z.nativeEnum(WowSpec),
  role:          z.nativeEnum(RaidRole),
})
type FormData = z.infer<typeof authSchema>

interface Props {
  raidId: string
  registration: RegistrationResponse
  onClose: () => void
}

const inputCls = 'w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors'

export default function GuestActionModal({ raidId, registration: reg, onClose }: Props) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('edit')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      guestName:     reg.displayName,
      guestPassword: '',
      server:        reg.server,
      characterName: reg.characterName,
      wowClass:      reg.wowClass,
      wowSpec:       reg.wowSpec,
      role:          reg.role,
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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['raid', raidId] })
    onClose()
  }

  const editMutation = useMutation({
    mutationFn: (data: FormData) =>
      guestRegistrationApi.update(raidId, reg.id, {
        guestName:     data.guestName,
        guestPassword: data.guestPassword,
        server:        data.server,
        characterName: data.characterName,
        wowClass:      data.wowClass,
        wowSpec:       data.wowSpec,
        role:          data.role,
      }),
    onSuccess: invalidate,
  })

  const cancelMutation = useMutation({
    mutationFn: (data: FormData) =>
      guestRegistrationApi.cancel(raidId, reg.id, {
        guestName:     data.guestName,
        guestPassword: data.guestPassword,
      }),
    onSuccess: invalidate,
  })

  const onSubmit = (data: FormData) => {
    if (tab === 'edit') editMutation.mutate(data)
    else cancelMutation.mutate(data)
  }

  const isPending = editMutation.isPending || cancelMutation.isPending
  const error = editMutation.error ?? cancelMutation.error

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">비회원 신청 관리</h2>
            <p className="text-xs text-gray-400 mt-0.5">{reg.characterName} ({reg.displayName})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex rounded-lg bg-gray-800 p-1 gap-1 mb-5">
          {(['edit', 'cancel'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === t ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'edit' ? '신청 수정' : '신청 취소'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 인증 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">이름 (표시명)</label>
              <input {...register('guestName')} className={inputCls} />
              {errors.guestName && <p className="text-red-400 text-xs mt-1">{errors.guestName.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">비밀번호</label>
              <input {...register('guestPassword')} type="password" placeholder="••••" className={inputCls} />
              {errors.guestPassword && <p className="text-red-400 text-xs mt-1">{errors.guestPassword.message}</p>}
            </div>
          </div>

          {/* 수정 폼 */}
          {tab === 'edit' && (
            <>
              <div className="border-t border-gray-700 pt-4 space-y-4">
                {/* 서버 + 캐릭터명 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">서버</label>
                    <select {...register('server')} className={inputCls}>
                      {WOW_SERVERS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">캐릭터명</label>
                    <input {...register('characterName')} className={inputCls} />
                    {errors.characterName && <p className="text-red-400 text-xs mt-1">{errors.characterName.message}</p>}
                  </div>
                </div>

                {/* 직업 */}
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

                {/* 특성 + 역할 */}
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
              </div>
            </>
          )}

          {/* 취소 확인 */}
          {tab === 'cancel' && (
            <div className="bg-red-950/40 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-300">
              인증 후 <span className="font-semibold text-white">{reg.characterName}</span>의 신청을 취소합니다. 이 작업은 되돌릴 수 없습니다.
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs text-center">{error.message}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={`w-full font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 ${
              tab === 'cancel'
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
            }`}
          >
            {isPending ? '처리 중...' : tab === 'edit' ? '수정하기' : '신청 취소'}
          </button>
        </form>
      </div>
    </div>
  )
}
