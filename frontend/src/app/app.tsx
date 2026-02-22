import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { Toaster } from 'sonner'
import { AuthProvider } from './providers/auth-provider'
import { QueryProvider } from './providers/query-provider'
import { ThemeProvider } from './providers/theme-provider'
import { UIProvider } from './providers/ui-provider'
import { NotificationProvider } from './providers/notification-provider'
import { router } from './router'

export default function App() {
  return (
    <ThemeProvider>
      <UIProvider>
        <QueryProvider>
          <AuthProvider>
            <NotificationProvider>
              <TooltipProvider>
                <RouterProvider router={router} />
                <Toaster position="top-right" richColors />
              </TooltipProvider>
            </NotificationProvider>
          </AuthProvider>
        </QueryProvider>
      </UIProvider>
    </ThemeProvider>
  )
}
