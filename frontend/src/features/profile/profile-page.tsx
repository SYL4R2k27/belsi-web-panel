import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/shared/api/endpoints/profile'
import { useAuth } from '@/app/providers/auth-provider'
import { PageHeader } from '@/shared/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { formatPhone, formatDate } from '@/shared/lib/format'
import { toast } from 'sonner'
import { Save, User, Phone, Mail, MapPin, Calendar, Shield, Lock, Eye, EyeOff } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.me().then((r) => r.data),
  })

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    city: '',
    telegram: '',
    about: '',
  })

  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        city: profile.city || '',
        telegram: profile.telegram || '',
        about: profile.about || '',
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Профиль обновлён')
    },
    onError: () => {
      toast.error('Ошибка при сохранении профиля')
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      profileApi.changePassword(data),
    onSuccess: () => {
      toast.success('Пароль успешно изменён')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail || 'Ошибка при смене пароля'
      toast.error(detail)
    },
  })

  const handleSave = () => {
    updateMutation.mutate(form)
  }

  const handleChangePassword = () => {
    if (pwForm.new_password.length < 6) {
      toast.error('Новый пароль должен быть не менее 6 символов')
      return
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('Пароли не совпадают')
      return
    }
    changePasswordMutation.mutate({
      current_password: pwForm.current_password,
      new_password: pwForm.new_password,
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    curator: 'Куратор',
    coordinator: 'Координатор',
    foreman: 'Бригадир',
    installer: 'Монтажник',
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Мой профиль"
        description="Управление личными данными"
        actions={
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        }
      />

      {/* Read-only info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Учётная запись</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />Телефон
            </span>
            <span className="font-medium">{formatPhone(profile?.phone || user?.phone)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />Роль
            </span>
            <Badge variant="outline">
              {roleLabels[profile?.role || user?.role || ''] || profile?.role || user?.role || '—'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />Зарегистрирован
            </span>
            <span>{formatDate(profile?.created_at || user?.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card>
        <CardHeader><CardTitle className="text-base">Личные данные</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                <User className="mr-1 inline h-3 w-3" />Имя
              </Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                placeholder="Введите имя"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Фамилия</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                placeholder="Введите фамилию"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="mr-1 inline h-3 w-3" />Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">
                <MapPin className="mr-1 inline h-3 w-3" />Город
              </Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Москва"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram</Label>
            <Input
              id="telegram"
              value={form.telegram}
              onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
              placeholder="@username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">О себе</Label>
            <Textarea
              id="about"
              value={form.about}
              onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
              placeholder="Расскажите о себе..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Смена пароля
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Текущий пароль</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showCurrentPw ? 'text' : 'password'}
                value={pwForm.current_password}
                onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
                placeholder="Введите текущий пароль"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new_password">Новый пароль</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNewPw ? 'text' : 'password'}
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
                  placeholder="Минимум 6 символов"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Подтвердите пароль</Label>
              <Input
                id="confirm_password"
                type={showNewPw ? 'text' : 'password'}
                value={pwForm.confirm_password}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))}
                placeholder="Повторите новый пароль"
              />
            </div>
          </div>
          {pwForm.new_password && pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
            <p className="text-sm text-destructive">Пароли не совпадают</p>
          )}
          <Button
            onClick={handleChangePassword}
            disabled={
              changePasswordMutation.isPending ||
              !pwForm.current_password ||
              !pwForm.new_password ||
              !pwForm.confirm_password ||
              pwForm.new_password !== pwForm.confirm_password
            }
          >
            <Lock className="mr-2 h-4 w-4" />
            {changePasswordMutation.isPending ? 'Сохранение...' : 'Изменить пароль'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
