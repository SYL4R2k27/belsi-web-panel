import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type NavMode = 'sidebar' | 'sidebar-collapsed' | 'topbar'

export interface WallpaperOption {
  id: string
  name: string
  type: 'gradient' | 'image'
  value: string
  preview: string // CSS for small preview thumbnail
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: 'none',
    name: 'Без фона',
    type: 'gradient',
    value: '',
    preview: 'bg-background border-2 border-dashed',
  },
  {
    id: 'aurora',
    name: 'Северное сияние',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0c0d13 0%, #1a1c3a 25%, #2d1b4e 50%, #1b3a4b 75%, #0c2233 100%)',
    preview: 'bg-gradient-to-br from-[#0c0d13] via-[#2d1b4e] to-[#0c2233]',
  },
  {
    id: 'ocean',
    name: 'Океан',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0a1628 0%, #0d2847 25%, #134e6f 50%, #1a6b8a 75%, #0d3b5c 100%)',
    preview: 'bg-gradient-to-br from-[#0a1628] via-[#134e6f] to-[#0d3b5c]',
  },
  {
    id: 'sunset',
    name: 'Закат',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1a0a2e 0%, #3d1f56 20%, #6b2f5b 40%, #b44444 60%, #d4763e 80%, #e8a23a 100%)',
    preview: 'bg-gradient-to-br from-[#1a0a2e] via-[#b44444] to-[#e8a23a]',
  },
  {
    id: 'forest',
    name: 'Лес',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 25%, #2d5a2d 50%, #1a4a2a 75%, #0d2d1a 100%)',
    preview: 'bg-gradient-to-br from-[#0a1a0a] via-[#2d5a2d] to-[#0d2d1a]',
  },
  {
    id: 'lavender',
    name: 'Лаванда',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1a0f2e 0%, #2a1b4e 25%, #4a2d7a 50%, #6b3fa0 75%, #3d2466 100%)',
    preview: 'bg-gradient-to-br from-[#1a0f2e] via-[#4a2d7a] to-[#3d2466]',
  },
  {
    id: 'midnight',
    name: 'Полночь',
    type: 'gradient',
    value: 'linear-gradient(135deg, #020111 0%, #0a0a2e 25%, #191970 50%, #0a0a2e 75%, #020111 100%)',
    preview: 'bg-gradient-to-br from-[#020111] via-[#191970] to-[#020111]',
  },
  {
    id: 'rose',
    name: 'Роза',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1a0a1a 0%, #3d1a2e 25%, #6b2d4a 50%, #8b3a5a 75%, #4a1d3a 100%)',
    preview: 'bg-gradient-to-br from-[#1a0a1a] via-[#6b2d4a] to-[#4a1d3a]',
  },
  {
    id: 'mountain',
    name: 'Горы',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    preview: 'bg-[url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=30)] bg-cover',
  },
  {
    id: 'space',
    name: 'Космос',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    preview: 'bg-[url(https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=100&q=30)] bg-cover',
  },
  {
    id: 'city',
    name: 'Город',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80',
    preview: 'bg-[url(https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=100&q=30)] bg-cover',
  },
  {
    id: 'abstract',
    name: 'Абстракция',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    preview: 'bg-[url(https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=100&q=30)] bg-cover',
  },
]

interface UIConfig {
  navMode: NavMode
  wallpaperId: string
}

interface UIContextValue {
  navMode: NavMode
  wallpaper: WallpaperOption
  setNavMode: (mode: NavMode) => void
  setWallpaper: (id: string) => void
}

const STORAGE_KEY = 'belsi_ui_config'

function loadConfig(): UIConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { navMode: 'sidebar', wallpaperId: 'none' }
}

function saveConfig(config: UIConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<UIConfig>(loadConfig)

  const wallpaper = WALLPAPERS.find((w) => w.id === config.wallpaperId) || WALLPAPERS[0]

  const setNavMode = useCallback((mode: NavMode) => {
    setConfig((prev) => {
      const next = { ...prev, navMode: mode }
      saveConfig(next)
      return next
    })
  }, [])

  const setWallpaper = useCallback((id: string) => {
    setConfig((prev) => {
      const next = { ...prev, wallpaperId: id }
      saveConfig(next)
      return next
    })
  }, [])

  return (
    <UIContext.Provider value={{ navMode: config.navMode, wallpaper, setNavMode, setWallpaper }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within UIProvider')
  }
  return context
}
