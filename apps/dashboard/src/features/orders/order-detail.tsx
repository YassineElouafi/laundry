import { useState } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { advanceOrderStatus, getOrder } from '@/lib/api/orders'
import { ORDER_TRANSITIONS, localized, type OrderStatus } from '@/lib/api/types'
import { formatDateTime, formatMAD } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { LanguageSwitch } from '@/components/language-switch'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { OrderStatusBadge } from './components/order-status-badge'

export function OrderDetail({ orderId }: { orderId: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [nextStatus, setNextStatus] = useState<string>('')

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
  })

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => advanceOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success(t('orders.advanceStatus'))
      setNextStatus('')
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: () => toast.error('Transition failed.'),
  })

  const allowed: OrderStatus[] = order
    ? (ORDER_TRANSITIONS[order.status] ?? [])
    : []

  return (
    <>
      <Header>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate({ to: '/orders' })}
        >
          <ArrowLeft className='size-4' /> {t('orders.title')}
        </Button>
        <div className='ms-auto flex items-center gap-2'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        {isLoading || !order ? (
          <div className='text-muted-foreground'>{t('common.loading')}</div>
        ) : (
          <div className='space-y-6'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>
                  {t('orders.order')}{' '}
                  <span className='font-mono text-lg'>
                    #{order.id.slice(0, 8)}
                  </span>
                </h1>
                <p className='text-muted-foreground text-sm'>
                  {formatDateTime(order.createdAt, lang)}
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <OrderStatusBadge status={order.status} />
                {allowed.length > 0 && (
                  <div className='flex items-center gap-2'>
                    <Select value={nextStatus} onValueChange={setNextStatus}>
                      <SelectTrigger className='w-48'>
                        <SelectValue placeholder={t('orders.advanceStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        {allowed.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`status.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size='sm'
                      disabled={!nextStatus || mutation.isPending}
                      onClick={() =>
                        nextStatus && mutation.mutate(nextStatus as OrderStatus)
                      }
                    >
                      {mutation.isPending ? (
                        <Loader2 className='size-4 animate-spin' />
                      ) : null}
                      {t('common.confirm')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-3'>
              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle>{t('orders.items')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('catalog.name')}</TableHead>
                        <TableHead>{t('orders.quantity')}</TableHead>
                        <TableHead>{t('orders.unitPrice')}</TableHead>
                        <TableHead className='text-end'>
                          {t('orders.lineTotal')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {localized(item.serviceItem.name, lang)}
                            <span className='text-muted-foreground ms-1 text-xs'>
                              ({t(
                                item.serviceItem.priceType === 'per_kilo'
                                  ? 'catalog.perKilo'
                                  : 'catalog.perItem'
                              )})
                            </span>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatMAD(item.unitPrice, lang)}</TableCell>
                          <TableCell className='text-end'>
                            {formatMAD(item.lineTotal, lang)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className='text-end font-medium'>
                          {t('orders.total')}
                        </TableCell>
                        <TableCell className='text-end font-bold'>
                          {formatMAD(order.total, lang)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('orders.customer')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-1 text-sm'>
                    <div className='font-medium'>
                      {[order.user?.firstName, order.user?.lastName]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </div>
                    <div className='text-muted-foreground'>
                      {order.user?.email}
                    </div>
                    {order.user?.phone && (
                      <div className='text-muted-foreground'>
                        {order.user.phone}
                      </div>
                    )}
                    <div className='pt-2'>
                      {t('orders.payment')}:{' '}
                      <span className='uppercase'>{order.paymentMethod}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('orders.pickupAddress')}</CardTitle>
                  </CardHeader>
                  <CardContent className='text-sm'>
                    <div className='font-medium'>{order.pickupAddress?.label}</div>
                    <div className='text-muted-foreground'>
                      {order.pickupAddress?.line1}, {order.pickupAddress?.city}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('orders.deliveryAddress')}</CardTitle>
                  </CardHeader>
                  <CardContent className='text-sm'>
                    <div className='font-medium'>
                      {order.deliveryAddress?.label}
                    </div>
                    <div className='text-muted-foreground'>
                      {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('orders.timeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className='relative space-y-4 border-s ps-6'>
                  {order.events?.map((ev) => (
                    <li key={ev.id} className='relative'>
                      <span className='bg-primary absolute -start-[1.65rem] top-1.5 size-2.5 rounded-full' />
                      <div className='flex flex-wrap items-center gap-2'>
                        <OrderStatusBadge status={ev.status} />
                        <span className='text-muted-foreground text-xs'>
                          {formatDateTime(ev.createdAt, lang)}
                        </span>
                      </div>
                      {ev.note && (
                        <p className='text-muted-foreground mt-1 text-sm'>
                          {ev.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </>
  )
}
