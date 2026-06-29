import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8088',
  headers: { 'Content-Type': 'application/json' },
})

// Request 인터셉터 — JWT 자동 주입
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response 인터셉터 — ApiResponse 래퍼 제거 + 에러 처리
client.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/api/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    const message = error.response?.data?.message ?? '서버 오류가 발생했습니다.'
    return Promise.reject(new Error(message))
  },
)

export default client
