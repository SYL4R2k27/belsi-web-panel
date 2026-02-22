import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { usersApi } from '@/shared/api/endpoints/users'
import type { RealUserOut } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { DataTable } from '@/shared/components/data-table'
import { StatusBadge } from '@/shared/components/status-badge'
import { Input } from '@/shared/ui/input'
import { formatPhone, formatTimeAgo } from '@/shared/lib/format'
import { Search } from 'lucide-react'

const columns: ColumnDef<RealUserOut>[] = [
  {
    accessorKey: 'full_name',
    header: 'Имя',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.full_name || `${row.original.last_name ?? ''} ${row.original.first_name ?? ''}`.trim() || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
    cell: ({ row }) => formatPhone(row.original.phone),
  },
  {
    accessorKey: 'is_active_today',
    header: 'Статус',
    cell: ({ row }) => (
      <StatusBadge status={row.original.is_active_today ? 'active' : 'cancelled'} />
    ),
  },
  {
    accessorKey: 'pending_photos_count',
    header: 'Ожидают фото',
    cell: ({ row }) => row.original.pending_photos_count ?? 0,
  },
  {
    accessorKey: 'total_shifts',
    header: 'Смен',
    cell: ({ row }) => row.original.total_shifts ?? 0,
  },
  {
    accessorKey: 'total_hours',
    header: 'Часов',
    cell: ({ row }) => row.original.total_hours ?? 0,
  },
  {
    accessorKey: 'last_activity_at',
    header: 'Последняя активность',
    cell: ({ row }) => formatTimeAgo(row.original.last_activity_at),
  },
]

export default function InstallersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: installers, isLoading } = useQuery({
    queryKey: ['users', 'installers'],
    queryFn: () => usersApi.list({ role: 'installer' }).then((r) => r.data),
  })

  const filtered = useMemo(() => {
    if (!installers) return []
    if (!search.trim()) return installers
    const q = search.toLowerCase()
    return installers.filter(
      (u) =>
        (u.full_name?.toLowerCase().includes(q)) ||
        (u.first_name?.toLowerCase().includes(q)) ||
        (u.last_name?.toLowerCase().includes(q)) ||
        u.phone.includes(q)
    )
  }, [installers, search])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Монтажники" description="Управление полевыми сотрудниками" />
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        toolbar={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или телефону..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        }
      />
    </div>
  )
}
