import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { photosApi } from '@/shared/api/endpoints/photos'
import type { RealCuratorPhotoOut } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { DataTable } from '@/shared/components/data-table'
import { StatusBadge } from '@/shared/components/status-badge'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { formatDateTime } from '@/shared/lib/format'
import { toast } from 'sonner'
import {
  Check,
  X,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ZoomIn,
  User,
  MessageSquare,
  ImageIcon,
} from 'lucide-react'

export default function PhotosPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<string>('pending')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; photoId: string | null }>({ open: false, photoId: null })
  const [rejectReason, setRejectReason] = useState('')
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 })

  const { data, isLoading } = useQuery({
    queryKey: ['photos', { status }],
    queryFn: () =>
      photosApi.list({
        status: status !== 'all' ? status : undefined,
        limit: 200,
      }).then((r) => r.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => photosApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      toast.success('Фото одобрено')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => photosApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      toast.success('Фото отклонено')
      setRejectDialog({ open: false, photoId: null })
      setRejectReason('')
    },
  })

  const photos = data?.photos ?? []
  const currentPhoto = lightbox.open ? photos[lightbox.index] : null

  function openLightbox(index: number) {
    setLightbox({ open: true, index })
  }

  function navigateLightbox(direction: -1 | 1) {
    setLightbox((prev) => ({
      ...prev,
      index: Math.max(0, Math.min(photos.length - 1, prev.index + direction)),
    }))
  }

  const columns: ColumnDef<RealCuratorPhotoOut>[] = [
    {
      accessorKey: 'thumbnail',
      header: 'Фото',
      cell: ({ row }) => {
        const idx = photos.findIndex((p) => p.id === row.original.id)
        return (
          <button onClick={() => openLightbox(idx)} className="group relative">
            <img
              src={row.original.photo_url}
              alt=""
              className="h-12 w-16 rounded-lg object-cover transition-all group-hover:opacity-80 group-hover:shadow-md"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-4 w-4 text-white drop-shadow" />
            </div>
          </button>
        )
      },
    },
    {
      accessorKey: 'user_name',
      header: 'Монтажник',
      cell: ({ row }) => (
        <Link
          to={`/installers/${row.original.user_id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.user_name || row.original.user_phone}
        </Link>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Категория',
      cell: ({ row }) => row.original.category || '—',
    },
    {
      accessorKey: 'timestamp',
      header: 'Загружено',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm font-mono">
          {formatDateTime(row.original.timestamp)}
        </span>
      ),
    },
    {
      accessorKey: 'comment',
      header: 'Комментарий',
      cell: ({ row }) => {
        const comment = row.original.comment
        if (!comment) return <span className="text-muted-foreground">—</span>
        return (
          <span className="text-sm line-clamp-2 max-w-[200px]" title={comment}>
            {comment}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }) => {
        if (row.original.status !== 'pending') return null
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
              onClick={() => approveMutation.mutate(row.original.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600"
              onClick={() => setRejectDialog({ open: true, photoId: row.original.id })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const statusFilter = (
    <Select value={status} onValueChange={(v) => setStatus(v)}>
      <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
        <SelectValue placeholder="Статус" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="all">Все</SelectItem>
        <SelectItem value="pending">Ожидают</SelectItem>
        <SelectItem value="approved">Одобрены</SelectItem>
        <SelectItem value="rejected">Отклонены</SelectItem>
      </SelectContent>
    </Select>
  )

  const photosCount = photos.length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Модерация фото"
        description={`Проверка и одобрение фотоотчётов монтажников${photosCount > 0 ? ` · ${photosCount} фото` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border p-1">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        }
      />

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={photos}
          isLoading={isLoading}
          toolbar={<div className="flex items-center gap-4">{statusFilter}</div>}
        />
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-4">{statusFilter}</div>

          {isLoading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {photos.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">Нет фотографий</p>
              <p className="text-sm text-muted-foreground mt-1">Фотографии появятся здесь после загрузки монтажниками</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {photos.map((photo, idx) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:shadow-black/5">
                <button
                  onClick={() => openLightbox(idx)}
                  className="w-full cursor-pointer"
                >
                  <img
                    src={photo.photo_url}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </button>

                {/* Info overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/installers/${photo.user_id}`}
                      className="text-xs font-medium text-white hover:underline truncate max-w-[60%]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {photo.user_name || photo.user_phone}
                    </Link>
                    <StatusBadge status={photo.status} className="text-[9px] py-0 h-5" />
                  </div>
                  {photo.comment && (
                    <p className="text-[11px] text-white/70 mt-1 line-clamp-1 flex items-start gap-1">
                      <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />
                      {photo.comment}
                    </p>
                  )}
                  {photo.status === 'pending' && (
                    <div className="mt-2 flex gap-1.5">
                      <Button
                        size="sm"
                        className="h-7 flex-1 rounded-lg bg-emerald-600 text-xs font-medium hover:bg-emerald-500 shadow-sm"
                        onClick={(e) => { e.stopPropagation(); approveMutation.mutate(photo.id) }}
                      >
                        <Check className="mr-1 h-3 w-3" />OK
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 flex-1 rounded-lg text-xs font-medium shadow-sm"
                        onClick={(e) => { e.stopPropagation(); setRejectDialog({ open: true, photoId: photo.id }) }}
                      >
                        <X className="mr-1 h-3 w-3" />Нет
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightbox.open} onOpenChange={(open) => !open && setLightbox({ open: false, index: 0 })}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl border-0">
          {currentPhoto && (
            <div className="flex flex-col">
              {/* Image area */}
              <div className="relative flex items-center justify-center bg-black min-h-[400px] max-h-[70vh]">
                <img
                  src={currentPhoto.photo_url}
                  alt=""
                  className="max-h-[70vh] max-w-full object-contain"
                />
                {/* Navigation arrows */}
                {lightbox.index > 0 && (
                  <button
                    onClick={() => navigateLightbox(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-sm p-2 text-white hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {lightbox.index < photos.length - 1 && (
                  <button
                    onClick={() => navigateLightbox(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-sm p-2 text-white hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
                {/* Counter */}
                <div className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-xs text-white font-mono">
                  {lightbox.index + 1} / {photos.length}
                </div>
              </div>

              {/* Info bar */}
              <div className="p-4 border-t space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Link
                      to={`/installers/${currentPhoto.user_id}`}
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      onClick={() => setLightbox({ open: false, index: 0 })}
                    >
                      <User className="h-4 w-4" />
                      {currentPhoto.user_name || currentPhoto.user_phone}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {currentPhoto.category || '—'}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {formatDateTime(currentPhoto.timestamp)}
                    </span>
                    <StatusBadge status={currentPhoto.status} />
                  </div>
                  {currentPhoto.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 rounded-xl"
                      onClick={() => {
                        approveMutation.mutate(currentPhoto.id)
                        if (lightbox.index < photos.length - 1) {
                          navigateLightbox(1)
                        }
                      }}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => setRejectDialog({ open: true, photoId: currentPhoto.id })}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Отклонить
                    </Button>
                  </div>
                )}
                </div>
                {currentPhoto.comment && (
                  <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">{currentPhoto.comment}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, photoId: open ? rejectDialog.photoId : null })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Отклонить фото</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Укажите причину отклонения (обязательно)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, photoId: null })} className="rounded-xl">
              Отмена
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (rejectDialog.photoId) {
                  rejectMutation.mutate({ id: rejectDialog.photoId, reason: rejectReason })
                }
              }}
            >
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
