import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { dashboardApi } from '@/shared/api/endpoints/dashboard'
import { usersApi } from '@/shared/api/endpoints/users'
import { PageHeader } from '@/shared/components/page-header'
import { StatCard } from '@/shared/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import type { RealDashboardStats, RealCuratorForemanOut } from '@/shared/types'
import {
  Users,
  HardHat,
  Camera,
  Clock,
  Wrench,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return <Skeleton className="w-full" style={{ height }} />
}

export default function ReportsPage() {
  // --------------- queries ---------------
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery<RealDashboardStats>({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => dashboardApi.overview().then((r) => r.data),
  })

  const {
    data: foremen,
    isLoading: foremenLoading,
  } = useQuery<RealCuratorForemanOut[]>({
    queryKey: ['reports', 'foremen'],
    queryFn: () => usersApi.foremen({ limit: 200 }).then((r) => r.data),
  })

  const isLoading = statsLoading || foremenLoading

  // --------------- computed chart data ---------------

  const roleDistribution = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Монтажники', value: stats.total_installers },
      { name: 'Бригадиры', value: stats.total_foremen },
      { name: 'Координаторы', value: stats.total_coordinators },
    ]
  }, [stats])

  const activeVsTotal = useMemo(() => {
    if (!stats) return []
    return [
      {
        role: 'Монтажники',
        total: stats.total_installers,
        active: stats.active_installers_today,
      },
      {
        role: 'Бригадиры',
        total: stats.total_foremen,
        active: stats.active_foremen_today,
      },
      {
        role: 'Координаторы',
        total: stats.total_coordinators,
        active: stats.active_coordinators_today,
      },
    ]
  }, [stats])

  const topForemenByCompletion = useMemo(() => {
    if (!foremen) return []
    return [...foremen]
      .sort((a, b) => b.completion_percentage - a.completion_percentage)
      .slice(0, 10)
      .map((f) => ({
        name: f.full_name ?? f.phone,
        completion: Number(f.completion_percentage.toFixed(1)),
      }))
  }, [foremen])

  const foremenByTeamSize = useMemo(() => {
    if (!foremen) return []
    return [...foremen]
      .sort((a, b) => b.team_size - a.team_size)
      .slice(0, 10)
      .map((f) => ({
        name: f.full_name ?? f.phone,
        team_size: f.team_size,
      }))
  }, [foremen])

  const foremenByActiveInstallers = useMemo(() => {
    if (!foremen) return []
    return [...foremen]
      .sort((a, b) => b.active_installers_count - a.active_installers_count)
      .slice(0, 10)
      .map((f) => ({
        name: f.full_name ?? f.phone,
        active: f.active_installers_count,
      }))
  }, [foremen])

  const completionRadial = useMemo(() => {
    if (!stats) return []
    return [
      {
        name: 'Выполнение',
        value: Number(stats.average_completion_percentage.toFixed(1)),
        fill: COLORS[2],
      },
    ]
  }, [stats])

  const toolsDonut = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Выдано', value: stats.tools_issued },
      { name: 'Свободно', value: Math.max(0, stats.total_tools - stats.tools_issued) },
    ]
  }, [stats])

  const foremenByPendingPhotos = useMemo(() => {
    if (!foremen) return []
    return [...foremen]
      .filter((f) => f.pending_photos_count > 0)
      .sort((a, b) => b.pending_photos_count - a.pending_photos_count)
      .slice(0, 10)
      .map((f) => ({
        name: f.full_name ?? f.phone,
        pending: f.pending_photos_count,
      }))
  }, [foremen])

  // --------------- render helpers ---------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomTooltip = (props: any) => {
    const { active, payload, label } = props
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        {label && <p className="mb-1 text-sm font-medium">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }

  // --------------- JSX ---------------

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Отчёты и аналитика"
        description="Статистика и метрики операционной деятельности"
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="personnel">Персонал</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
          <TabsTrigger value="tools">Инструменты и фото</TabsTrigger>
        </TabsList>

        {/* ==================== Tab 1: Обзор ==================== */}
        <TabsContent value="overview" className="mt-4">
          {statsLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[120px]" />
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label="Монтажники"
                  value={stats.total_installers}
                  icon={Users}
                />
                <StatCard
                  label="Бригадиры"
                  value={stats.total_foremen}
                  icon={HardHat}
                />
                <StatCard
                  label="Координаторы"
                  value={stats.total_coordinators}
                  icon={ShieldCheck}
                />
                <StatCard
                  label="Смены сегодня"
                  value={stats.total_shifts_today}
                  icon={Clock}
                />
                <StatCard
                  label="Фото на модерации"
                  value={stats.pending_photos}
                  icon={Camera}
                />
                <StatCard
                  label="Тикеты поддержки"
                  value={stats.open_support_tickets}
                  icon={MessageSquare}
                />
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">
                    Средний процент выполнения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${stats.average_completion_percentage}%`,
                        }}
                      />
                    </div>
                    <span className="text-lg font-semibold">
                      {stats.average_completion_percentage.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* ==================== Tab 2: Персонал ==================== */}
        <TabsContent value="personnel" className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton height={400} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Role distribution pie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Распределение по ролям
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={(props: any) =>
                          `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {roleDistribution.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={renderCustomTooltip} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Active vs total bar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Активные vs всего по ролям
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activeVsTotal}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="role" />
                      <YAxis allowDecimals={false} />
                      <Tooltip content={renderCustomTooltip} />
                      <Legend />
                      <Bar
                        dataKey="total"
                        name="Всего"
                        fill={COLORS[0]}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="active"
                        name="Активны сегодня"
                        fill={COLORS[2]}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top foremen by completion — horizontal bar (spans full width) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    Топ бригадиров по проценту выполнения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topForemenByCompletion.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      Нет данных по бригадирам
                    </p>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(250, topForemenByCompletion.length * 40)}
                    >
                      <BarChart
                        data={topForemenByCompletion}
                        layout="vertical"
                        margin={{ left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} unit="%" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={renderCustomTooltip} />
                        <Bar
                          dataKey="completion"
                          name="Выполнение, %"
                          fill={COLORS[2]}
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ==================== Tab 3: Активность ==================== */}
        <TabsContent value="activity" className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Foremen by team size */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Бригадиры по размеру команды
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {foremenByTeamSize.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      Нет данных
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={foremenByTeamSize}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          angle={-30}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip content={renderCustomTooltip} />
                        <Bar
                          dataKey="team_size"
                          name="Размер команды"
                          fill={COLORS[0]}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Foremen by active installers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Бригадиры по активным монтажникам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {foremenByActiveInstallers.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      Нет данных
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={foremenByActiveInstallers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          angle={-30}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip content={renderCustomTooltip} />
                        <Bar
                          dataKey="active"
                          name="Активных монтажников"
                          fill={COLORS[1]}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Radial bar — average completion */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    Средний процент выполнения
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  {stats ? (
                    <div className="flex flex-col items-center gap-2">
                      <ResponsiveContainer width={250} height={250}>
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="70%"
                          outerRadius="100%"
                          startAngle={180}
                          endAngle={0}
                          data={completionRadial}
                        >
                          <RadialBar
                            dataKey="value"
                            cornerRadius={8}
                            background={{ fill: 'hsl(var(--muted))' }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <span className="-mt-16 text-3xl font-bold">
                        {stats.average_completion_percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        среднее выполнение задач
                      </span>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Нет данных
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ==================== Tab 4: Инструменты и фото ==================== */}
        <TabsContent value="tools" className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-[120px]" />
                <Skeleton className="h-[120px]" />
              </div>
              <ChartSkeleton height={400} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Donut: tools issued vs available */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Инструменты: выдано / свободно
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats && stats.total_tools > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={toolsDonut}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill={COLORS[3]} />
                          <Cell fill={COLORS[2]} />
                        </Pie>
                        <Tooltip content={renderCustomTooltip} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Нет данных по инструментам
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Stat cards: pending photos + open tickets */}
              <div className="flex flex-col gap-4">
                <StatCard
                  label="Фото на модерации"
                  value={stats?.pending_photos ?? 0}
                  icon={Camera}
                />
                <StatCard
                  label="Открытые тикеты"
                  value={stats?.open_support_tickets ?? 0}
                  icon={MessageSquare}
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Всего инструментов
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <Wrench className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats?.total_tools ?? 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stats?.tools_issued ?? 0} выдано
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Foremen by pending photos */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    Бригадиры по количеству фото на модерации
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {foremenByPendingPhotos.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      Нет фото на модерации у бригадиров
                    </p>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(
                        250,
                        foremenByPendingPhotos.length * 40,
                      )}
                    >
                      <BarChart
                        data={foremenByPendingPhotos}
                        layout="vertical"
                        margin={{ left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={renderCustomTooltip} />
                        <Bar
                          dataKey="pending"
                          name="Фото на модерации"
                          fill={COLORS[4]}
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
