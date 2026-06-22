import { createFileRoute } from '@tanstack/react-router'
import { OrderDetail } from '@/features/orders/order-detail'

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = Route.useParams()
  return <OrderDetail orderId={orderId} />
}
