import client from './client'
import type { UserRole } from '@/types/enums'

export const adminApi = {
  getUsers: (page = 0, size = 20) =>
    client.get('/api/admin/users', { params: { page, size } }),

  changeRole: (id: string, role: UserRole) =>
    client.patch<void, void>(`/api/admin/users/${id}/role`, null, { params: { role } }),

  forceWithdraw: (id: string) =>
    client.delete<void, void>(`/api/admin/users/${id}`),

  forceDeleteRaid: (id: string) =>
    client.delete<void, void>(`/api/admin/raids/${id}`),

  forceDeletePost: (id: string) =>
    client.delete<void, void>(`/api/admin/posts/${id}`),
}
