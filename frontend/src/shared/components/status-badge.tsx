import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

const statusColorMap: Record<string, string> = {
  // Shifts
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  finished: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  // Photos
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  // Tasks
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  // Tickets
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  // Payments
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  // Invites
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  // Tools
  good: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  worn: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  damaged: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
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
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium',
        statusColorMap[status] || 'bg-gray-100 text-gray-800',
        className,
      )}
    >
      {statusLabelMap[status] || status}
    </Badge>
  )
}
