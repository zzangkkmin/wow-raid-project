import type { UserRole } from './enums'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  battletag?: string
  raidLeaderCode?: string
}

export interface FindUsernameRequest {
  email: string
}

export interface TokenResponse {
  accessToken: string
  username: string
  role: UserRole
}

export interface FindUsernameResponse {
  username: string
}

export interface AuthUser {
  username: string
  role: UserRole
}
