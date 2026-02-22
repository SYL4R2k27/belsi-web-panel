import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { shiftsApi } from '@/shared/api/endpoints/shifts'
import type { RealShiftItem, ShiftStatus } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { DataTable } from '@/shared/components/data-table'
import { StatusBadge } from '@/shared/components/status-badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { formatDateTime } from '@/shared/lib/format'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/shared/ui/button'

function formatDurationHours(hours: number | null): string {
  if (hours == null) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0 && m === 0) return '0ч'
  if (h === 0) return `${m}мин`
  if (m === 0) return `${h}ч`
  return `${h}ч ${m}мин`
}

const columns: ColumnDef<RealShiftItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <Link to={`/shifts/${row.original.id}`} className="font-medium hover:underline">
        {row.original.id.slice(0, 8)}
      </Link>
    ),
  },
  {
    accessorKey: 'start_at',
    header: 'Начало',
    cell: ({ row }) => formatDateTime(row.original.start_at),
  },
  {
    accessorKey: 'finish_at',
    header: 'Конец',
    cell: ({ row }) => formatDateTime(row.original.finish_at),
  },
  {
    accessorKey: 'duration_hours',
    header: 'Длительность',
    cell: ({ row }) => formatDurationHours(row.original.duration_hours),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link to={`/shifts/${row.original.id}`}>
        <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
      </Link>
    ),
  },
]

export default function ShiftsPage() {
  const [status, setStatus] = useState<string>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['shifts', { status }],
    queryFn: () =>
      shiftsApi.list({
        status: status !== 'all' ? (status as ShiftStatus) : undefined,
      }).then((r) => r.data),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Смены" description="Мониторинг рабочих смен монтажников" />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        toolbar={
          <div className="flex items-center gap-4">
            <Select value={status} onValueChange={(v) => { setStatus(v) }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="paused">На паузе</SelectItem>
                <SelectItem value="finished">Завершённые</SelectItem>
                <SelectItem value="cancelled">Отменённые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  )
}
