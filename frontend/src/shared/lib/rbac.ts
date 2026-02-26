import { UserRole } from '@/shared/types'

// ==========================================
// RBAC — Role-Based Access Control
// ==========================================

/**
 * Какие маршруты доступны каждой роли.
 * Маршрут считается доступным, если pathname начинается с указанного path.
 */

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  // Куратор — полный доступ ко всем разделам
  [UserRole.CURATOR]: [
    '/',
    '/installers',
    '/foremen',
    '/coordinators',
    '/shifts',
    '/photos',
    '/tasks',
    '/tools',
    '/objects',
    '/documents',
    '/messenger',
    '/support',
    '/reports',
    '/finance',
    '/logs',
    '/settings',
    '/profile',
  ],

  // Координатор — объекты, бригады, смены, фото, задачи, коммуникации
  [UserRole.COORDINATOR]: [
    '/',
    '/objects',
    '/foremen',
    '/installers',
    '/shifts',
    '/photos',
    '/tasks',
    '/messenger',
    '/support',
    '/profile',
  ],

  // Бригадир — своя бригада, смены, фото, задачи, инструменты
  [UserRole.FOREMAN]: [
    '/',
    '/installers',
    '/shifts',
    '/photos',
    '/tasks',
    '/tools',
    '/messenger',
    '/support',
    '/profile',
  ],

  // Монтажник — только личные данные
  [UserRole.INSTALLER]: [
    '/',
    '/shifts',
    '/photos',
    '/tasks',
    '/messenger',
    '/support',
    '/profile',
  ],
}

/**
 * Названия ролей по-русски
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CURATOR]: 'Куратор',
  [UserRole.COORDINATOR]: 'Координатор',
  [UserRole.FOREMAN]: 'Бригадир',
  [UserRole.INSTALLER]: 'Монтажник',
}

/**
 * Дефолтная страница после логина для каждой роли
 */
export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  [UserRole.CURATOR]: '/',
  [UserRole.COORDINATOR]: '/objects',
  [UserRole.FOREMAN]: '/installers',
  [UserRole.INSTALLER]: '/shifts',
}

/**
 * Проверяет, имеет ли роль доступ к указанному пути
 */
export function hasRouteAccess(role: UserRole, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role]
  if (!allowed) return false

  // Точное совпадение для корневого маршрута
  if (pathname === '/') {
    return allowed.includes('/')
  }

  // Для остальных — проверяем, что pathname начинается с одного из разрешённых
  return allowed.some((route) => {
    if (route === '/') return false // '/' не матчит вложенные пути
    return pathname === route || pathname.startsWith(route + '/')
  })
}

/**
 * Фильтрует навигационные элементы по роли пользователя
 */
export function filterNavByRole<T extends { path: string }>(items: T[], role: UserRole): T[] {
  const allowed = ROLE_ROUTES[role]
  if (!allowed) return []

  return items.filter((item) => {
    if (item.path === '/') return allowed.includes('/')
    return allowed.some((route) => {
      if (route === '/') return false
      return item.path === route || item.path.startsWith(route + '/')
    })
  })
}
