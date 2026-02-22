import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: ru })
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd.MM.yyyy HH:mm', { locale: ru })
}

export function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ru })
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}мин`
  if (m === 0) return `${h}ч`
  return `${h}ч ${m}мин`
}

export function formatMoney(amount: string | number | null | undefined): string {
  if (amount == null) return '—'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`
  }
  return phone
}
