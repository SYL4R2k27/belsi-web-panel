import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from './components/sidebar'
import { TopNav } from './components/top-nav'
import { Header } from './components/header'
import { dashboardApi } from '@/shared/api/endpoints/dashboard'
import { messengerApi } from '@/shared/api/endpoints/messenger'
import { useUI } from '@/app/providers/ui-provider'
import { useNotifications } from '@/app/providers/notification-provider'
import { cn } from '@/shared/lib/utils'
import { Sheet, SheetContent } from '@/shared/ui/sheet'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function DashboardLayout() {
  const { navMode, wallpaper, setNavMode } = useUI()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.overview().then((r) => r.data),
    refetchInterval: 30000,
  })

  const { data: threads } = useQuery({
    queryKey: ['messenger-threads'],
    queryFn: () => messengerApi.threads().then((r) => r.data),
    refetchInterval: 15000,
  })

  const unreadMessages = threads?.threads?.reduce((sum, t) => sum + (t.unread_count || 0), 0) || 0

  // Polling-based notification generator
  const { addNotification } = useNotifications()
  const prevStatsRef = useRef<typeof stats>(undefined)

  useEffect(() => {
    const prev = prevStatsRef.current
    if (!stats || !prev) {
      prevStatsRef.current = stats
      return
    }

    // Detect new pending photos
    if (stats.pending_photos > prev.pending_photos) {
      const diff = stats.pending_photos - prev.pending_photos
      addNotification({
        type: 'photo',
        title: `${diff} новых фото на модерацию`,
        description: `Всего ожидает: ${stats.pending_photos}`,
        link: '/photos',
      })
      toast.info(`${diff} новых фото на модерацию`)
    }

    // Detect new support tickets
    if (stats.open_support_tickets > prev.open_support_tickets) {
      const diff = stats.open_support_tickets - prev.open_support_tickets
      addNotification({
        type: 'support',
        title: `${diff} новых обращений`,
        description: `Всего открыто: ${stats.open_support_tickets}`,
        link: '/support',
      })
      toast.info(`${diff} новых обращений в поддержку`)
    }

    prevStatsRef.current = stats
  }, [stats, addNotification])

  const hasWallpaper = wallpaper.id !== 'none'
  const isCollapsed = navMode === 'sidebar-collapsed'
  const isTopbar = navMode === 'topbar'

  const bgStyle: React.CSSProperties = {}
  if (hasWallpaper) {
    if (wallpaper.type === 'gradient') {
      bgStyle.backgroundImage = wallpaper.value
    } else {
      bgStyle.backgroundImage = `url(${wallpaper.value})`
      bgStyle.backgroundSize = 'cover'
      bgStyle.backgroundPosition = 'center'
    }
  }

  function handleToggleCollapse() {
    setNavMode(isCollapsed ? 'sidebar' : 'sidebar-collapsed')
  }

  const sidebarProps = {
    pendingPhotos: stats?.pending_photos,
    openTickets: stats?.open_support_tickets,
    unreadMessages: unreadMessages > 0 ? unreadMessages : undefined,
    glassmorphism: hasWallpaper,
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background layer */}
      {hasWallpaper && (
        <div
          className="absolute inset-0 z-0"
          style={bgStyle}
        >
          {wallpaper.type === 'image' && (
            <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
          )}
        </div>
      )}

      {/* Content layer */}
      <div className={cn('relative z-10 flex h-full', isTopbar && 'flex-col')}>
        {/* Desktop Sidebar or TopNav */}
        {isTopbar ? (
          <TopNav
            pendingPhotos={stats?.pending_photos}
            openTickets={stats?.open_support_tickets}
            unreadMessages={unreadMessages > 0 ? unreadMessages : undefined}
          />
        ) : (
          <div className="hidden md:block">
            <Sidebar
              collapsed={isCollapsed}
              onToggleCollapse={handleToggleCollapse}
              {...sidebarProps}
            />
          </div>
        )}

        {/* Mobile sidebar drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <Sidebar {...sidebarProps} />
          </SheetContent>
        </Sheet>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            notificationCount={(stats?.open_support_tickets || 0) + unreadMessages}
            glassmorphism={hasWallpaper}
            onMobileMenuToggle={() => setMobileOpen(true)}
          />
          <main
            className={cn(
              'flex-1 overflow-auto p-3 sm:p-4 md:p-6',
              hasWallpaper && 'bg-background/80 backdrop-blur-xl',
            )}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
