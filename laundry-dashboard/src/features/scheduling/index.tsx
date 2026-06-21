import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  createTimeSlot,
  deleteTimeSlot,
  listTimeSlots,
  type TimeSlotInput,
} from '@/lib/api/scheduling'
import { formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { LanguageSwitch } from '@/components/language-switch'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

const schema = z.object({
  date: z.string().min(1),
  windowStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:mm'),
  windowEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:mm'),
  capacity: z.number().int().min(1),
  slotType: z.enum(['pickup', 'delivery']),
})
type FormValues = z.infer<typeof schema>

function SlotDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: '',
      windowStart: '09:00',
      windowEnd: '11:00',
      capacity: 10,
      slotType: 'pickup',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createTimeSlot(values as TimeSlotInput),
    onSuccess: () => {
      toast.success(t('common.save'))
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      onOpenChange(false)
      form.reset()
    },
    onError: () => toast.error('Failed to create slot.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('scheduling.newSlot')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id='slot-form'
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className='grid gap-4'
          >
            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('scheduling.date')}</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='windowStart'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('scheduling.window')} ({'>'})</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='windowEnd'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('scheduling.window')} ({'<'})</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='capacity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('scheduling.capacity')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='slotType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('scheduling.type')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='pickup'>
                          {t('scheduling.pickup')}
                        </SelectItem>
                        <SelectItem value='delivery'>
                          {t('scheduling.delivery')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type='submit' form='slot-form' disabled={mutation.isPending}>
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Scheduling() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState(false)

  const slots = useQuery({ queryKey: ['time-slots'], queryFn: listTimeSlots })

  const del = useMutation({
    mutationFn: deleteTimeSlot,
    onSuccess: () => {
      toast.success(t('common.delete'))
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
    },
    onError: () => toast.error('Delete failed.'),
  })

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
        <div className='mb-4 flex items-end justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              {t('scheduling.title')}
            </h1>
            <p className='text-muted-foreground'>{t('scheduling.subtitle')}</p>
          </div>
          <Button onClick={() => setDialog(true)}>
            <Plus className='size-4' /> {t('scheduling.newSlot')}
          </Button>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('scheduling.date')}</TableHead>
                <TableHead>{t('scheduling.window')}</TableHead>
                <TableHead>{t('scheduling.type')}</TableHead>
                <TableHead>{t('scheduling.capacity')}</TableHead>
                <TableHead>{t('scheduling.booked')}</TableHead>
                <TableHead>{t('scheduling.remaining')}</TableHead>
                <TableHead className='text-end'>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.data?.map((s) => {
                const remaining = s.capacity - s.booked
                return (
                  <TableRow key={s.id}>
                    <TableCell>{formatDate(s.date, lang)}</TableCell>
                    <TableCell>
                      {s.windowStart} – {s.windowEnd}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {t(`scheduling.${s.slotType}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.capacity}</TableCell>
                    <TableCell>{s.booked}</TableCell>
                    <TableCell>
                      <Badge
                        variant={remaining > 0 ? 'default' : 'secondary'}
                      >
                        {remaining}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          if (confirm(`${t('common.delete')}?`)) del.mutate(s.id)
                        }}
                      >
                        <Trash2 className='text-destructive size-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Main>

      <SlotDialog open={dialog} onOpenChange={setDialog} />
    </>
  )
}
