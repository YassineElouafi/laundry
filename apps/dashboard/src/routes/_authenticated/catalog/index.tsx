import { createFileRoute } from '@tanstack/react-router'
import { Catalog } from '@/features/catalog'

export const Route = createFileRoute('/_authenticated/catalog/')({
  component: Catalog,
})
