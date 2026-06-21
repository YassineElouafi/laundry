import { createFileRoute } from '@tanstack/react-router'
import { Scheduling } from '@/features/scheduling'

export const Route = createFileRoute('/_authenticated/scheduling/')({
  component: Scheduling,
})
