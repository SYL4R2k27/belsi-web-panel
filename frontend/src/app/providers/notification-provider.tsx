import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export interface Notification {
  id: string
  type: 'photo' | 'support' | 'message' | 'shift' | 'task' | 'system'
  title: string
  description: string
  timestamp: Date
  read: boolean
  link?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  addNotification: () => {},
})

const STORAGE_KEY = 'belsi_notifications'
const MAX_NOTIFICATIONS = 50

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed.map((n: Notification) => ({ ...n, timestamp: new Date(n.timestamp) }))
  } catch {
    return []
  }
}

function saveNotifications(items: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)))
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications)

  useEffect(() => {
    saveNotifications(notifications)
  }, [notifications])

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...n,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        read: false,
      }
      setNotifications((prev) => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS))
    },
    [],
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
