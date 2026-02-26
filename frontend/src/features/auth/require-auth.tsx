import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth-provider'
import { hasRouteAccess, ROLE_DEFAULT_ROUTE } from '@/shared/lib/rbac'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Проверяем, имеет ли роль доступ к текущему маршруту
  // Пропускаем корневой путь — он доступен всем аутентифицированным
  if (location.pathname !== '/' && !hasRouteAccess(user.role, location.pathname)) {
    // Перенаправляем на дефолтный маршрут для роли
    const defaultRoute = ROLE_DEFAULT_ROUTE[user.role] || '/'
    return <Navigate to={defaultRoute} replace />
  }

  return <>{children}</>
}
