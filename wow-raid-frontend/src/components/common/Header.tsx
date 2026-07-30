import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/enums'
import { Sword, ShieldCheck, Menu, X, LogOut } from 'lucide-react'
import NotificationBell from '@/components/common/NotificationBell'

const NAV_LINKS = [
  { to: '/', label: '레이드' },
  { to: '/posts?boardType=NOTICE', label: '공지' },
  { to: '/posts?boardType=FREE', label: '자유게시판' },
]

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => { setMenuOpen(false) }, [location])

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/60 sticky top-0 z-50" ref={menuRef}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 text-yellow-400 font-bold text-lg shrink-0">
          <Sword className="w-5 h-5" />
          WoW 레이드
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-gray-300 hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 우측 영역 */}
        <div className="flex items-center gap-3 text-sm ml-auto">
          {isAuthenticated ? (
            <>
              {user?.role === UserRole.ADMIN && (
                <Link
                  to="/admin"
                  title="관리자 설정"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                </Link>
              )}
              <NotificationBell />
              <Link to="/my" className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium hidden sm:block">
                {user?.username}
              </Link>
              {/* 데스크탑 로그아웃 */}
              <button
                onClick={handleLogout}
                className="hidden md:block text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors hidden md:block">로그인</Link>
              <Link
                to="/register"
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-1.5 rounded-lg transition-colors text-sm hidden md:block"
              >
                회원가입
              </Link>
            </>
          )}

          {/* 햄버거 버튼 — 모바일 전용 */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="메뉴"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-250 ease-in-out ${
          menuOpen ? 'max-h-96 border-t border-gray-700/60' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-4 py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-2 py-3 text-sm text-gray-300 hover:text-white border-b border-gray-800 last:border-none transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                to="/my"
                className="flex items-center gap-3 px-2 py-3 text-sm text-yellow-400 hover:text-yellow-300 border-b border-gray-800 transition-colors sm:hidden"
              >
                {user?.username}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-2 py-3 text-sm text-gray-400 hover:text-red-400 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-3 px-2 py-3 text-sm text-gray-300 hover:text-white border-b border-gray-800 transition-colors">
                로그인
              </Link>
              <Link to="/register" className="flex items-center gap-3 px-2 py-3 text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
