import { create } from 'zustand'
import type { AuthUser } from '@/types/auth.types'
import type { UserRole } from '@/types/enums'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: (token, user) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ accessToken: token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    set({ accessToken: null, user: null, isAuthenticated: false })
  },

  hasRole: (role) => get().user?.role === role,
}))

// 앱 시작 시 localStorage에서 유저 정보 복원
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    const user = JSON.parse(storedUser) as AuthUser
    useAuthStore.setState({ user })
  } catch {
    localStorage.removeItem('user')
  }
}
