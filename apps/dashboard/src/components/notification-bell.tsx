import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { listOrders } from '@/lib/api/orders'
import {
  buildNotifications,
  countUnread,
  getLastSeen,
  setLastSeen,
} from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NotificationBell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [lastSeen, setSeen] = useState(getLastSeen)

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listOrders({ limit: 50 }),
    refetchInterval: 60_000,
  })

  const notifs = buildNotifications(data?.data ?? [])
  const unread = countUnread(notifs, lastSeen)

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next && notifs.length) {
      const now = new Date().toISOString()
      setLastSeen(now)
      setSeen(now)
    }
  }

  function go(orderId: string) {
    setOpen(false)
    navigate({ to: '/orders/$orderId', params: { orderId } })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative' aria-label={t('notif.title')}>
          <Bell className='size-5' />
          {unread > 0 && (
            <span className='absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white'>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <div className='border-b px-4 py-3 text-sm font-semibold'>
          {t('notif.title')}
        </div>
        <ScrollArea className='h-96'>
          {notifs.length ? (
            notifs.slice(0, 40).map((n) => {
              const unseen = !lastSeen || n.createdAt > lastSeen
              return (
                <button
                  key={n.id}
                  onClick={() => go(n.orderId)}
                  className={cn(
                    'flex w-full flex-col items-start gap-0.5 border-b px-4 py-3 text-start transition-colors hover:bg-accent',
                    unseen && 'bg-accent/40'
                  )}
                >
                  <span className='text-sm font-medium'>
                    {t(`status.${n.status}`)}
                  </span>
                  <span className='text-muted-foreground text-xs'>
                    {t('notif.order')} #{n.orderShort} ·{' '}
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </button>
              )
            })
          ) : (
            <div className='text-muted-foreground p-8 text-center text-sm'>
              {t('notif.empty')}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
