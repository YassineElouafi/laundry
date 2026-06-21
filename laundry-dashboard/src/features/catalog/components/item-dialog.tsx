import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { createItem, updateItem, type ItemInput } from '@/lib/api/catalog'
import {
  localized,
  type ServiceCategoryDto,
  type ServiceItemDto,
} from '@/lib/api/types'
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
import { Switch } from '@/components/ui/switch'

const schema = z.object({
  nameFr: z.string().min(1),
  nameAr: z.string().min(1),
  categoryId: z.string().min(1),
  priceType: z.enum(['per_kilo', 'per_item']),
  unitPrice: z.number().min(0),
  active: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function ItemDialog({
  open,
  onOpenChange,
  item,
  categories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: ServiceItemDto | null
  categories: ServiceCategoryDto[]
}) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const isEdit = Boolean(item)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameFr: '',
      nameAr: '',
      categoryId: '',
      priceType: 'per_item',
      unitPrice: 0,
      active: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nameFr: item?.name.fr ?? '',
        nameAr: item?.name.ar ?? '',
        categoryId: item?.category?.id ?? categories[0]?.id ?? '',
        priceType: item?.priceType ?? 'per_item',
        unitPrice: item?.unitPrice ?? 0,
        active: item?.active ?? true,
      })
    }
  }, [open, item, categories, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: ItemInput = {
        name: { fr: values.nameFr, ar: values.nameAr },
        priceType: values.priceType,
        unitPrice: values.unitPrice,
        active: values.active,
        category: { id: values.categoryId },
      }
      return isEdit ? updateItem(item!.id, payload) : createItem(payload)
    },
    onSuccess: () => {
      toast.success(t('common.save'))
      queryClient.invalidateQueries({ queryKey: ['items'] })
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to save service.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('common.edit') : t('catalog.newItem')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id='item-form'
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className='grid gap-4'
          >
            <FormField
              control={form.control}
              name='nameFr'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('catalog.nameFr')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='nameAr'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('catalog.nameAr')}</FormLabel>
                  <FormControl>
                    <Input dir='rtl' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('catalog.category')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {localized(c.name, i18n.language)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='priceType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('catalog.priceType')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='per_item'>
                          {t('catalog.perItem')}
                        </SelectItem>
                        <SelectItem value='per_kilo'>
                          {t('catalog.perKilo')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='unitPrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('catalog.price')} (MAD)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
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
            </div>
            <FormField
              control={form.control}
              name='active'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between'>
                  <FormLabel>{t('catalog.active')}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type='submit' form='item-form' disabled={mutation.isPending}>
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
