import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarClock, Package, TrendingUp, Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { listOrders } from '@/lib/api/orders'
import { listTimeSlots } from '@/lib/api/scheduling'
import { ORDER_STATUSES } from '@/lib/api/types'
import { formatMAD } from '@/lib/format'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { LanguageSwitch } from '@/components/language-switch'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function Dashboard() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const navigate = useNavigate()

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => listOrders({ limit: 50 }),
  })
  const slotsQuery = useQuery({
    queryKey: ['time-slots'],
    queryFn: listTimeSlots,
  })

  const orders = ordersQuery.data?.data ?? []
  const slots = slotsQuery.data ?? []

  const kpis = useMemo(() => {
    const ordersToday = orders.filter((o) => isToday(o.createdAt)).length
    const revenue = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total ?? 0), 0)
    const pendingPickups = orders.filter((o) =>
      ['scheduled', 'driver_assigned'].includes(o.status)
    ).length
    const capacity = slots.reduce((s, x) => s + x.capacity, 0)
    const booked = slots.reduce((s, x) => s + x.booked, 0)
    const capacityUsed = capacity > 0 ? Math.round((booked / capacity) * 100) : 0
    return { ordersToday, revenue, pendingPickups, capacityUsed }
  }, [orders, slots])

  const chartData = useMemo(
    () =>
      ORDER_STATUSES.map((s) => ({
        status: t(`status.${s}`),
        count: orders.filter((o) => o.status === s).length,
      })).filter((d) => d.count > 0),
    [orders, t]
  )

  const recent = useMemo(() => orders.slice(0, 6), [orders])

  const cards = [
    {
      title: t('dashboard.ordersToday'),
      value: kpis.ordersToday,
      icon: Package,
    },
    {
      title: t('dashboard.revenue'),
      value: formatMAD(kpis.revenue, lang),
      icon: TrendingUp,
    },
    {
      title: t('dashboard.pendingPickups'),
      value: kpis.pendingPickups,
      icon: Truck,
    },
    {
      title: t('dashboard.capacityUsed'),
      value: `${kpis.capacityUsed}%`,
      icon: CalendarClock,
    },
  ]

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('dashboard.title')}
          </h1>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {cards.map((c) => (
            <Card key={c.title}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{c.title}</CardTitle>
                <c.icon className='text-muted-foreground size-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='mt-4 grid gap-4 lg:grid-cols-7'>
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle>{t('dashboard.ordersByStatus')}</CardTitle>
            </CardHeader>
            <CardContent className='ps-2'>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                  <XAxis dataKey='status' fontSize={11} interval={0} angle={-20} textAnchor='end' height={60} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey='count' radius={[4, 4, 0, 0]} className='fill-primary' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('orders.customer')}</TableHead>
                    <TableHead>{t('orders.status')}</TableHead>
                    <TableHead className='text-end'>
                      {t('orders.total')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((o) => (
                    <TableRow
                      key={o.id}
                      className='cursor-pointer'
                      onClick={() =>
                        navigate({
                          to: '/orders/$orderId',
                          params: { orderId: o.id },
                        })
                      }
                    >
                      <TableCell className='max-w-[140px] truncate'>
                        {o.user?.email ?? '—'}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className='text-end'>
                        {formatMAD(o.total ?? 0, lang)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
