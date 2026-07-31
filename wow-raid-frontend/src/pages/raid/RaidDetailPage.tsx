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

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

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
  const [showModal, setShowModal]         = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const canRegister = !isClosed

  function closeModal() {
    setShowModal(false)
    setShowGuestForm(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 뒤로가기 */}
      <Link to="/" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <ChevronLeft className="w-4 h-4" />
        레이드 목록으로
      </Link>

      {/* 레이드 헤더 */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-7 mb-6">
        {/* 상단: 제목/메타 + 버튼 */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
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
            <div className="flex items-center gap-2 mb-3">
              <h1 className="text-2xl font-bold text-white">{raid.title}</h1>
              {raid.discordUrl && (
                <a
                  href={raid.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors shrink-0"
                  title="디스코드 서버 참여"
                >
                  <DiscordIcon className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
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
          </div>

          {/* 액션 버튼 영역 — 모바일: 제목 아래 왼쪽 정렬 / 데스크탑: 오른쪽 정렬 */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {/* 오너 관리 버튼 */}
            {isOwner && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-2">
                  <Link
                    to={`/raids/${id}/edit`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    수정
                  </Link>
                  <button
                    onClick={() => setConfirmDelete((v) => !v)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      confirmDelete
                        ? 'bg-red-700 text-white'
                        : 'bg-red-900 hover:bg-red-800 text-red-300'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    삭제
                  </button>
                </div>
                {confirmDelete && (
                  <div className="flex items-center gap-2 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
                    <span className="text-red-300 text-xs">정말 삭제하시겠습니까?</span>
                    <button
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="px-2.5 py-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs rounded-md transition-colors"
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-md transition-colors"
                    >
                      취소
                    </button>
                  </div>
                )}
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

        {/* 노트: 전체 너비 */}
        {raid.notes && (
          <p className="mt-4 text-gray-300 text-sm bg-gray-700 rounded-lg px-4 py-3 whitespace-pre-wrap">
            {raid.notes}
          </p>
        )}
      </div>

      {/* 공격대 구성 + 신청자 목록 */}
      <div className="mb-6">
        <RaidStats raidId={id!} isClosed={isClosed} isOwner={isOwner} stats={raid.stats} registrations={raid.registrations} />
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
