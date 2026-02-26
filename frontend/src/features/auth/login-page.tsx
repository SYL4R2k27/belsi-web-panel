import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth-provider'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { UserRole } from '@/shared/types'
import { ROLE_DEFAULT_ROUTE, ROLE_LABELS } from '@/shared/lib/rbac'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!loginValue.trim()) {
      setError('Введите логин')
      return
    }
    if (!password) {
      setError('Введите пароль')
      return
    }

    setIsSubmitting(true)
    try {
      await login(loginValue.trim(), password)
      // Получаем пользователя из контекста после логина — используем localStorage для определения роли
      // Редирект произойдёт автоматически через RequireAuth
      navigate('/', { replace: true })
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Неверный логин или пароль')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Демо-аккаунты для удобства тестирования
  const demoAccounts = [
    { role: UserRole.CURATOR, login: 'curator@belsi.work', label: ROLE_LABELS[UserRole.CURATOR] },
    { role: UserRole.COORDINATOR, login: 'coordinator@belsi.work', label: ROLE_LABELS[UserRole.COORDINATOR] },
    { role: UserRole.FOREMAN, login: 'foreman@belsi.work', label: ROLE_LABELS[UserRole.FOREMAN] },
    { role: UserRole.INSTALLER, login: 'installer@belsi.work', label: ROLE_LABELS[UserRole.INSTALLER] },
  ]

  const handleDemoLogin = (demoLogin: string) => {
    setLoginValue(demoLogin)
    setPassword('demo123')
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[420px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">BELSI. Монтаж</CardTitle>
          <CardDescription>Войдите в систему</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="Телефон, email или имя пользователя"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          {/* Демо-аккаунты */}
          <div className="flex flex-col gap-2">
            <div className="text-xs text-muted-foreground text-center">
              Быстрый вход (демо)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((demo) => (
                <Button
                  key={demo.role}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDemoLogin(demo.login)}
                >
                  {demo.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
