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
import { Save, User, Phone, Mail, MapPin, Calendar, Shield } from 'lucide-react'

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

  const handleSave = () => {
    updateMutation.mutate(form)
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
    </div>
  )
}
