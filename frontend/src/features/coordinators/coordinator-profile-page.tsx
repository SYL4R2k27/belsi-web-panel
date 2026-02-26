import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/shared/api/endpoints/users'
import { photosApi } from '@/shared/api/endpoints/photos'
import { tasksApi } from '@/shared/api/endpoints/tasks'
import { objectsApi } from '@/shared/api/endpoints/objects'
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
import { SetPasswordButton } from '@/shared/components/set-password-dialog'
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
  Users,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Building2,
  Activity,
  MessageSquare,
} from 'lucide-react'

export default function CoordinatorProfilePage() {
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

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'user', id],
    queryFn: () => tasksApi.list().then((r) => r.data),
    enabled: !!id,
  })

  // Load site object assigned to this coordinator
  const { data: objectsData } = useQuery({
    queryKey: ['site-objects'],
    queryFn: () => objectsApi.list().then((r) => r.data),
    enabled: !!id,
  })

  const siteObject = (objectsData?.objects || []).find((o) => o.coordinator_id === id)

  // Load activity for the site object
  const { data: activityData } = useQuery({
    queryKey: ['site-object-activity', siteObject?.id],
    queryFn: () => objectsApi.activity(siteObject!.id).then((r) => r.data),
    enabled: !!siteObject?.id,
  })

  const activities = activityData?.activities || []

  const approveMutation = useMutation({
    mutationFn: (photoId: string) => photosApi.approve(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      toast.success('Фото одобрено')
    },
  })

  const photos = photosData?.photos ?? []
  const tasks = Array.isArray(tasksData) ? tasksData.filter((t: any) => t.assigned_to === id) : []

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
    return <div className="text-center text-muted-foreground">Координатор не найден</div>
  }

  const displayName = profile.full_name
    || `${profile.last_name ?? ''} ${profile.first_name ?? ''}`.trim()
    || 'Без имени'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/coordinators">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={displayName}
          description={formatPhone(profile.phone)}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">Координатор</Badge>
              <SetPasswordButton userId={id!} userName={displayName} />
            </div>
          }
        />
      </div>

      {/* Site Object Card */}
      {siteObject && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{siteObject.name}</h3>
                  <Badge variant={siteObject.status === 'active' ? 'default' : 'secondary'}>
                    {siteObject.status === 'active' ? 'Активный' : siteObject.status === 'paused' ? 'Приостановлен' : siteObject.status}
                  </Badge>
                </div>
                {siteObject.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {siteObject.address}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${profile.is_on_shift ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-muted-foreground">{profile.is_on_shift ? 'Смена идёт' : 'Смена не идёт'}</span>
                  </div>
                  <span className="text-muted-foreground">Активных смен: {siteObject.active_shifts_count}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Информация</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />Телефон</span>
              <span>{formatPhone(profile.phone)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Город</span>
              <span>{profile.city || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />Email</span>
              <span>{profile.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Зарегистрирован</span>
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

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Команда ({profile.team_members?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="photos">Фото ({photos.length})</TabsTrigger>
          <TabsTrigger value="tasks">Задачи ({tasks.length})</TabsTrigger>
          {siteObject && (
            <TabsTrigger value="activity">Активность ({activities.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="team" className="mt-4">
          {!profile.team_members || profile.team_members.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Нет участников в команде</p>
          ) : (
            <div className="space-y-2">
              {profile.team_members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <Link to={`/installers/${member.id}`} className="font-medium text-primary hover:underline">
                        {member.full_name || formatPhone(member.phone)}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatPhone(member.phone)}</p>
                    </div>
                    <Link to={`/installers/${member.id}`}>
                      <Button variant="ghost" size="sm">Профиль</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          {photos.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Нет фотографий</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {photos.map((photo, idx) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-lg border cursor-pointer"
                  onClick={() => setLightbox({ open: true, index: idx })}>
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

        {siteObject && (
          <TabsContent value="activity" className="mt-4">
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Нет активности по объекту</p>
            ) : (
              <div className="space-y-3">
                {activities.map((act: any) => (
                  <Card key={act.id}>
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{act.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {act.user_name && (
                            <span className="text-xs text-muted-foreground">{act.user_name}</span>
                          )}
                          {act.timestamp && (
                            <span className="text-xs text-muted-foreground">{formatDateTime(act.timestamp)}</span>
                          )}
                          <Badge variant="outline" className="text-[10px]">{act.type}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Photo Lightbox */}
      <Dialog open={lightbox.open} onOpenChange={(open) => !open && setLightbox({ open: false, index: 0 })}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {photos[lightbox.index] && (
            <div className="flex flex-col">
              <div className="relative flex items-center justify-center bg-black min-h-[400px] max-h-[70vh]">
                <img src={photos[lightbox.index].photo_url} alt="" className="max-h-[70vh] max-w-full object-contain" />
                {lightbox.index > 0 && (
                  <button onClick={() => setLightbox((p) => ({ ...p, index: p.index - 1 }))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}
                {lightbox.index < photos.length - 1 && (
                  <button onClick={() => setLightbox((p) => ({ ...p, index: p.index + 1 }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}
                <div className="absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                  {lightbox.index + 1} / {photos.length}
                </div>
              </div>
              <div className="p-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{photos[lightbox.index].category || '—'}</span>
                    <span className="text-sm text-muted-foreground">{formatDateTime(photos[lightbox.index].timestamp)}</span>
                    <StatusBadge status={photos[lightbox.index].status} />
                  </div>
                  {photos[lightbox.index].status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveMutation.mutate(photos[lightbox.index].id)}>
                        <Check className="mr-1 h-4 w-4" />Одобрить
                      </Button>
                      <Button size="sm" variant="destructive">
                        <X className="mr-1 h-4 w-4" />Отклонить
                      </Button>
                    </div>
                  )}
                </div>
                {photos[lightbox.index].comment && (
                  <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">{photos[lightbox.index].comment}</p>
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
