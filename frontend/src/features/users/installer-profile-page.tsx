import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/shared/api/endpoints/users'
import { photosApi } from '@/shared/api/endpoints/photos'
import { shiftsApi } from '@/shared/api/endpoints/shifts'
import { tasksApi } from '@/shared/api/endpoints/tasks'
import { PageHeader } from '@/shared/components/page-header'
import { StatusBadge } from '@/shared/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
import { formatPhone, formatDate, formatDateTime } from '@/shared/lib/format'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Clock,
  Camera,
  CheckCircle,
  XCircle,
  ClipboardList,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  MessageSquare,
} from 'lucide-react'

export default function InstallerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 })

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })

  const { data: photosData } = useQuery({
    queryKey: ['photos', 'user', id],
    queryFn: () => photosApi.list({ user_id: id }).then((r) => r.data),
    enabled: !!id,
  })

  const { data: shiftsData } = useQuery({
    queryKey: ['shifts', 'user', id],
    queryFn: () => shiftsApi.list({ user_id: id }).then((r) => r.data),
    enabled: !!id,
  })

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'user', id],
    queryFn: () => tasksApi.list().then((r) => r.data),
    enabled: !!id,
  })

  const approveMutation = useMutation({
    mutationFn: (photoId: string) => photosApi.approve(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      toast.success('Фото одобрено')
    },
  })

  const photos = photosData?.photos ?? []
  const shifts = shiftsData?.items ?? (Array.isArray(shiftsData) ? shiftsData : [])
  const tasks = Array.isArray(tasksData) ? tasksData.filter((t: any) => t.assigned_to === id) : []

  // Split photos: current shift vs other
  const currentShiftPhotos = profile?.current_shift_id
    ? photos.filter((p: any) => p.shift_id === profile.current_shift_id)
    : []
  const otherPhotos = profile?.current_shift_id
    ? photos.filter((p: any) => p.shift_id !== profile.current_shift_id)
    : photos
  const orderedPhotos = [...currentShiftPhotos, ...otherPhotos]

  // Split tasks: active vs completed
  const activeTasks = tasks.filter((t: any) => t.status === 'new' || t.status === 'in_progress')
  const completedTasks = tasks.filter((t: any) => t.status === 'done' || t.status === 'cancelled')

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-[300px]" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[300px]" />
          <Skeleton className="col-span-2 h-[300px]" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center text-muted-foreground">Пользователь не найден</div>
  }

  const displayName = profile.full_name
    || `${profile.last_name ?? ''} ${profile.first_name ?? ''}`.trim()
    || 'Без имени'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/installers">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={displayName}
          description={formatPhone(profile.phone)}
          actions={
            <Badge variant="outline" className="text-sm">Монтажник</Badge>
          }
        />
      </div>

      {/* Info + Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Информация</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />Телефон
              </span>
              <span>{formatPhone(profile.phone)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />Город
              </span>
              <span>{profile.city || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />Email
              </span>
              <span>{profile.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Бригадир</span>
              <span>{profile.foreman_name || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />Зарегистрирован
              </span>
              <span>{formatDate(profile.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Статус</span>
              <StatusBadge status={profile.is_on_shift ? 'active' : 'cancelled'} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Метрики</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="flex flex-col items-center gap-1 rounded-lg border p-4">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{profile.total_shifts}</span>
                <span className="text-xs text-muted-foreground">Смен</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border p-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{profile.total_hours}</span>
                <span className="text-xs text-muted-foreground">Часов</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border p-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{profile.approved_photos_count}</span>
                <span className="text-xs text-muted-foreground">Одобрено</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border p-4">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold">{profile.rejected_photos_count}</span>
                <span className="text-xs text-muted-foreground">Отклонено</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border p-4">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{profile.active_tasks_count}</span>
                <span className="text-xs text-muted-foreground">Задач</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border p-4">
                <Camera className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{profile.total_photos}</span>
                <span className="text-xs text-muted-foreground">Всего фото</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current shift */}
      {profile.is_on_shift && profile.current_shift_id && (
        <Card>
          <CardHeader><CardTitle className="text-base">Текущая смена</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <StatusBadge status={profile.shift_status} />
              <span className="text-sm">Начало: {formatDate(profile.current_shift_start_at)}</span>
              <span className="text-sm">Фото: {profile.current_shift_photos_count}</span>
              <span className="text-sm">Часов: {profile.current_shift_elapsed_hours}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: photos, tasks, shifts */}
      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Фото ({photos.length})</TabsTrigger>
          <TabsTrigger value="tasks">Задачи ({tasks.length})</TabsTrigger>
          <TabsTrigger value="shifts">Смены ({shifts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="mt-4">
          {photos.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Нет фотографий</p>
          ) : (
            <div className="space-y-6">
              {currentShiftPhotos.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    Фото текущей смены ({currentShiftPhotos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 rounded-lg border-2 border-primary/20 p-3 bg-primary/5">
                    {currentShiftPhotos.map((photo, idx) => (
                      <div key={photo.id} className="group relative overflow-hidden rounded-lg border cursor-pointer"
                        onClick={() => setLightbox({ open: true, index: idx })}
                      >
                        <img src={photo.photo_url} alt="" className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white">{formatDateTime(photo.timestamp)}</span>
                            <StatusBadge status={photo.status} className="text-[10px]" />
                          </div>
                          {photo.comment && (
                            <p className="text-[11px] text-white/80 mt-1 line-clamp-2 flex items-start gap-1">
                              <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                              {photo.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {otherPhotos.length > 0 && (
                <div>
                  {currentShiftPhotos.length > 0 && (
                    <h4 className="text-sm font-semibold mb-3">Остальные фотографии ({otherPhotos.length})</h4>
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {otherPhotos.map((photo, idx) => (
                      <div key={photo.id} className="group relative overflow-hidden rounded-lg border cursor-pointer"
                        onClick={() => setLightbox({ open: true, index: currentShiftPhotos.length + idx })}
                      >
                        <img src={photo.photo_url} alt="" className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white">{formatDateTime(photo.timestamp)}</span>
                            <StatusBadge status={photo.status} className="text-[10px]" />
                          </div>
                          {photo.comment && (
                            <p className="text-[11px] text-white/80 mt-1 line-clamp-2 flex items-start gap-1">
                              <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                              {photo.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Нет задач</p>
          ) : (
            <div className="space-y-6">
              {activeTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    Активные задачи ({activeTasks.length})
                  </h4>
                  <div className="space-y-3">
                    {activeTasks.map((task: any) => (
                      <Card key={task.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <Link to={`/tasks/${task.id}`} className="font-medium hover:underline text-primary">{task.title}</Link>
                            {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{task.priority}</Badge>
                            <StatusBadge status={task.status} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {completedTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Завершённые задачи ({completedTasks.length})</h4>
                  <div className="space-y-3">
                    {completedTasks.map((task: any) => (
                      <Card key={task.id} className="opacity-70">
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <Link to={`/tasks/${task.id}`} className="font-medium hover:underline text-primary">{task.title}</Link>
                            {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{task.priority}</Badge>
                            <StatusBadge status={task.status} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shifts" className="mt-4">
          {shifts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Нет смен</p>
          ) : (
            <div className="space-y-3">
              {shifts.map((shift: any) => (
                <Link key={shift.id} to={`/shifts/${shift.id}`} className="block">
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <StatusBadge status={shift.status} />
                        <span className="text-sm">Начало: {formatDateTime(shift.start_at)}</span>
                        {shift.finish_at && <span className="text-sm">Конец: {formatDateTime(shift.finish_at)}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {shift.duration_hours != null && (
                          <Badge variant="outline">{shift.duration_hours.toFixed(1)}ч</Badge>
                        )}
                        <Button variant="ghost" size="sm">Подробнее</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Photo Lightbox */}
      <Dialog open={lightbox.open} onOpenChange={(open) => !open && setLightbox({ open: false, index: 0 })}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {orderedPhotos[lightbox.index] && (
            <div className="flex flex-col">
              <div className="relative flex items-center justify-center bg-black min-h-[400px] max-h-[70vh]">
                <img
                  src={orderedPhotos[lightbox.index].photo_url}
                  alt=""
                  className="max-h-[70vh] max-w-full object-contain"
                />
                {lightbox.index > 0 && (
                  <button
                    onClick={() => setLightbox((p) => ({ ...p, index: p.index - 1 }))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}
                {lightbox.index < orderedPhotos.length - 1 && (
                  <button
                    onClick={() => setLightbox((p) => ({ ...p, index: p.index + 1 }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}
                <div className="absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                  {lightbox.index + 1} / {orderedPhotos.length}
                </div>
              </div>
              <div className="p-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{orderedPhotos[lightbox.index].category || '—'}</span>
                    <span className="text-sm text-muted-foreground">{formatDateTime(orderedPhotos[lightbox.index].timestamp)}</span>
                    <StatusBadge status={orderedPhotos[lightbox.index].status} />
                  </div>
                  {orderedPhotos[lightbox.index].status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveMutation.mutate(orderedPhotos[lightbox.index].id)}
                      >
                        <Check className="mr-1 h-4 w-4" />Одобрить
                      </Button>
                      <Button size="sm" variant="destructive">
                        <X className="mr-1 h-4 w-4" />Отклонить
                      </Button>
                    </div>
                  )}
                </div>
                {orderedPhotos[lightbox.index].comment && (
                  <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">{orderedPhotos[lightbox.index].comment}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
