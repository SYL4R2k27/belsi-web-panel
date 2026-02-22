import { Link } from 'react-router-dom'
import { useNotifications, type Notification } from '@/app/providers/notification-provider'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import {
  Bell,
  Camera,
  MessageSquare,
  MessageCircle,
  Clock,
  ListTodo,
  AlertCircle,
  CheckCheck,
  Trash2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

function getIcon(type: Notification['type']) {
  switch (type) {
    case 'photo': return <Camera className="h-4 w-4 text-blue-500" />
    case 'support': return <MessageSquare className="h-4 w-4 text-orange-500" />
    case 'message': return <MessageCircle className="h-4 w-4 text-green-500" />
    case 'shift': return <Clock className="h-4 w-4 text-purple-500" />
    case 'task': return <ListTodo className="h-4 w-4 text-yellow-500" />
    case 'system': return <AlertCircle className="h-4 w-4 text-red-500" />
    default: return <Bell className="h-4 w-4" />
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return `${diffMin} мин. назад`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs} ч. назад`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays} дн. назад`
}

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-sm">Уведомления</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3" />
                <span className="hidden sm:inline">Прочитать все</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={clearAll}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Bell className="h-8 w-8" />
              <p className="text-sm">Нет уведомлений</p>
            </div>
          ) : (
            notifications.map((n) => {
              const content = (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent border-b last:border-b-0 cursor-pointer',
                    !n.read && 'bg-primary/5',
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', !n.read && 'font-medium')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {formatTimeAgo(n.timestamp)}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              )

              if (n.link) {
                return (
                  <Link key={n.id} to={n.link} className="block">
                    {content}
                  </Link>
                )
              }

              return content
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
