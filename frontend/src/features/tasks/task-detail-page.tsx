import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/shared/api/endpoints/tasks'
import { PageHeader } from '@/shared/components/page-header'
import { StatusBadge } from '@/shared/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { formatDate, formatDateTime } from '@/shared/lib/format'
import { ArrowLeft } from 'lucide-react'

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: task, isLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="flex flex-col gap-6"><Skeleton className="h-8 w-[300px]" /><Skeleton className="h-[400px]" /></div>
  }

  if (!task) {
    return <div className="text-center text-muted-foreground">Задача не найдена</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/tasks"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader title={task.title} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Описание</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">{task.description || 'Описание не указано'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Детали</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Статус</span><StatusBadge status={task.status} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Приоритет</span><StatusBadge status={task.priority} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Исполнитель</span><span>{task.assigned_to ? task.assigned_to.slice(0, 8) : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Дедлайн</span><span>{formatDate(task.due_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Создана</span><span>{formatDateTime(task.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Создал</span><span>{task.created_by ? task.created_by.slice(0, 8) : '—'}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
