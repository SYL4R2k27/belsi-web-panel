import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { objectsApi } from '@/shared/api/endpoints/objects'
import { usersApi } from '@/shared/api/endpoints/users'
import type { RealSiteObject } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Search, Building2, Plus, MapPin, User } from 'lucide-react'

export default function ObjectsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newCoordinator, setNewCoordinator] = useState<string>('')

  // Load site objects from real API
  const { data: objectsData, isLoading } = useQuery({
    queryKey: ['site-objects'],
    queryFn: () => objectsApi.list().then((r) => r.data),
  })

  // Load coordinators for assignment
  const { data: coordinators } = useQuery({
    queryKey: ['coordinators-list'],
    queryFn: () => usersApi.list({ role: 'coordinator' }).then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; address?: string; coordinator_id?: string }) =>
      objectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-objects'] })
      setShowCreate(false)
      setNewName('')
      setNewAddress('')
      setNewCoordinator('')
    },
  })

  const objects: RealSiteObject[] = objectsData?.objects || []
  const allCoordinators = Array.isArray(coordinators) ? coordinators : []

  const filtered = objects.filter((obj) => {
    const s = search.toLowerCase()
    return (
      !s ||
      obj.name.toLowerCase().includes(s) ||
      obj.address?.toLowerCase().includes(s) ||
      obj.coordinator_name?.toLowerCase().includes(s)
    )
  })

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активный'
      case 'paused': return 'Приостановлен'
      case 'completed': return 'Завершён'
      default: return status
    }
  }

  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active': return 'default'
      case 'paused': return 'secondary'
      case 'completed': return 'outline'
      default: return 'outline'
    }
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    createMutation.mutate({
      name: newName.trim(),
      address: newAddress.trim() || undefined,
      coordinator_id: newCoordinator || undefined,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Объекты"
        description="Управление строительными объектами"
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{objects.length}</p>
              <p className="text-sm text-muted-foreground">Объектов всего</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {objects.filter((o) => o.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Активных</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {objects.filter((o) => o.coordinator_id).length}
              </p>
              <p className="text-sm text-muted-foreground">С координатором</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Create */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по объектам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Новый объект
        </Button>
      </div>

      {/* Objects list */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {objects.length === 0 ? 'Объекты не созданы' : 'Ничего не найдено'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((obj) => (
            <Card key={obj.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate">{obj.name}</h3>
                    {obj.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{obj.address}</span>
                      </p>
                    )}
                  </div>
                  <Badge variant={statusVariant(obj.status)}>
                    {statusLabel(obj.status)}
                  </Badge>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Координатор</span>
                    {obj.coordinator_id ? (
                      <Link
                        to={`/coordinators/${obj.coordinator_id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {obj.coordinator_name || 'Назначен'}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground italic">Не назначен</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Активных смен</span>
                    <span className="font-medium">{obj.active_shifts_count}</span>
                  </div>
                </div>

                {obj.comments && (
                  <p className="text-xs text-muted-foreground mt-3 border-t pt-2 line-clamp-2">
                    {obj.comments}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый объект</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название *</label>
              <Input
                placeholder="Например: ЖК Северный"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Адрес</label>
              <Input
                placeholder="ул. Ленина 42"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Координатор</label>
              <Select value={newCoordinator} onValueChange={setNewCoordinator}>
                <SelectTrigger>
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  {allCoordinators.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createMutation.isPending}>
              {createMutation.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
