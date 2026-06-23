export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
