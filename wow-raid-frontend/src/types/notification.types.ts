import type { NotificationType } from './enums'

export interface NotificationResponse {
  id: string
  message: string
  type: NotificationType
  isRead: boolean
  relatedRaidId: string | null
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}
