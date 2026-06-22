import { useTranslation } from 'react-i18next'
import { type OrderStatus } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const STATUS_STYLES: Record<OrderStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  driver_assigned:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  picked_up:
    'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  at_facility:
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  in_cleaning:
    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  ready: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  out_for_delivery:
    'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  delivered:
    'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return (
    <Badge
      variant='secondary'
      className={cn('border-transparent', STATUS_STYLES[status])}
    >
      {t(`status.${status}`)}
    </Badge>
  )
}
