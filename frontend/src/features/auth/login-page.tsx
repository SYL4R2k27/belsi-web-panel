import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth-provider'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Card, CardContent } from '@/shared/ui/card'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={`${import.meta.env.BASE_URL}logo-512.png`} alt="BELSI" className="h-16 w-16 rounded-2xl shadow-lg shadow-primary/20 mb-4 mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">
            BELSI<span className="text-primary">.Монтаж</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Панель управления монтажом</p>
        </div>

        <Card className="border-0 shadow-xl shadow-black/5 rounded-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-xl bg-destructive/8 border border-destructive/20 p-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="login" className="text-sm font-medium">Логин</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Телефон, email или имя"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-medium mt-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          BELSI.Монтаж — Система управления
        </p>
      </div>
    </div>
  )
}
