import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { raidApi } from '@/api/raid.api'
import { registrationApi } from '@/api/registration.api'
import { useAuthStore } from '@/stores/auth.store'
import { RaidStatus, RegistrationStatus } from '@/types/enums'
import { DIFFICULTY_KR } from '@/utils/wowClass.util'
import { formatDate } from '@/utils/date.util'
import RaidStats from '@/components/raid/RaidStats'
import MemberRegistrationForm from '@/components/registration/MemberRegistrationForm'
import GuestRegistrationForm from '@/components/registration/GuestRegistrationForm'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Clock, Users, ChevronLeft, Edit, Trash2, X } from 'lucide-react'

const DIFFICULTY_COLOR = {
  NORMAL: 'text-green-400',
  HEROIC: 'text-blue-400',
  MYTHIC: 'text-purple-400',
}

export default function RaidDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const [showModal, setShowModal]     = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)

  const { data: raid, isLoading } = useQuery({
    queryKey: ['raid', id],
    queryFn: () => raidApi.getDetail(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => raidApi.delete(id!),
    onSuccess: () => navigate('/'),
  })

  const cancelMutation = useMutation({
    mutationFn: () => registrationApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raid', id] })
      setShowModal(false)
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (!raid) return <div className="text-gray-400 text-center py-20">레이드를 찾을 수 없습니다.</div>

  const isOwner = user?.username === raid.createdBy
  const isClosed = raid.status === RaidStatus.CLOSED

  const myRegistration = isAuthenticated
    ? raid.registrations.find((r) => r.displayName === user?.username && !r.isGuest)
    : null

  const canRegister = !isClosed && !isOwner

  function closeModal() {
    setShowModal(false)
    setShowGuestForm(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로가기 */}
      <Link to="/" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <ChevronLeft className="w-4 h-4" />
        레이드 목록으로
      </Link>

      {/* 레이드 헤더 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-7 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-bold ${DIFFICULTY_COLOR[raid.difficulty]}`}>
                [{DIFFICULTY_KR[raid.difficulty]}]
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isClosed ? 'bg-gray-700 text-gray-400' : 'bg-green-900 text-green-400'
              }`}>
                {isClosed ? '■ 마감' : '● 모집 중'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{raid.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(raid.raidDate)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                탱 {raid.maxTanks} / 힐 {raid.maxHealers} / 딜 {raid.maxDps}
              </span>
              <span className="text-gray-500">공격대장: {raid.createdBy}</span>
            </div>
            {raid.notes && (
              <p className="mt-3 text-gray-300 text-sm bg-gray-700 rounded-lg px-4 py-3 whitespace-pre-wrap">
                {raid.notes}
              </p>
            )}
          </div>

          {/* 오른쪽 액션 버튼 영역 */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* 오너 관리 버튼 */}
            {isOwner && (
              <div className="flex gap-2">
                <Link
                  to={`/raids/${id}/edit`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  수정
                </Link>
                <button
                  onClick={() => { if (confirm('레이드를 삭제하시겠습니까?')) deleteMutation.mutate() }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-300 text-sm rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  삭제
                </button>
              </div>
            )}

            {/* 신청 버튼 */}
            {canRegister && (
              myRegistration ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    myRegistration.status === RegistrationStatus.CONFIRMED
                      ? 'bg-green-900 text-green-400'
                      : 'bg-yellow-900 text-yellow-400'
                  }`}>
                    {myRegistration.status === RegistrationStatus.CONFIRMED ? '확정' : '대기'}
                  </span>
                  신청 완료
                </button>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg text-sm transition-colors"
                >
                  신청하기
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 공격대 구성 + 신청자 목록 */}
      <div className="mb-6">
        <RaidStats stats={raid.stats} registrations={raid.registrations} />
      </div>

      {/* 신청 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                {myRegistration ? '신청 현황' : '레이드 신청'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 본문 */}
            {myRegistration ? (
              // 이미 신청한 경우
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-xl px-4 py-4">
                  <p className="text-white font-medium text-base">
                    {myRegistration.characterName}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      myRegistration.status === RegistrationStatus.CONFIRMED
                        ? 'bg-green-900 text-green-400'
                        : 'bg-yellow-900 text-yellow-400'
                    }`}>
                      {myRegistration.status === RegistrationStatus.CONFIRMED ? '확정' : '대기 중'}
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm mt-1">신청이 완료된 상태입니다.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={closeModal}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg text-sm transition-colors"
                  >
                    닫기
                  </button>
                  <button
                    onClick={() => { if (confirm('신청을 취소하시겠습니까?')) cancelMutation.mutate() }}
                    disabled={cancelMutation.isPending}
                    className="bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-300 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {cancelMutation.isPending ? '취소 중...' : '신청 취소'}
                  </button>
                </div>
              </div>
            ) : isAuthenticated ? (
              // 회원 신청 폼
              <MemberRegistrationForm
                raidId={id!}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['raid', id] })
                  closeModal()
                }}
              />
            ) : !showGuestForm ? (
              // 로그인/비회원 선택
              <div className="space-y-4">
                <p className="text-gray-400 text-sm text-center">로그인 없이도 신청하실 수 있습니다.</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg text-sm transition-colors"
                  >
                    로그인 후 신청
                  </Link>
                  <button
                    onClick={() => setShowGuestForm(true)}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                  >
                    비회원으로 신청
                  </button>
                </div>
              </div>
            ) : (
              // 비회원 신청 폼
              <GuestRegistrationForm
                raidId={id!}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['raid', id] })
                  closeModal()
                }}
                onCancel={() => setShowGuestForm(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
