import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { listOrders } from '@/lib/api/orders'
import { listUsers } from '@/lib/api/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}`
}

export function Customers() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const users = useQuery({ queryKey: ['users'], queryFn: listUsers })
  const orders = useQuery({
    queryKey: ['orders'],
    queryFn: () => listOrders({ limit: 50 }),
  })

  const orderCountByUser = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders.data?.data ?? []) {
      const id = String(o.user?.id ?? '')
      if (id) map.set(id, (map.get(id) ?? 0) + 1)
    }
    return map
  }, [orders.data])

  const customers = useMemo(() => {
    const list = (users.data ?? []).filter(
      (u) => (u.role?.name ?? '').toLowerCase() === 'customer'
    )
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((u) =>
      [u.firstName, u.lastName, u.email, u.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [users.data, search])

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
            {t('customers.title')}
          </h1>
          <p className='text-muted-foreground'>{t('customers.subtitle')}</p>
        </div>

        <div className='mb-4'>
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='sm:max-w-xs'
          />
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('customers.name')}</TableHead>
                <TableHead>{t('customers.email')}</TableHead>
                <TableHead>{t('customers.phone')}</TableHead>
                <TableHead>{t('customers.orders')}</TableHead>
                <TableHead className='text-end'>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className='font-medium'>
                    {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {u.email}
                  </TableCell>
                  <TableCell>{u.phone ?? '—'}</TableCell>
                  <TableCell>{orderCountByUser.get(String(u.id)) ?? 0}</TableCell>
                  <TableCell className='text-end'>
                    {u.phone ? (
                      <Button asChild variant='ghost' size='sm'>
                        <a
                          href={waLink(u.phone)}
                          target='_blank'
                          rel='noreferrer'
                        >
                          <MessageCircle className='size-4 text-green-600' />
                          {t('customers.whatsapp')}
                        </a>
                      </Button>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!customers.length && (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
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
