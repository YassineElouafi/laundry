import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { listPayments, markCodPaid } from '@/lib/api/payments'
import { type PaymentStatus } from '@/lib/api/types'
import { formatDateTime, formatMAD } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

const STATUS_STYLE: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  refunded: 'bg-muted text-muted-foreground',
}

export function Payments() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => listPayments({ limit: 50 }),
  })

  const mark = useMutation({
    mutationFn: markCodPaid,
    onSuccess: () => {
      toast.success(t('payments.paid'))
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: () => toast.error('Failed to mark paid.'),
  })

  const rows = useMemo(() => {
    const list = data?.data ?? []
    return status === 'all' ? list : list.filter((p) => p.status === status)
  }, [data, status])

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
            {t('payments.title')}
          </h1>
          <p className='text-muted-foreground'>{t('payments.subtitle')}</p>
        </div>

        <div className='mb-4'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className='sm:w-56'>
              <SelectValue placeholder={t('payments.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('common.all')}</SelectItem>
              {(['pending', 'paid', 'failed', 'refunded'] as const).map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`payments.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('payments.method')}</TableHead>
                <TableHead>{t('payments.status')}</TableHead>
                <TableHead>{t('payments.amount')}</TableHead>
                <TableHead>{t('payments.reference')}</TableHead>
                <TableHead>{t('orders.order')}</TableHead>
                <TableHead>{t('orders.createdAt')}</TableHead>
                <TableHead className='text-end'>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='uppercase'>{p.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant='secondary'
                        className={`border-transparent ${STATUS_STYLE[p.status]}`}
                      >
                        {t(`payments.${p.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatMAD(p.amount, lang)}</TableCell>
                    <TableCell className='font-mono text-xs'>
                      {p.ref ?? '—'}
                    </TableCell>
                    <TableCell className='font-mono text-xs'>
                      {p.order?.id?.slice(0, 8) ?? '—'}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {formatDateTime(p.createdAt, lang)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {p.method === 'cod' && p.status === 'pending' ? (
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={mark.isPending}
                          onClick={() => mark.mutate(p.id)}
                        >
                          <CheckCircle2 className='size-4' /> {t('payments.paid')}
                        </Button>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    {t('common.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
