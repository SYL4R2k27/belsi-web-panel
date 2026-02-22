import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: number
  className?: string
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend != null && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-muted-foreground">за период</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
