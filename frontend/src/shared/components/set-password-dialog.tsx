import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { profileApi } from '@/shared/api/endpoints/profile'
import { useAuth } from '@/app/providers/auth-provider'
import { UserRole } from '@/shared/types'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface SetPasswordDialogProps {
  userId: string
  userName: string
}

export function SetPasswordButton({ userId, userName }: SetPasswordDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Только куратор может задавать пароли
  if (user?.role !== UserRole.CURATOR) return null

  const mutation = useMutation({
    mutationFn: () => profileApi.setPassword({ user_id: userId, new_password: password }),
    onSuccess: () => {
      toast.success(`Пароль для ${userName} установлен`)
      setOpen(false)
      setPassword('')
      setConfirmPassword('')
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail || 'Ошибка при установке пароля'
      toast.error(detail)
    },
  })

  const handleSubmit = () => {
    if (password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }
    mutation.mutate()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Lock className="mr-2 h-4 w-4" />
        Задать пароль
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Задать пароль — {userName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="set-password">Новый пароль</Label>
              <div className="relative">
                <Input
                  id="set-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-password-confirm">Подтвердите пароль</Label>
              <Input
                id="set-password-confirm"
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Пароли не совпадают</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending || !password || !confirmPassword || password !== confirmPassword}
            >
              {mutation.isPending ? 'Сохранение...' : 'Установить пароль'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
