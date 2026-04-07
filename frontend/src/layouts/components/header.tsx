import { Link } from 'react-router-dom'
import { LogOut, Menu, Moon, Sun, User } from 'lucide-react'
import { useAuth } from '@/app/providers/auth-provider'
import { useTheme } from '@/app/providers/theme-provider'
import { ROLE_LABELS } from '@/shared/lib/rbac'
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
        'flex h-14 items-center justify-between border-b px-3 sm:px-5 shrink-0 transition-colors',
        glassmorphism
          ? 'bg-background/80 backdrop-blur-2xl'
          : 'bg-background',
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-2">
        {onMobileMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-xl"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <NotificationCenter />

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2.5 pl-2 pr-3 rounded-xl h-9">
              <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium leading-tight">
                  {user?.first_name} {user?.last_name}
                </span>
                {user?.role && (
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {ROLE_LABELS[user.role]}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem asChild className="rounded-lg">
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Профиль
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive rounded-lg">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
