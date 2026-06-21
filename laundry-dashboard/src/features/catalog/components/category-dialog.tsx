import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  createCategory,
  updateCategory,
  type CategoryInput,
} from '@/lib/api/catalog'
import { type ServiceCategoryDto } from '@/lib/api/types'
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
import { Switch } from '@/components/ui/switch'

const schema = z.object({
  nameFr: z.string().min(1),
  nameAr: z.string().min(1),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ServiceCategoryDto | null
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEdit = Boolean(category)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nameFr: '', nameAr: '', icon: '', sortOrder: 0, active: true },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nameFr: category?.name.fr ?? '',
        nameAr: category?.name.ar ?? '',
        icon: category?.icon ?? '',
        sortOrder: category?.sortOrder ?? 0,
        active: category?.active ?? true,
      })
    }
  }, [open, category, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: CategoryInput = {
        name: { fr: values.nameFr, ar: values.nameAr },
        icon: values.icon || null,
        sortOrder: values.sortOrder ?? 0,
        active: values.active,
      }
      return isEdit
        ? updateCategory(category!.id, payload)
        : createCategory(payload)
    },
    onSuccess: () => {
      toast.success(t('common.save'))
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to save category.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('common.edit') : t('catalog.newCategory')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id='category-form'
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
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('catalog.icon')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sortOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>#</FormLabel>
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
          <Button
            type='submit'
            form='category-form'
            disabled={mutation.isPending}
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
