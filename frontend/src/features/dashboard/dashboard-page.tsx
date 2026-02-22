import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Camera,
  Clock,
  HardHat,
  MapPin,
  MessageSquare,
  Users,
  Wrench,
  Settings2,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react'
import { dashboardApi } from '@/shared/api/endpoints/dashboard'
import { PageHeader } from '@/shared/components/page-header'
import { StatCard } from '@/shared/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'

interface WidgetConfig {
  id: string
  label: string
  visible: boolean
  order: number
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'installers', label: 'Монтажники', visible: true, order: 0 },
  { id: 'foremen', label: 'Бригадиры', visible: true, order: 1 },
  { id: 'coordinators', label: 'Координаторы', visible: true, order: 2 },
  { id: 'shifts', label: 'Смены сегодня', visible: true, order: 3 },
  { id: 'photos', label: 'Фото на модерации', visible: true, order: 4 },
  { id: 'tools', label: 'Инструменты', visible: true, order: 5 },
  { id: 'tickets', label: 'Тикеты поддержки', visible: true, order: 6 },
  { id: 'completion', label: 'Процент выполнения', visible: true, order: 7 },
]

const STORAGE_KEY = 'belsi_dashboard_widgets'

function loadWidgets(): WidgetConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as WidgetConfig[]
      const map = new Map(parsed.map((w) => [w.id, w]))
      return DEFAULT_WIDGETS.map((dw) => map.get(dw.id) || dw).sort((a, b) => a.order - b.order)
    }
  } catch { /* ignore */ }
  return DEFAULT_WIDGETS
}

function saveWidgets(widgets: WidgetConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
}

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(loadWidgets)
  const [editMode, setEditMode] = useState(false)
  const [editWidgets, setEditWidgets] = useState<WidgetConfig[]>([])
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.overview().then((r) => r.data),
    refetchInterval: 30000,
  })

  function openEdit() {
    setEditWidgets([...widgets])
    setEditMode(true)
  }

  function saveEdit() {
    const reordered = editWidgets.map((w, i) => ({ ...w, order: i }))
    setWidgets(reordered)
    saveWidgets(reordered)
    setEditMode(false)
  }

  function resetToDefaults() {
    setEditWidgets([...DEFAULT_WIDGETS])
  }

  function toggleWidget(id: string) {
    setEditWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)),
    )
  }

  function moveWidget(from: number, to: number) {
    setEditWidgets((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const visibleWidgets = widgets.filter((w) => w.visible)

  function renderWidget(widget: WidgetConfig) {
    if (!overview) return null

    switch (widget.id) {
      case 'installers':
        return (
          <Link to="/installers" key={widget.id}>
            <StatCard
              label="Монтажники"
              value={`${overview.active_installers_today} / ${overview.total_installers}`}
              icon={Users}
            />
          </Link>
        )
      case 'foremen':
        return (
          <Link to="/foremen" key={widget.id}>
            <StatCard
              label="Бригадиры"
              value={`${overview.active_foremen_today} / ${overview.total_foremen}`}
              icon={HardHat}
            />
          </Link>
        )
      case 'coordinators':
        return (
          <Link to="/coordinators" key={widget.id}>
            <StatCard
              label="Координаторы"
              value={`${overview.active_coordinators_today ?? 0} / ${overview.total_coordinators ?? 0}`}
              icon={MapPin}
            />
          </Link>
        )
      case 'shifts':
        return (
          <Link to="/shifts" key={widget.id}>
            <StatCard label="Смены сегодня" value={overview.total_shifts_today} icon={Clock} />
          </Link>
        )
      case 'photos':
        return (
          <Link to="/photos" key={widget.id}>
            <StatCard label="Фото на модерации" value={overview.pending_photos} icon={Camera} />
          </Link>
        )
      case 'tools':
        return (
          <Link to="/tools" key={widget.id}>
            <StatCard
              label="Инструменты"
              value={`${overview.tools_issued} / ${overview.total_tools}`}
              icon={Wrench}
            />
          </Link>
        )
      case 'tickets':
        return (
          <Link to="/support" key={widget.id}>
            <StatCard label="Тикеты поддержки" value={overview.open_support_tickets} icon={MessageSquare} />
          </Link>
        )
      case 'completion':
        return (
          <Card key={widget.id} className="col-span-full">
            <CardHeader>
              <CardTitle className="text-base">Средний процент выполнения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(overview.average_completion_percentage, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {overview.average_completion_percentage}%
                </span>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Обзор операционной деятельности"
        actions={
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Settings2 className="mr-2 h-4 w-4" />
            Настроить
          </Button>
        }
      />

      {overviewLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleWidgets.map((w) => renderWidget(w))}
        </div>
      ) : null}

      {/* Edit widgets dialog */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Настройка дашборда</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Перетаскивайте элементы для изменения порядка. Нажмите на иконку глаза, чтобы скрыть/показать виджет.
          </p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {editWidgets.map((widget, idx) => (
              <div
                key={widget.id}
                className="flex items-center gap-3 rounded-lg border p-3 bg-background"
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx !== null && dragIdx !== idx) {
                    moveWidget(dragIdx, idx)
                  }
                  setDragIdx(null)
                }}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="flex-1">
                  <Label className="cursor-pointer">{widget.label}</Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleWidget(widget.id)}
                >
                  {widget.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={resetToDefaults} className="mr-auto">
              <RotateCcw className="mr-1 h-4 w-4" />
              Сбросить
            </Button>
            <Button variant="outline" onClick={() => setEditMode(false)}>Отмена</Button>
            <Button onClick={saveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
