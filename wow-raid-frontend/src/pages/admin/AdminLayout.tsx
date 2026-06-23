import { NavLink, Outlet } from 'react-router-dom'
import { Users, Sword, FileText } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/users', label: '회원 관리', icon: Users },
  { to: '/admin/raids', label: '레이드 관리', icon: Sword },
  { to: '/admin/posts', label: '게시글 관리', icon: FileText },
]

export default function AdminLayout() {
  return (
    <div className="flex gap-6">
      <aside className="w-48 shrink-0">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 sticky top-24">
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider px-3 mb-3">Admin</p>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-red-900 text-red-300'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
