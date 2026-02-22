import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toolsApi, type CreateToolData } from '@/shared/api/endpoints/tools'
import type { RealToolOut } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { DataTable } from '@/shared/components/data-table'
import { StatusBadge } from '@/shared/components/status-badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { formatDate } from '@/shared/lib/format'
import { toast } from 'sonner'
import { Search, Plus } from 'lucide-react'

const columns: ColumnDef<RealToolOut>[] = [
  {
    accessorKey: 'name',
    header: 'Название',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        {row.original.description && (
          <div className="text-xs text-muted-foreground">{row.original.description}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'serial_number',
    header: 'Серийный номер',
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'foreman',
    header: 'Бригадир',
    cell: ({ row }) => row.original.foreman
      ? (row.original.foreman.full_name || row.original.foreman.phone)
      : '\u2014',
  },
  {
    accessorKey: 'created_at',
    header: 'Дата создания',
    cell: ({ row }) => formatDate(row.original.created_at),
  },
]

export default function ToolsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<CreateToolData>({ name: '', foreman_id: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['tools', { search }],
    queryFn: () => toolsApi.list({ status: search || undefined }).then((r) => r.data),
  })

  const tools = data?.items ?? []

  const createMutation = useMutation({
    mutationFn: (data: CreateToolData) => toolsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      toast.success('Инструмент добавлен')
      setCreateOpen(false)
      setForm({ name: '', foreman_id: '' })
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Инструменты"
        description="Учёт и управление инструментами и оборудованием"
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Добавить</Button>}
      />
      <DataTable
        columns={columns}
        data={tools}
        isLoading={isLoading}
        toolbar={
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск инструментов..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новый инструмент</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Название</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bosch GBH 2-26" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Описание</Label>
              <Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Перфоратор" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Серийный номер</Label>
              <Input value={form.serial_number || ''} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} placeholder="SN-12345" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>ID бригадира</Label>
              <Input value={form.foreman_id} onChange={(e) => setForm({ ...form, foreman_id: e.target.value })} placeholder="UUID бригадира" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Отмена</Button>
            <Button disabled={!form.name.trim() || !form.foreman_id.trim() || createMutation.isPending} onClick={() => createMutation.mutate(form)}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
