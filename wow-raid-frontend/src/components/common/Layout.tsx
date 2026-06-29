import { Outlet } from 'react-router-dom'
import Header from './Header'
import { useSSE } from '@/hooks/useSSE'

export default function Layout() {
  useSSE()

  return (
    <div className="min-h-screen text-gray-100">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
