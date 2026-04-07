import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

const statusConfig: Record<string, { color: string; dot: string }> = {
  // Shifts
  active: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  paused: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  finished: { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  cancelled: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  // Photos
  pending: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  approved: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  rejected: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  // Tasks
  new: { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  in_progress: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  done: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  // Tickets
  open: { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  resolved: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  closed: { color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  // Payments
  paid: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  // Invites
  accepted: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  expired: { color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  // Tools
  good: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  worn: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  damaged: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  lost: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

const statusLabelMap: Record<string, string> = {
  active: 'Активна',
  paused: 'Пауза',
  finished: 'Завершена',
  cancelled: 'Отменена',
  pending: 'Ожидает',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Выполнена',
  open: 'Открыт',
  resolved: 'Решён',
  closed: 'Закрыт',
  paid: 'Оплачено',
  accepted: 'Принят',
  expired: 'Истёк',
  good: 'Хорошее',
  worn: 'Изношено',
  damaged: 'Повреждено',
  lost: 'Утеряно',
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный',
  technical: 'Техническая',
  payment: 'Оплата',
  schedule: 'Расписание',
  other: 'Другое',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const defaultConfig = { color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' }
  const { color, dot } = config || defaultConfig

  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium border-0 gap-1.5',
        color,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />
      {statusLabelMap[status] || status}
    </Badge>
  )
}
