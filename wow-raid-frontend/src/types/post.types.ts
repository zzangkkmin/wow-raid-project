import type { BoardType } from './enums'

export interface PostListResponse {
  id: string
  boardType: BoardType
  title: string
  author: string
  viewCount: number
  pinned: boolean
  createdAt: string
}

export interface PostDetailResponse extends PostListResponse {
  content: string
  updatedAt: string
}

export interface PostRequest {
  boardType: BoardType
  title: string
  content: string
}
