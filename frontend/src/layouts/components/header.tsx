import { Link } from 'react-router-dom'
import { LogOut, Menu, Moon, Sun, User, Paintbrush } from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { useTheme } from '@/app/providers/theme-provider'
import { Button } from '@/shared/ui/button'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { NotificationCenter } from './notification-center'

interface HeaderProps {
  notificationCount?: number
  glassmorphism?: boolean
  onMobileMenuToggle?: () => void
}

export function Header({ glassmorphism = false, onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || 'U'
    : 'UK'

  return (
    <header
      className={cn(
        'flex h-14 sm:h-16 items-center justify-between border-b px-3 sm:px-6 shrink-0',
        glassmorphism
          ? 'bg-background/70 backdrop-blur-xl'
          : 'bg-background',
      )}
    >
      {/* Left side: hamburger on mobile */}
      <div className="flex items-center gap-2">
        {onMobileMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Right side: actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Link to="/settings" className="hidden sm:block">
          <Button variant="ghost" size="icon" title="Оформление">
            <Paintbrush className="h-4 w-4" />
          </Button>
        </Link>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <NotificationCenter />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm hidden sm:inline">
                {user?.first_name} {user?.last_name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Профиль
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center">
                <Paintbrush className="mr-2 h-4 w-4" />
                Оформление
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
