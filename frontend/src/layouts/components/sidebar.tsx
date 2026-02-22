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

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  badge?: number
  section?: string
}

const navItems: NavItem[] = [
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
        collapsed ? 'w-[68px]' : 'w-[240px]',
        glassmorphism
          ? 'bg-sidebar/70 backdrop-blur-xl'
          : 'bg-sidebar',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b shrink-0',
        collapsed ? 'justify-center px-2' : 'gap-2 px-6',
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          B
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground whitespace-nowrap">
            BELSI. Монтаж
          </span>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const badge = getBadge(item.path)
            const showSection = !collapsed && item.section && item.section !== lastSection
            if (item.section) lastSection = item.section

            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center rounded-lg transition-colors relative',
                  collapsed
                    ? 'justify-center px-2 py-2.5'
                    : 'gap-3 px-3 py-2',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  'text-sm',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {badge != null && badge > 0 && (
                  collapsed ? (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] text-destructive-foreground">
                      {badge}
                    </span>
                  ) : (
                    <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                      {badge}
                    </Badge>
                  )
                )}
              </Link>
            )

            return (
              <div key={item.path}>
                {showSection && (
                  <div className="mt-4 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                    {item.section}
                  </div>
                )}
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
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
                  'w-full transition-all',
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
