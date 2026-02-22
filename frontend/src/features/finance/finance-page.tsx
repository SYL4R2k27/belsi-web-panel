import { PageHeader } from '@/shared/components/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Wallet, Construction } from 'lucide-react'

export default function FinancePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Финансы" description="Управление выплатами и платежами" />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Раздел в разработке</h3>
          <p className="text-muted-foreground max-w-md">
            Модуль финансов и выплат будет подключён после интеграции с платёжной системой.
            Следите за обновлениями.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
