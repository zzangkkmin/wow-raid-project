import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '@/api/notification.api'
import { NotificationType } from '@/types/enums'
import { formatRelative } from '@/utils/date.util'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { BellOff, CheckCheck } from 'lucide-react'

const NOTIFICATION_ICON: Record<NotificationType, string> = {
  [NotificationType.NEW_RAID]: '⚔️',
  [NotificationType.REGISTRATION_COMPLETE]: '✅',
  [NotificationType.REGISTRATION_CANCELLED]: '❌',
  [NotificationType.STATUS_CHANGED]: '🔄',
  [NotificationType.RAID_CLOSED]: '🔒',
  [NotificationType.RAID_UPDATED]: '📝',
}

export default function NotificationPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getList,
  })

  const readMutation = useMutation({ mutationFn: notificationApi.markAsRead, onSuccess: invalidate })
  const readAllMutation = useMutation({ mutationFn: notificationApi.markAllAsRead, onSuccess: invalidate })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleClick = (id: string, relatedRaidId: string | null, isRead: boolean) => {
    if (!isRead) readMutation.mutate(id)
    if (relatedRaidId) navigate(`/raids/${relatedRaidId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">알림</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            전체 읽음
          </button>
        )}
      </div>

      {/* 알림 목록 */}
      {isLoading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BellOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n.id, n.relatedRaidId, n.isRead)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                n.isRead
                  ? 'bg-gray-800 border-gray-700 opacity-60 hover:opacity-80'
                  : 'bg-gray-800 border-gray-600 hover:border-yellow-600'
              }`}
            >
              {/* 아이콘 */}
              <span className="text-xl shrink-0 mt-0.5">{NOTIFICATION_ICON[n.type]}</span>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? 'text-gray-400' : 'text-white'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{formatRelative(n.createdAt)}</p>
              </div>

              {/* 읽지 않음 표시 */}
              {!n.isRead && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
