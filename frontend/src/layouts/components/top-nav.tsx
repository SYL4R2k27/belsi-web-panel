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
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Монтажники', path: '/installers', icon: Users },
  { label: 'Бригадиры', path: '/foremen', icon: HardHat },
  { label: 'Координаторы', path: '/coordinators', icon: MapPin },
  { label: 'Смены', path: '/shifts', icon: Clock },
  { label: 'Фото', path: '/photos', icon: Camera },
  { label: 'Задачи', path: '/tasks', icon: ListTodo },
  { label: 'Инструменты', path: '/tools', icon: Wrench },
  { label: 'Объекты', path: '/objects', icon: Building2 },
  { label: 'Документы', path: '/documents', icon: FileText },
  { label: 'Мессенджер', path: '/messenger', icon: MessageCircle },
  { label: 'Поддержка', path: '/support', icon: MessageSquare },
  { label: 'Аналитика', path: '/reports', icon: BarChart3 },
  { label: 'Финансы', path: '/finance', icon: Wallet },
  { label: 'Логи', path: '/logs', icon: ScrollText },
  { label: 'Настройки', path: '/settings', icon: Settings },
]

interface TopNavProps {
  pendingPhotos?: number
  openTickets?: number
  unreadMessages?: number
}

export function TopNav({ pendingPhotos, openTickets, unreadMessages }: TopNavProps) {
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

  return (
    <div className="border-b bg-sidebar/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-2 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            B
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground hidden lg:block">
            BELSI. Монтаж
          </span>
        </Link>

        <ScrollArea className="flex-1">
          <nav className="flex items-center gap-0.5 py-1.5">
            {navItems.map((item) => {
              const active = isActive(item.path)
              const badge = getBadge(item.path)

              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        'relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors whitespace-nowrap',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden xl:inline">{item.label}</span>
                      {badge != null && badge > 0 && (
                        <Badge variant="destructive" className="h-4 min-w-4 px-0.5 text-[9px] absolute -top-1 -right-1">
                          {badge}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {item.label}
                    {badge != null && badge > 0 && ` (${badge})`}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
