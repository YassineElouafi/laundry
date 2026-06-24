import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { listDrivers } from '@/lib/api/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DriverDialog } from './components/driver-dialog'
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

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}`
}

export function Drivers() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: listDrivers,
  })

  const rows = useMemo(() => {
    const list = data ?? []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((u) =>
      [u.firstName, u.lastName, u.email, u.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [data, search])

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
        <div className='mb-4 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              {t('drivers.title')}
            </h1>
            <p className='text-muted-foreground'>{t('drivers.subtitle')}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className='size-4' />
            {t('drivers.add')}
          </Button>
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
                <TableHead className='text-end'>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className='font-medium'>
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {u.email}
                    </TableCell>
                    <TableCell>{u.phone ?? '—'}</TableCell>
                    <TableCell className='text-end'>
                      {u.phone ? (
                        <Button asChild variant='ghost' size='sm'>
                          <a href={waLink(u.phone)} target='_blank' rel='noreferrer'>
                            <MessageCircle className='size-4 text-green-600' />
                            {t('customers.whatsapp')}
                          </a>
                        </Button>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    {t('common.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DriverDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </Main>
    </>
  )
}
