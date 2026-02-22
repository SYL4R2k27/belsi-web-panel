import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { financeApi } from '@/shared/api/endpoints/finance'
import { PageHeader } from '@/shared/components/page-header'
import { StatusBadge } from '@/shared/components/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { ArrowLeft } from 'lucide-react'

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: payout, isLoading } = useQuery({
    queryKey: ['finance', 'payouts', id],
    queryFn: () => financeApi.payout(id!).then((r) => r.data.data),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="flex flex-col gap-6"><Skeleton className="h-8 w-[300px]" /><Skeleton className="h-[400px]" /></div>
  }

  if (!payout) {
    return <div className="text-center text-muted-foreground">Платёж не найден</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/finance"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader
          title={`Выплата ${formatMoney(payout.amount)}`}
          description={`${payout.user?.last_name} ${payout.user?.first_name}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Информация</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Статус</span><StatusBadge status={payout.status} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Сумма</span><span className="font-bold">{formatMoney(payout.amount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Создана</span><span>{formatDate(payout.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Одобрена</span><span>{formatDate(payout.approved_at)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Оплачена</span><span>{formatDate(payout.paid_at)}</span></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Детализация</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тип</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payout.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="capitalize">{item.source_type}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
