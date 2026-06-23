import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { UserRole } from '@/types/enums'

// Pages - Lazy import
import { lazy, Suspense, type ComponentType } from 'react'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const wrap = (Component: ReturnType<typeof lazy<ComponentType>>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
)

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const FindUsernamePage = lazy(() => import('@/pages/auth/FindUsernamePage'))

// Raid
const RaidListPage = lazy(() => import('@/pages/raid/RaidListPage'))
const RaidDetailPage = lazy(() => import('@/pages/raid/RaidDetailPage'))
const RaidFormPage = lazy(() => import('@/pages/raid/RaidFormPage'))

// User
const MyPage = lazy(() => import('@/pages/user/MyPage'))
const CharacterPage = lazy(() => import('@/pages/user/CharacterPage'))

// Post
const PostListPage = lazy(() => import('@/pages/post/PostListPage'))
const PostDetailPage = lazy(() => import('@/pages/post/PostDetailPage'))
const PostFormPage = lazy(() => import('@/pages/post/PostFormPage'))

// Notification
const NotificationPage = lazy(() => import('@/pages/notification/NotificationPage'))

// Admin
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminUserPage = lazy(() => import('@/pages/admin/AdminUserPage'))
const AdminRaidPage = lazy(() => import('@/pages/admin/AdminRaidPage'))
const AdminPostPage = lazy(() => import('@/pages/admin/AdminPostPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // 공개
      { index: true, element: wrap(RaidListPage) },
      { path: 'raids/:id', element: wrap(RaidDetailPage) },
      { path: 'posts', element: wrap(PostListPage) },
      { path: 'posts/:id', element: wrap(PostDetailPage) },
      { path: 'login', element: wrap(LoginPage) },
      { path: 'register', element: wrap(RegisterPage) },
      { path: 'find-username', element: wrap(FindUsernamePage) },

      // 로그인 필요
      {
        path: 'my',
        element: <ProtectedRoute>{wrap(MyPage)}</ProtectedRoute>,
      },
      {
        path: 'my/characters',
        element: <ProtectedRoute>{wrap(CharacterPage)}</ProtectedRoute>,
      },
      {
        path: 'notifications',
        element: <ProtectedRoute>{wrap(NotificationPage)}</ProtectedRoute>,
      },
      {
        path: 'posts/new',
        element: <ProtectedRoute>{wrap(PostFormPage)}</ProtectedRoute>,
      },
      {
        path: 'posts/:id/edit',
        element: <ProtectedRoute>{wrap(PostFormPage)}</ProtectedRoute>,
      },

      // 공격대장 전용
      {
        path: 'raids/new',
        element: (
          <ProtectedRoute requiredRole={UserRole.RAID_LEADER}>
            {wrap(RaidFormPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'raids/:id/edit',
        element: (
          <ProtectedRoute requiredRole={UserRole.RAID_LEADER}>
            {wrap(RaidFormPage)}
          </ProtectedRoute>
        ),
      },

      // 어드민 전용
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            {wrap(AdminLayout)}
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: wrap(AdminUserPage) },
          { path: 'users', element: wrap(AdminUserPage) },
          { path: 'raids', element: wrap(AdminRaidPage) },
          { path: 'posts', element: wrap(AdminPostPage) },
        ],
      },
    ],
  },
])
