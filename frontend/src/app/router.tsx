import { createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { RequireAuth } from '@/features/auth/require-auth'
import { LoginPage } from '@/features/auth/login-page'

import { lazy, Suspense } from 'react'

const DashboardPage = lazy(() => import('@/features/dashboard/dashboard-page'))
const InstallersPage = lazy(() => import('@/features/users/installers-page'))
const InstallerProfilePage = lazy(() => import('@/features/users/installer-profile-page'))
const ForemenPage = lazy(() => import('@/features/users/foremen-page'))
const ForemanProfilePage = lazy(() => import('@/features/users/foreman-profile-page'))
const ShiftsPage = lazy(() => import('@/features/shifts/shifts-page'))
const ShiftDetailPage = lazy(() => import('@/features/shifts/shift-detail-page'))
const PhotosPage = lazy(() => import('@/features/photos/photos-page'))
const TasksPage = lazy(() => import('@/features/tasks/tasks-page'))
const TaskDetailPage = lazy(() => import('@/features/tasks/task-detail-page'))
const SupportPage = lazy(() => import('@/features/support/support-page'))
const ToolsPage = lazy(() => import('@/features/tools/tools-page'))
const MessengerPage = lazy(() => import('@/features/messenger/messenger-page'))
const CoordinatorsPage = lazy(() => import('@/features/coordinators/coordinators-page'))
const CoordinatorProfilePage = lazy(() => import('@/features/coordinators/coordinator-profile-page'))
const ObjectsPage = lazy(() => import('@/features/objects/objects-page'))
const DocumentsPage = lazy(() => import('@/features/documents/documents-page'))
const ProfilePage = lazy(() => import('@/features/profile/profile-page'))
const ReportsPage = lazy(() => import('@/features/reports/reports-page'))
const FinancePage = lazy(() => import('@/features/finance/finance-page'))
const PaymentDetailPage = lazy(() => import('@/features/finance/payment-detail-page'))
const LogsPage = lazy(() => import('@/features/logs/logs-page'))
const SettingsPage = lazy(() => import('@/features/settings/settings-page'))

function PageLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <LazyPage><DashboardPage /></LazyPage> },
      { path: 'installers', element: <LazyPage><InstallersPage /></LazyPage> },
      { path: 'installers/:id', element: <LazyPage><InstallerProfilePage /></LazyPage> },
      { path: 'foremen', element: <LazyPage><ForemenPage /></LazyPage> },
      { path: 'foremen/:id', element: <LazyPage><ForemanProfilePage /></LazyPage> },
      { path: 'coordinators', element: <LazyPage><CoordinatorsPage /></LazyPage> },
      { path: 'coordinators/:id', element: <LazyPage><CoordinatorProfilePage /></LazyPage> },
      { path: 'shifts', element: <LazyPage><ShiftsPage /></LazyPage> },
      { path: 'shifts/:id', element: <LazyPage><ShiftDetailPage /></LazyPage> },
      { path: 'photos', element: <LazyPage><PhotosPage /></LazyPage> },
      { path: 'tasks', element: <LazyPage><TasksPage /></LazyPage> },
      { path: 'tasks/:id', element: <LazyPage><TaskDetailPage /></LazyPage> },
      { path: 'tools', element: <LazyPage><ToolsPage /></LazyPage> },
      { path: 'objects', element: <LazyPage><ObjectsPage /></LazyPage> },
      { path: 'documents', element: <LazyPage><DocumentsPage /></LazyPage> },
      { path: 'messenger', element: <LazyPage><MessengerPage /></LazyPage> },
      { path: 'support', element: <LazyPage><SupportPage /></LazyPage> },
      { path: 'reports', element: <LazyPage><ReportsPage /></LazyPage> },
      { path: 'finance', element: <LazyPage><FinancePage /></LazyPage> },
      { path: 'finance/payments/:id', element: <LazyPage><PaymentDetailPage /></LazyPage> },
      { path: 'logs', element: <LazyPage><LogsPage /></LazyPage> },
      { path: 'settings', element: <LazyPage><SettingsPage /></LazyPage> },
      { path: 'profile', element: <LazyPage><ProfilePage /></LazyPage> },
    ],
  },
], { basename })
