import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/enums'
import { Sword } from 'lucide-react'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 text-yellow-400 font-bold text-lg shrink-0">
          <Sword className="w-5 h-5" />
          WoW 레이드
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">레이드</Link>
          <Link to="/posts?boardType=NOTICE" className="text-gray-300 hover:text-white transition-colors">공지</Link>
          <Link to="/posts?boardType=FREE" className="text-gray-300 hover:text-white transition-colors">자유게시판</Link>
        </nav>

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-3 text-sm ml-auto">
          {isAuthenticated ? (
            <>
              {user?.role === UserRole.ADMIN && (
                <Link to="/admin" className="text-red-400 hover:text-red-300 transition-colors font-medium">어드민</Link>
              )}
              <Link to="/notifications" className="text-gray-300 hover:text-white transition-colors">알림</Link>
              <Link to="/my" className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium">
                {user?.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">로그인</Link>
              <Link
                to="/register"
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-1.5 rounded-lg transition-colors text-sm"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
