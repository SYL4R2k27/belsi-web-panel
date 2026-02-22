import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  messengerApi,
  type ThreadOut,
  type MessageOut,
  type ContactOut,
} from '@/shared/api/endpoints/messenger'
import { PageHeader } from '@/shared/components/page-header'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/utils'
import { formatTimeAgo, formatDateTime } from '@/shared/lib/format'
import { toast } from 'sonner'
import { Send, Plus, Search, MessageCircle, Users, ArrowLeft } from 'lucide-react'

function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getThreadDisplayName(thread: ThreadOut): string {
  if (thread.name) return thread.name
  if (thread.participants.length > 0) {
    return thread.participants.map((p) => p.full_name).join(', ')
  }
  return 'Без названия'
}

function getLastMessagePreview(message: MessageOut | null): string {
  if (!message) return 'Нет сообщений'
  if (message.text) {
    return message.text.length > 50 ? message.text.slice(0, 50) + '...' : message.text
  }
  if (message.photo_url) return 'Фото'
  if (message.voice_url) return 'Голосовое сообщение'
  return 'Сообщение'
}

export default function MessengerPage() {
  const queryClient = useQueryClient()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [newChatSearch, setNewChatSearch] = useState('')
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch threads with polling
  const { data: threadsData } = useQuery({
    queryKey: ['messenger', 'threads'],
    queryFn: () => messengerApi.threads().then((r) => r.data),
    refetchInterval: 10000,
  })

  const threads: ThreadOut[] = threadsData?.threads ?? []

  // Fetch messages for selected thread with polling
  const { data: messagesData } = useQuery({
    queryKey: ['messenger', 'messages', selectedThreadId],
    queryFn: () => messengerApi.messages(selectedThreadId!).then((r) => r.data),
    enabled: !!selectedThreadId,
    refetchInterval: 5000,
  })

  const messages: MessageOut[] = messagesData?.messages ?? []

  // Fetch contacts for new chat dialog
  const { data: contactsRaw } = useQuery({
    queryKey: ['messenger', 'contacts'],
    queryFn: () => messengerApi.contacts().then((r) => r.data),
    enabled: showNewChatDialog,
  })

  const contacts: ContactOut[] = Array.isArray(contactsRaw) ? contactsRaw : []

  const selectedThread = threads.find((t) => t.id === selectedThreadId) ?? null

  // Mark thread as read when selected
  const markReadMutation = useMutation({
    mutationFn: (threadId: string) => messengerApi.markRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger', 'threads'] })
    },
  })

  useEffect(() => {
    if (selectedThreadId) {
      markReadMutation.mutate(selectedThreadId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThreadId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: () =>
      messengerApi.sendMessage(selectedThreadId!, { text: messageText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger', 'messages', selectedThreadId] })
      queryClient.invalidateQueries({ queryKey: ['messenger', 'threads'] })
      setMessageText('')
    },
    onError: () => {
      toast.error('Не удалось отправить сообщение')
    },
  })

  // Create thread mutation
  const createThreadMutation = useMutation({
    mutationFn: () =>
      messengerApi.createThread({
        type: selectedContactIds.length > 1 ? 'group' : 'direct',
        participant_ids: selectedContactIds,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['messenger', 'threads'] })
      setSelectedThreadId(response.data.id)
      setShowNewChatDialog(false)
      setSelectedContactIds([])
      setNewChatSearch('')
      toast.success('Чат создан')
    },
    onError: () => {
      toast.error('Не удалось создать чат')
    },
  })

  function handleSendMessage(): void {
    if (!messageText.trim() || !selectedThreadId) return
    sendMessageMutation.mutate()
  }

  function handleSelectThread(threadId: string): void {
    setSelectedThreadId(threadId)
  }

  function toggleContactSelection(contactId: string): void {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    )
  }

  // Filter threads by search query
  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const name = getThreadDisplayName(thread).toLowerCase()
    return name.includes(query)
  })

  // Filter contacts by search in new chat dialog
  const filteredContacts = contacts.filter((contact) => {
    if (!newChatSearch.trim()) return true
    const query = newChatSearch.toLowerCase()
    return (
      contact.full_name.toLowerCase().includes(query) ||
      contact.phone.includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <PageHeader
        title="Мессенджер"
        description="Общение с монтажниками и бригадирами"
      />

      <div className="flex h-[calc(100vh-180px)] sm:h-[calc(100vh-220px)] overflow-hidden rounded-lg border">
        {/* Left panel — thread list (hidden on mobile when chat is open) */}
        <div className={cn(
          'flex flex-col border-r w-full sm:w-[280px] md:w-[300px] shrink-0',
          selectedThreadId ? 'hidden sm:flex' : 'flex',
        )}>
          {/* Search + New chat button */}
          <div className="flex items-center gap-2 border-b p-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 shrink-0"
              onClick={() => setShowNewChatDialog(true)}
              aria-label="Новый чат"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Thread list */}
          <ScrollArea className="flex-1">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8" />
                <p className="text-sm">Нет чатов</p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-accent',
                    selectedThreadId === thread.id && 'bg-accent',
                  )}
                >
                  <Avatar className="mt-0.5 shrink-0">
                    {thread.avatar_url ? (
                      <AvatarImage src={thread.avatar_url} alt={getThreadDisplayName(thread)} />
                    ) : null}
                    <AvatarFallback>
                      {getInitials(getThreadDisplayName(thread))}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {getThreadDisplayName(thread)}
                      </span>
                      {thread.last_message && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatTimeAgo(thread.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">
                        {getLastMessagePreview(thread.last_message)}
                      </p>
                      {thread.unread_count > 0 && (
                        <Badge
                          variant="default"
                          className="h-5 min-w-5 shrink-0 justify-center px-1.5 text-[10px]"
                        >
                          {thread.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Right panel — chat area (full width on mobile when open) */}
        <div className={cn(
          'flex flex-1 flex-col',
          selectedThreadId ? 'flex' : 'hidden sm:flex',
        )}>
          {selectedThread ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-2 sm:gap-3 border-b px-3 sm:px-4 py-3">
                {/* Back button on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden shrink-0"
                  onClick={() => setSelectedThreadId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar>
                  {selectedThread.avatar_url ? (
                    <AvatarImage
                      src={selectedThread.avatar_url}
                      alt={getThreadDisplayName(selectedThread)}
                    />
                  ) : null}
                  <AvatarFallback>
                    {getInitials(getThreadDisplayName(selectedThread))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">
                    {getThreadDisplayName(selectedThread)}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>
                      {selectedThread.participants.length}{' '}
                      {selectedThread.participants.length === 1
                        ? 'участник'
                        : selectedThread.participants.length < 5
                          ? 'участника'
                          : 'участников'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
                      Нет сообщений
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCurator = msg.sender_role === 'curator'

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'max-w-[85%] sm:max-w-[75%] rounded-lg p-3',
                            isCurator
                              ? 'self-end bg-primary text-primary-foreground'
                              : 'self-start bg-muted',
                          )}
                        >
                          {!isCurator && (
                            <p className="mb-1 text-xs font-medium">
                              {msg.sender_name}
                            </p>
                          )}

                          {msg.photo_url && (
                            <img
                              src={msg.photo_url}
                              alt="Фото"
                              className="mb-2 max-h-48 rounded object-cover"
                            />
                          )}

                          {msg.text && (
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          )}

                          <span
                            className={cn(
                              'mt-1 block text-[10px]',
                              isCurator
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground',
                            )}
                          >
                            {formatDateTime(msg.created_at)}
                          </span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input area */}
              <div className="flex items-end gap-2 border-t p-4">
                <Textarea
                  placeholder="Напишите сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={1}
                  className="min-h-[40px] max-h-[120px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  size="icon"
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  onClick={handleSendMessage}
                  aria-label="Отправить"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageCircle className="h-12 w-12" />
              <p className="text-sm">Выберите чат</p>
            </div>
          )}
        </div>
      </div>

      {/* New chat dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый чат</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск контактов..."
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {selectedContactIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedContactIds.map((id) => {
                  const contact = contacts.find((c) => c.id === id)
                  if (!contact) return null
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleContactSelection(id)}
                    >
                      {contact.full_name} &times;
                    </Badge>
                  )
                })}
              </div>
            )}

            <ScrollArea className="max-h-[300px]">
              <div className="flex flex-col">
                {filteredContacts.map((contact) => {
                  const isSelected = selectedContactIds.includes(contact.id)
                  return (
                    <button
                      key={contact.id}
                      onClick={() => toggleContactSelection(contact.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent',
                        isSelected && 'bg-accent',
                      )}
                    >
                      <Avatar size="sm">
                        <AvatarFallback>{getInitials(contact.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{contact.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {contact.phone} &middot; {contact.role}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                  )
                })}

                {filteredContacts.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Контакты не найдены
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewChatDialog(false)
                setSelectedContactIds([])
                setNewChatSearch('')
              }}
            >
              Отмена
            </Button>
            <Button
              disabled={selectedContactIds.length === 0 || createThreadMutation.isPending}
              onClick={() => createThreadMutation.mutate()}
            >
              Создать чат
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
