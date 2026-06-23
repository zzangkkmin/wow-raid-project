import client from './client'
import type { PostDetailResponse, PostListResponse, PostRequest } from '@/types/post.types'
import type { BoardType } from '@/types/enums'
import type { Page } from '@/types/common.types'

export const postApi = {
  getList: (boardType: BoardType, page = 0, size = 20) =>
    client.get<void, Page<PostListResponse>>('/api/posts', { params: { boardType, page, size } }),

  getDetail: (id: string) =>
    client.get<void, PostDetailResponse>(`/api/posts/${id}`),

  create: (data: PostRequest) =>
    client.post<void, PostDetailResponse>('/api/posts', data),

  update: (id: string, data: PostRequest) =>
    client.put<void, PostDetailResponse>(`/api/posts/${id}`, data),

  delete: (id: string) =>
    client.delete<void, void>(`/api/posts/${id}`),
}
