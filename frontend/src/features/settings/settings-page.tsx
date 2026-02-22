import { PageHeader } from '@/shared/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { useUI, WALLPAPERS, type NavMode } from '@/app/providers/ui-provider'
import { useTheme } from '@/app/providers/theme-provider'
import { cn } from '@/shared/lib/utils'
import {
  Sun,
  Moon,
  Check,
  ImageIcon,
} from 'lucide-react'

const NAV_MODES: { id: NavMode; label: string; description: string }[] = [
  {
    id: 'sidebar',
    label: 'Боковая панель',
    description: 'Полная — иконки и текст',
  },
  {
    id: 'sidebar-collapsed',
    label: 'Свёрнутая',
    description: 'Компактная — только иконки',
  },
  {
    id: 'topbar',
    label: 'Верхняя',
    description: 'Горизонтальная навигация',
  },
]

export default function SettingsPage() {
  const { navMode, wallpaper, setNavMode, setWallpaper } = useUI()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        title="Оформление"
        description="Настройте внешний вид панели управления под себя"
      />

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Тема</CardTitle>
          <CardDescription>Выберите цветовую схему интерфейса</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:border-primary/50',
                theme === 'light' ? 'border-primary bg-primary/5' : 'border-muted',
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Sun className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium">Светлая</span>
              {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
            </button>

            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:border-primary/50',
                theme === 'dark' ? 'border-primary bg-primary/5' : 'border-muted',
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                <Moon className="h-6 w-6 text-slate-300" />
              </div>
              <span className="text-sm font-medium">Тёмная</span>
              {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Расположение навигации</CardTitle>
          <CardDescription>Выберите, где будет отображаться меню</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {NAV_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setNavMode(mode.id)}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:border-primary/50 text-center',
                  navMode === mode.id ? 'border-primary bg-primary/5' : 'border-muted',
                )}
              >
                {/* Mini layout preview */}
                <div className="relative h-16 w-24 overflow-hidden rounded-lg border bg-muted/50">
                  {mode.id === 'sidebar' && (
                    <>
                      <div className="absolute left-0 top-0 bottom-0 w-6 bg-primary/20 border-r" />
                      <div className="absolute right-1 top-1 left-7 h-2 rounded bg-primary/10" />
                      <div className="absolute right-1 top-4 left-7 h-2 rounded bg-primary/10" />
                      <div className="absolute right-1 top-7 left-7 h-2 rounded bg-primary/10" />
                    </>
                  )}
                  {mode.id === 'sidebar-collapsed' && (
                    <>
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary/20 border-r" />
                      <div className="absolute right-1 top-1 left-4 h-2 rounded bg-primary/10" />
                      <div className="absolute right-1 top-4 left-4 h-2 rounded bg-primary/10" />
                      <div className="absolute right-1 top-7 left-4 h-2 rounded bg-primary/10" />
                    </>
                  )}
                  {mode.id === 'topbar' && (
                    <>
                      <div className="absolute left-0 top-0 right-0 h-3 bg-primary/20 border-b" />
                      <div className="absolute right-1 top-4 left-1 h-2 rounded bg-primary/10" />
                      <div className="absolute right-1 top-7 left-1 h-2 rounded bg-primary/10" />
                    </>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium">{mode.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                </div>
                {navMode === mode.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wallpapers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4" />
            Фоновое изображение
          </CardTitle>
          <CardDescription>
            Выберите фон для рабочей области. Интерфейс станет полупрозрачным в стиле Apple
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {WALLPAPERS.map((wp) => (
              <button
                key={wp.id}
                onClick={() => setWallpaper(wp.id)}
                className={cn(
                  'group relative aspect-[16/10] overflow-hidden rounded-xl border-2 transition-all hover:border-primary/50 hover:scale-[1.02]',
                  wallpaper.id === wp.id ? 'border-primary ring-2 ring-primary/20' : 'border-muted',
                )}
              >
                <div className={cn('absolute inset-0', wp.preview)} />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1">
                  <span className="text-[10px] font-medium text-white">{wp.name}</span>
                </div>
                {wallpaper.id === wp.id && (
                  <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center pb-4">
        Все настройки сохраняются автоматически в вашем браузере
      </p>
    </div>
  )
}
