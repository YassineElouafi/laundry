import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { listOrders } from '@/lib/api/orders'
import { ORDER_STATUSES, type OrderDto } from '@/lib/api/types'
import { formatDateTime, formatMAD } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function Orders() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => listOrders({ limit: 50 }),
  })

  const orders = useMemo(() => {
    let rows = data?.data ?? []
    if (status !== 'all') rows = rows.filter((o) => o.status === status)
    return rows
  }, [data, status])

  const columns = useMemo<ColumnDef<OrderDto>[]>(
    () => [
      {
        header: t('orders.order'),
        accessorKey: 'id',
        cell: ({ row }) => (
          <span className='font-mono text-xs'>
            {row.original.id.slice(0, 8)}
          </span>
        ),
      },
      {
        header: t('orders.customer'),
        accessorFn: (o) =>
          `${o.user?.firstName ?? ''} ${o.user?.lastName ?? ''} ${o.user?.email ?? ''}`,
        id: 'customer',
        cell: ({ row }) => {
          const u = row.original.user
          return (
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>
                {[u?.firstName, u?.lastName].filter(Boolean).join(' ') || '—'}
              </span>
              <span className='text-muted-foreground text-xs'>{u?.email}</span>
            </div>
          )
        },
      },
      {
        header: t('orders.status'),
        accessorKey: 'status',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        header: t('orders.payment'),
        accessorKey: 'paymentMethod',
        cell: ({ row }) => (
          <span className='uppercase'>{row.original.paymentMethod}</span>
        ),
      },
      {
        header: t('orders.total'),
        accessorKey: 'total',
        cell: ({ row }) => formatMAD(row.original.total, lang),
      },
      {
        header: t('orders.createdAt'),
        accessorKey: 'createdAt',
        cell: ({ row }) => (
          <span className='text-muted-foreground text-sm'>
            {formatDateTime(row.original.createdAt, lang)}
          </span>
        ),
      },
    ],
    [t, lang]
  )

  const table = useReactTable({
    data: orders,
    columns,
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('orders.title')}
          </h1>
          <p className='text-muted-foreground'>{t('orders.subtitle')}</p>
        </div>

        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='sm:max-w-xs'
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className='sm:w-56'>
              <SelectValue placeholder={t('orders.filterStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('common.all')}</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className='cursor-pointer'
                    onClick={() =>
                      navigate({
                        to: '/orders/$orderId',
                        params: { orderId: row.original.id },
                      })
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    {t('orders.noOrders')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className='mt-4 flex items-center justify-end gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <span className='text-muted-foreground text-sm'>
            {table.getState().pagination.pageIndex + 1} /{' '}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
        </div>
      </Main>
    </>
  )
}
