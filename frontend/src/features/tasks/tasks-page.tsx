import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { tasksApi, type CreateTaskData } from '@/shared/api/endpoints/tasks'
import type { RealTaskOut } from '@/shared/types'
import { TaskPriority as TP } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { DataTable } from '@/shared/components/data-table'
import { StatusBadge } from '@/shared/components/status-badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { formatDate, formatDateTime } from '@/shared/lib/format'
import { toast } from 'sonner'
import { Plus, AlertTriangle } from 'lucide-react'

const columns: ColumnDef<RealTaskOut>[] = [
  {
    accessorKey: 'title',
    header: 'Задача',
    cell: ({ row }) => (
      <div>
        <Link to={`/tasks/${row.original.id}`} className="font-medium hover:underline">
          {row.original.title}
        </Link>
        {row.original.due_at && new Date(row.original.due_at) < new Date() && row.original.status !== 'done' && row.original.status !== 'cancelled' && (
          <div className="mt-0.5 flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle className="h-3 w-3" /> Просрочена
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'assigned_to',
    header: 'Исполнитель',
    cell: ({ row }) => row.original.assigned_to
      ? row.original.assigned_to.slice(0, 8)
      : '—',
  },
  {
    accessorKey: 'priority',
    header: 'Приоритет',
    cell: ({ row }) => <StatusBadge status={row.original.priority} />,
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'due_at',
    header: 'Дедлайн',
    cell: ({ row }) => formatDate(row.original.due_at),
  },
  {
    accessorKey: 'created_at',
    header: 'Создана',
    cell: ({ row }) => formatDate(row.original.created_at),
  },
]

export default function TasksPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<string>('all')
  const [priority, setPriority] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<CreateTaskData>({ title: '', priority: TP.MEDIUM })

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['tasks', { status }],
    queryFn: () =>
      tasksApi.list({
        status: status !== 'all' ? status : undefined,
      }).then((r) => r.data),
  })

  const filteredData = useMemo(() => {
    if (!rawData) return []
    if (priority === 'all') return rawData
    return rawData.filter((task) => task.priority === priority)
  }, [rawData, priority])

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Задача создана')
      setCreateOpen(false)
      setForm({ title: '', priority: TP.MEDIUM })
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Задачи"
        description="Управление задачами и назначениями"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Создать задачу
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        toolbar={
          <div className="flex items-center gap-4">
            <Select value={status} onValueChange={(v) => { setStatus(v) }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="new">Новые</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="done">Выполнены</SelectItem>
                <SelectItem value="cancelled">Отменены</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => { setPriority(v) }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Приоритет" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="urgent">Срочный</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новая задача</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Название</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Название задачи" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Описание</Label>
              <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание задачи" rows={3} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Приоритет</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button disabled={!form.title.trim() || createMutation.isPending} onClick={() => createMutation.mutate(form)}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
