import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  deleteCategory,
  deleteItem,
  listCategories,
  listItems,
} from '@/lib/api/catalog'
import {
  localized,
  type ServiceCategoryDto,
  type ServiceItemDto,
} from '@/lib/api/types'
import { formatMAD } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { CategoryDialog } from './components/category-dialog'
import { ItemDialog } from './components/item-dialog'

export function Catalog() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const queryClient = useQueryClient()

  const [catDialog, setCatDialog] = useState(false)
  const [editCat, setEditCat] = useState<ServiceCategoryDto | null>(null)
  const [itemDialog, setItemDialog] = useState(false)
  const [editItem, setEditItem] = useState<ServiceItemDto | null>(null)

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })
  const items = useQuery({ queryKey: ['items'], queryFn: listItems })

  const delCat = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success(t('common.delete'))
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => toast.error('Delete failed.'),
  })
  const delItem = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      toast.success(t('common.delete'))
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
    onError: () => toast.error('Delete failed.'),
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
            {t('catalog.title')}
          </h1>
          <p className='text-muted-foreground'>{t('catalog.subtitle')}</p>
        </div>

        <Tabs defaultValue='categories' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='categories'>{t('catalog.categories')}</TabsTrigger>
            <TabsTrigger value='items'>{t('catalog.items')}</TabsTrigger>
          </TabsList>

          <TabsContent value='categories' className='space-y-4'>
            <div className='flex justify-end'>
              <Button
                onClick={() => {
                  setEditCat(null)
                  setCatDialog(true)
                }}
              >
                <Plus className='size-4' /> {t('catalog.newCategory')}
              </Button>
            </div>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('catalog.name')}</TableHead>
                    <TableHead>{t('catalog.icon')}</TableHead>
                    <TableHead>{t('catalog.active')}</TableHead>
                    <TableHead className='text-end'>
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.data?.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className='font-medium'>{c.name.fr}</div>
                        <div className='text-muted-foreground text-sm' dir='rtl'>
                          {c.name.ar}
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {c.icon ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.active ? 'default' : 'secondary'}>
                          {c.active ? t('common.yes') : t('common.no')}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-end'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            setEditCat(c)
                            setCatDialog(true)
                          }}
                        >
                          <Pencil className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            if (confirm(`${t('common.delete')}?`))
                              delCat.mutate(c.id)
                          }}
                        >
                          <Trash2 className='text-destructive size-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value='items' className='space-y-4'>
            <div className='flex justify-end'>
              <Button
                onClick={() => {
                  setEditItem(null)
                  setItemDialog(true)
                }}
                disabled={!categories.data?.length}
              >
                <Plus className='size-4' /> {t('catalog.newItem')}
              </Button>
            </div>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('catalog.name')}</TableHead>
                    <TableHead>{t('catalog.category')}</TableHead>
                    <TableHead>{t('catalog.priceType')}</TableHead>
                    <TableHead>{t('catalog.price')}</TableHead>
                    <TableHead className='text-end'>
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.data?.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        <div className='font-medium'>{it.name.fr}</div>
                        <div className='text-muted-foreground text-sm' dir='rtl'>
                          {it.name.ar}
                        </div>
                      </TableCell>
                      <TableCell>
                        {it.category ? localized(it.category.name, lang) : '—'}
                      </TableCell>
                      <TableCell>
                        {t(
                          it.priceType === 'per_kilo'
                            ? 'catalog.perKilo'
                            : 'catalog.perItem'
                        )}
                      </TableCell>
                      <TableCell>{formatMAD(it.unitPrice, lang)}</TableCell>
                      <TableCell className='text-end'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            setEditItem(it)
                            setItemDialog(true)
                          }}
                        >
                          <Pencil className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            if (confirm(`${t('common.delete')}?`))
                              delItem.mutate(it.id)
                          }}
                        >
                          <Trash2 className='text-destructive size-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <CategoryDialog
        open={catDialog}
        onOpenChange={setCatDialog}
        category={editCat}
      />
      <ItemDialog
        open={itemDialog}
        onOpenChange={setItemDialog}
        item={editItem}
        categories={categories.data ?? []}
      />
    </>
  )
}
