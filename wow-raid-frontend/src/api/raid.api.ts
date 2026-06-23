import client from './client'
import type { RaidDetailResponse, RaidListResponse, RaidListParams, RaidRequest } from '@/types/raid.types'
import type { Page } from '@/types/common.types'

export const raidApi = {
  getList: (params?: RaidListParams) =>
    client.get<void, Page<RaidListResponse>>('/api/raids', { params }),

  getDetail: (id: string) =>
    client.get<void, RaidDetailResponse>(`/api/raids/${id}`),

  create: (data: RaidRequest) =>
    client.post<void, RaidListResponse>('/api/raids', data),

  update: (id: string, data: RaidRequest) =>
    client.put<void, RaidListResponse>(`/api/raids/${id}`, data),

  delete: (id: string) =>
    client.delete<void, void>(`/api/raids/${id}`),
}
