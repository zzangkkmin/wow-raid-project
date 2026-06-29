import { useRef, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, BellOff } from 'lucide-react'
import { notificationApi } from '@/api/notification.api'
import { formatRelative } from '@/utils/date.util'
import type { NotificationResponse } from '@/types/notification.types'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getList,
    refetchInterval: 30_000,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const readMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const readAllMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = (n: NotificationResponse) => {
    if (!n.isRead) readMutation.mutate(n.id)
    if (n.relatedRaidId) {
      navigate(`/raids/${n.relatedRaidId}`)
      setOpen(false)
    }
  }

  const recent = notifications.slice(0, 10)

  return (
    <div ref={ref} className="relative">
      {/* 벨 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 text-gray-300 hover:text-white transition-colors"
        aria-label="알림"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="text-sm font-semibold text-white">알림</span>
            {unreadCount > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                disabled={readAllMutation.isPending}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                전체 읽음
              </button>
            )}
          </div>

          {/* 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <BellOff className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">알림이 없습니다.</p>
              </div>
            ) : (
              recent.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-800 last:border-0 transition-colors ${
                    n.isRead ? 'opacity-50 hover:opacity-70' : 'hover:bg-gray-800'
                  }`}
                >
                  {/* 미읽음 점 */}
                  <div className="mt-1.5 shrink-0">
                    {n.isRead ? (
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${n.isRead ? 'text-gray-400' : 'text-white'}`}>
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{formatRelative(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 전체 보기 */}
          {notifications.length > 10 && (
            <div
              className="px-4 py-2.5 text-center text-xs text-gray-400 hover:text-white border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => { navigate('/notifications'); setOpen(false) }}
            >
              전체 알림 보기 ({notifications.length}개)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
