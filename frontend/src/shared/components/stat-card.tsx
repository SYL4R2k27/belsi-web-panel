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
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
      className,
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight font-mono">{value}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 transition-colors group-hover:bg-primary/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend != null && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {trend > 0 ? (
              <div className="flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-success">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">+{trend}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-destructive">
                <TrendingDown className="h-3 w-3" />
                <span className="font-medium">{trend}%</span>
              </div>
            )}
            <span className="text-muted-foreground">за период</span>
          </div>
        )}
      </CardContent>
      {/* Subtle gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </Card>
  )
}
