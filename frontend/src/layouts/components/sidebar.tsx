import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  HardHat,
  MapPin,
  Clock,
  Camera,
  ListTodo,
  MessageSquare,
  MessageCircle,
  Wrench,
  Building2,
  FileText,
  BarChart3,
  Wallet,
  ScrollText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { UserRole } from '@/shared/types'
import { filterNavByRole, ROLE_LABELS } from '@/shared/lib/rbac'
import { useAuth } from '@/app/providers/auth-provider'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  badge?: number
  section?: string
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Монтажники', path: '/installers', icon: Users, section: 'Персонал' },
  { label: 'Бригадиры', path: '/foremen', icon: HardHat },
  { label: 'Координаторы', path: '/coordinators', icon: MapPin },
  { label: 'Смены', path: '/shifts', icon: Clock, section: 'Операции' },
  { label: 'Фото', path: '/photos', icon: Camera },
  { label: 'Задачи', path: '/tasks', icon: ListTodo },
  { label: 'Инструменты', path: '/tools', icon: Wrench },
  { label: 'Объекты', path: '/objects', icon: Building2 },
  { label: 'Документы', path: '/documents', icon: FileText },
  { label: 'Мессенджер', path: '/messenger', icon: MessageCircle, section: 'Коммуникации' },
  { label: 'Поддержка', path: '/support', icon: MessageSquare },
  { label: 'Аналитика', path: '/reports', icon: BarChart3, section: 'Отчёты' },
  { label: 'Финансы', path: '/finance', icon: Wallet },
  { label: 'Логи', path: '/logs', icon: ScrollText, section: 'Система' },
  { label: 'Настройки', path: '/settings', icon: Settings },
]

// Key items for mobile bottom nav
const mobileNavItems = [
  { label: 'Главная', path: '/', icon: LayoutDashboard },
  { label: 'Фото', path: '/photos', icon: Camera },
  { label: 'Смены', path: '/shifts', icon: Clock },
  { label: 'Чат', path: '/messenger', icon: MessageCircle },
  { label: 'Ещё', path: '/settings', icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  pendingPhotos?: number
  openTickets?: number
  unreadMessages?: number
  glassmorphism?: boolean
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  pendingPhotos,
  openTickets,
  unreadMessages,
  glassmorphism = false,
}: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()

  const userRole = user?.role || UserRole.CURATOR
  const navItems = filterNavByRole(allNavItems, userRole)
  const roleLabel = ROLE_LABELS[userRole]

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  function getBadge(path: string): number | undefined {
    if (path === '/photos') return pendingPhotos
    if (path === '/support') return openTickets
    if (path === '/messenger') return unreadMessages
    return undefined
  }

  let lastSection = ''

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[260px]',
        glassmorphism
          ? 'bg-sidebar/80 backdrop-blur-2xl'
          : 'bg-sidebar',
      )}
    >
      {/* Logo + role */}
      <div className={cn(
        'flex h-16 items-center border-b shrink-0',
        collapsed ? 'justify-center px-2' : 'gap-3 px-5',
      )}>
        <img src={`${import.meta.env.BASE_URL}logo-60.png`} alt="BELSI" className="h-9 w-9 shrink-0 rounded-xl shadow-sm" />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-sidebar-foreground tracking-tight whitespace-nowrap leading-tight">
              BELSI<span className="text-primary">.Монтаж</span>
            </span>
            <span className="text-[10px] font-medium text-sidebar-foreground/40 leading-tight truncate uppercase tracking-wider">
              {roleLabel}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const badge = getBadge(item.path)
            const showSection = !collapsed && item.section && item.section !== lastSection
            if (item.section) lastSection = item.section

            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center rounded-xl transition-all duration-200 relative group',
                  collapsed
                    ? 'justify-center px-2 py-2.5'
                    : 'gap-3 px-3 py-2',
                  active
                    ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  'text-[13px]',
                )}
              >
                <item.icon className={cn(
                  'h-[18px] w-[18px] shrink-0 transition-colors',
                  active ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80',
                )} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {badge != null && badge > 0 && (
                  collapsed ? (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-accent-foreground px-1 text-[9px] font-bold">
                      {badge}
                    </span>
                  ) : (
                    <Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-accent text-accent-foreground hover:bg-accent border-0">
                      {badge}
                    </Badge>
                  )
                )}
              </Link>
            )

            return (
              <div key={item.path}>
                {showSection && (
                  <div className="mt-5 mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30">
                    {item.section}
                  </div>
                )}
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                      {badge != null && badge > 0 && ` (${badge})`}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      {onToggleCollapse && (
        <div className="border-t p-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className={cn(
                  'w-full transition-all rounded-xl',
                  collapsed ? 'justify-center px-2' : 'justify-start gap-2',
                )}
              >
                {collapsed ? (
                  <ChevronsRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="text-xs">Свернуть</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Развернуть</TooltipContent>}
          </Tooltip>
        </div>
      )}
    </aside>
  )
}

/* Mobile Bottom Navigation */
export function MobileBottomNav({
  pendingPhotos,
  unreadMessages,
}: {
  pendingPhotos?: number
  unreadMessages?: number
}) {
  const location = useLocation()

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  function getBadge(path: string): number | undefined {
    if (path === '/photos') return pendingPhotos
    if (path === '/messenger') return unreadMessages
    return undefined
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur-xl pb-safe">
      <div className="flex items-center justify-around h-14">
        {mobileNavItems.map((item) => {
          const active = isActive(item.path)
          const badge = getBadge(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 relative transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <div className="relative">
                <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[8px] font-bold px-0.5">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] leading-none', active ? 'font-bold' : 'font-medium')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
