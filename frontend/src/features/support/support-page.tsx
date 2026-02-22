import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportApi } from '@/shared/api/endpoints/support'
import type { RealTicketOut, RealMessageOut } from '@/shared/types'
import { PageHeader } from '@/shared/components/page-header'
import { StatusBadge } from '@/shared/components/status-badge'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { formatTimeAgo, formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { toast } from 'sonner'
import { Send, ArrowLeft } from 'lucide-react'

export default function SupportPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const { data: tickets = [] } = useQuery({
    queryKey: ['support', 'tickets', { status: statusFilter }],
    queryFn: () =>
      supportApi.tickets({
        limit: 50,
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      } as { limit?: number; offset?: number }).then((r) => r.data),
  })

  const { data: messages } = useQuery({
    queryKey: ['support', 'messages', selectedTicketId],
    queryFn: () => supportApi.messages(selectedTicketId!).then((r) => r.data),
    enabled: !!selectedTicketId,
    refetchInterval: 5000,
  })

  const selectedTicket = tickets.find((t: RealTicketOut) => t.id === selectedTicketId)

  const replyMutation = useMutation({
    mutationFn: () => supportApi.sendMessage(selectedTicketId!, { text: replyText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'messages', selectedTicketId] })
      setReplyText('')
      toast.success('Сообщение отправлено')
    },
  })

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <PageHeader title="Центр поддержки" description="Управление обращениями пользователей" />

      <div className="flex h-[calc(100vh-180px)] sm:h-[calc(100vh-220px)] gap-0 sm:gap-4 overflow-hidden rounded-lg border">
        {/* Tickets list — hidden on mobile when a ticket is selected */}
        <div className={cn(
          'flex flex-col border-r w-full sm:w-[320px] md:w-[380px] shrink-0',
          selectedTicketId ? 'hidden sm:flex' : 'flex',
        )}>
          <div className="flex items-center gap-2 border-b p-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-full sm:w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="open">Открытые</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="resolved">Решённые</SelectItem>
                <SelectItem value="closed">Закрытые</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-1">
            {tickets.map((ticket: RealTicketOut) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={cn(
                  'flex w-full flex-col gap-1 border-b p-3 text-left transition-colors hover:bg-accent',
                  selectedTicketId === ticket.id && 'bg-accent',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium line-clamp-1">{ticket.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.status} className="text-[10px]" />
                  <StatusBadge status={ticket.category} className="text-[10px]" />
                </div>
                <span className="text-xs text-muted-foreground">{formatTimeAgo(ticket.updated_at)}</span>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat area — full width on mobile when selected */}
        <div className={cn(
          'flex flex-1 flex-col',
          selectedTicketId ? 'flex' : 'hidden sm:flex',
        )}>
          {selectedTicket ? (
            <>
              <div className="flex items-center gap-2 border-b p-3 sm:p-4">
                {/* Back button on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden shrink-0"
                  onClick={() => setSelectedTicketId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm sm:text-base truncate">{selectedTicket.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <StatusBadge status={selectedTicket.status} className="text-xs" />
                    <StatusBadge status={selectedTicket.category} className="text-xs" />
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-3 sm:p-4">
                <div className="flex flex-col gap-3">
                  {messages?.map((msg: RealMessageOut) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'max-w-[85%] sm:max-w-[75%] rounded-lg p-3',
                        msg.sender_role !== 'curator'
                          ? 'self-start bg-muted'
                          : 'self-end bg-primary text-primary-foreground',
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span className={cn(
                        'mt-1 block text-xs',
                        msg.sender_role !== 'curator' ? 'text-muted-foreground' : 'text-primary-foreground/70',
                      )}>
                        {msg.sender_role} &middot; {formatDateTime(msg.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2 border-t p-3 sm:p-4">
                <Textarea
                  placeholder="Введите ответ..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={1}
                  className="min-h-[40px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (replyText.trim()) replyMutation.mutate()
                    }
                  }}
                />
                <Button
                  size="icon"
                  disabled={!replyText.trim() || replyMutation.isPending}
                  onClick={() => replyMutation.mutate()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Выберите тикет для просмотра
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
