import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { usersApi } from '@/shared/api/endpoints/users'
import type { RealCuratorForemanOut } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { DataTable } from '@/shared/components/data-table'
import { Input } from '@/shared/ui/input'
import { formatPhone } from '@/shared/lib/format'
import { Search } from 'lucide-react'

const columns: ColumnDef<RealCuratorForemanOut>[] = [
  {
    accessorKey: 'full_name',
    header: 'Имя',
    cell: ({ row }) => {
      const name = row.original.full_name || `${row.original.last_name ?? ''} ${row.original.first_name ?? ''}`.trim() || '—'
      return (
        <Link to={`/foremen/${row.original.id}`} className="font-medium text-primary hover:underline">
          {name}
        </Link>
      )
    },
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
    cell: ({ row }) => formatPhone(row.original.phone),
  },
  {
    accessorKey: 'team_size',
    header: 'Команда',
    cell: ({ row }) => row.original.team_size ?? 0,
  },
  {
    accessorKey: 'active_installers_count',
    header: 'Активных',
    cell: ({ row }) => row.original.active_installers_count ?? 0,
  },
  {
    accessorKey: 'total_shifts_today',
    header: 'Смен сегодня',
    cell: ({ row }) => row.original.total_shifts_today ?? 0,
  },
  {
    accessorKey: 'pending_photos_count',
    header: 'Ожидают фото',
    cell: ({ row }) => row.original.pending_photos_count ?? 0,
  },
  {
    accessorKey: 'completion_percentage',
    header: 'Выполнение',
    cell: ({ row }) => `${row.original.completion_percentage ?? 0}%`,
  },
]

export default function ForemenPage() {
  const [search, setSearch] = useState('')

  const { data: foremen, isLoading } = useQuery({
    queryKey: ['users', 'foremen'],
    queryFn: () => usersApi.foremen().then((r) => r.data),
  })

  const filtered = useMemo(() => {
    if (!foremen) return []
    if (!search.trim()) return foremen
    const q = search.toLowerCase()
    return foremen.filter(
      (u) =>
        (u.full_name?.toLowerCase().includes(q)) ||
        (u.first_name?.toLowerCase().includes(q)) ||
        (u.last_name?.toLowerCase().includes(q)) ||
        u.phone.includes(q)
    )
  }, [foremen, search])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Бригадиры" description="Управление руководителями бригад" />
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        toolbar={
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени или телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        }
      />
    </div>
  )
}
