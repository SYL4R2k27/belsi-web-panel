import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { usersApi } from '@/shared/api/endpoints/users'
import type { RealCuratorForemanOut } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatPhone } from '@/shared/lib/format'
import { Search, MapPin, Users, Building2 } from 'lucide-react'

export default function ObjectsPage() {
  const [search, setSearch] = useState('')

  // Load foremen with their data — each foreman has team & stats
  const { data: foremen, isLoading } = useQuery({
    queryKey: ['foremen-objects'],
    queryFn: () => usersApi.foremen().then((r) => r.data),
  })

  // Load coordinators
  const { data: coordinators } = useQuery({
    queryKey: ['coordinators-list'],
    queryFn: () => usersApi.list({ role: 'coordinator' }).then((r) => r.data),
  })

  const allForemen = Array.isArray(foremen) ? foremen : []
  const allCoordinators = Array.isArray(coordinators) ? coordinators : []

  const filteredForemen = allForemen.filter((f) => {
    const s = search.toLowerCase()
    return !s || (f.full_name?.toLowerCase().includes(s)) || f.phone.includes(s)
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Объекты"
        description="Просмотр объектов, бригад и координаторов"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allForemen.length}</p>
              <p className="text-sm text-muted-foreground">Бригад</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allCoordinators.length}</p>
              <p className="text-sm text-muted-foreground">Координаторов</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {allForemen.reduce((sum, f) => sum + (f.team_size || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Монтажников всего</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по бригадиру..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Coordinators section */}
      {allCoordinators.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Координаторы</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCoordinators.map((coord: any) => (
              <Card key={coord.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/coordinators/${coord.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {coord.full_name || formatPhone(coord.phone)}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatPhone(coord.phone)}</p>
                    </div>
                    <Badge variant="outline">
                      <MapPin className="mr-1 h-3 w-3" />
                      Координатор
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                    <span>Смен: {coord.total_shifts || 0}</span>
                    <span>Часов: {coord.total_hours || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Foremen / brigades section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Бригады</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        ) : filteredForemen.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Нет бригад для отображения</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredForemen.map((foreman: RealCuratorForemanOut) => (
              <Card key={foreman.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/foremen/${foreman.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {foreman.full_name || formatPhone(foreman.phone)}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatPhone(foreman.phone)}</p>
                    </div>
                    <Badge variant="secondary">{foreman.team_size} чел.</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col rounded border p-2 text-center">
                      <span className="font-bold">{foreman.active_installers_count}</span>
                      <span className="text-xs text-muted-foreground">Активных</span>
                    </div>
                    <div className="flex flex-col rounded border p-2 text-center">
                      <span className="font-bold">{foreman.total_shifts_today}</span>
                      <span className="text-xs text-muted-foreground">Смен сегодня</span>
                    </div>
                    <div className="flex flex-col rounded border p-2 text-center">
                      <span className="font-bold">{foreman.pending_photos_count}</span>
                      <span className="text-xs text-muted-foreground">Фото ожидают</span>
                    </div>
                    <div className="flex flex-col rounded border p-2 text-center">
                      <span className="font-bold">{foreman.completion_percentage}%</span>
                      <span className="text-xs text-muted-foreground">Выполнение</span>
                    </div>
                  </div>
                  {foreman.installers && foreman.installers.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Монтажники:</p>
                      <div className="flex flex-wrap gap-1">
                        {foreman.installers.slice(0, 5).map((inst) => (
                          <Link key={inst.id} to={`/installers/${inst.id}`}>
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                              {inst.full_name || formatPhone(inst.phone)}
                            </Badge>
                          </Link>
                        ))}
                        {foreman.installers.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{foreman.installers.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
