import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { shiftsApi } from '@/shared/api/endpoints/shifts'
import { PageHeader } from '@/shared/components/page-header'
import { StatusBadge } from '@/shared/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { formatDateTime } from '@/shared/lib/format'
import { ArrowLeft, Camera } from 'lucide-react'

function formatDurationHours(hours: number | null): string {
  if (hours == null) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0 && m === 0) return '0ч'
  if (h === 0) return `${m}мин`
  if (m === 0) return `${h}ч`
  return `${h}ч ${m}мин`
}

export default function ShiftDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: shift, isLoading } = useQuery({
    queryKey: ['shifts', id],
    queryFn: () => shiftsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })

  const { data: photos } = useQuery({
    queryKey: ['shifts', id, 'photos'],
    queryFn: () => shiftsApi.photos(id!).then((r) => r.data),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="flex flex-col gap-6"><Skeleton className="h-8 w-[300px]" /><Skeleton className="h-[400px]" /></div>
  }

  if (!shift) {
    return <div className="text-center text-muted-foreground">Смена не найдена</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/shifts">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={`Смена ${shift.id.slice(0, 8)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Детали смены</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Статус</span>
              <StatusBadge status={shift.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Начало</span>
              <span>{formatDateTime(shift.start_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Конец</span>
              <span>{formatDateTime(shift.finish_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Длительность</span>
              <span>{formatDurationHours(shift.duration_hours)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4" />
              Фотоотчёт {photos ? `(${photos.length} фото)` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-lg border">
                    <img
                      src={photo.photo_url}
                      alt={photo.category || 'Фото'}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/60 px-2 py-1">
                      <span className="text-xs text-white">{photo.category || '—'}</span>
                      <StatusBadge status={photo.status} className="text-[10px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Нет фотографий</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
