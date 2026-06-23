import client from './client'
import type { NotificationResponse, UnreadCountResponse } from '@/types/notification.types'

export const notificationApi = {
  getList: () =>
    client.get<void, NotificationResponse[]>('/api/notifications'),

  getUnreadCount: () =>
    client.get<void, UnreadCountResponse>('/api/notifications/unread-count'),

  markAsRead: (id: string) =>
    client.patch<void, void>(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    client.patch<void, void>('/api/notifications/read-all'),
}
