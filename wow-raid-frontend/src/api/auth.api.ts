import client from './client'
import type {
  LoginRequest,
  RegisterRequest,
  FindUsernameRequest,
  TokenResponse,
  FindUsernameResponse,
} from '@/types/auth.types'

export const authApi = {
  register: (data: RegisterRequest) =>
    client.post<void, void>('/api/auth/register', data),

  login: (data: LoginRequest) =>
    client.post<void, TokenResponse>('/api/auth/login', data),

  findUsername: (data: FindUsernameRequest) =>
    client.post<void, FindUsernameResponse>('/api/auth/find-username', data),
}
