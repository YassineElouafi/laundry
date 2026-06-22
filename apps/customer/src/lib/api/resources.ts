import { api } from './client';
import type {
  AddressDto,
  InfinityPaginated,
  OrderDto,
  PaymentMethod,
  ServiceItemDto,
} from '@laundry/shared';

// --- Catalog ---
export async function listServiceItems(): Promise<ServiceItemDto[]> {
  const { data } = await api.get<InfinityPaginated<ServiceItemDto>>('/service-items', {
    params: { limit: 100 },
  });
  return data.data;
}

// --- Addresses (customer-scoped) ---
export async function listAddresses(): Promise<AddressDto[]> {
  const { data } = await api.get<InfinityPaginated<AddressDto>>('/addresses', {
    params: { limit: 50 },
  });
  return data.data;
}

export async function createAddress(input: {
  label: string;
  line1: string;
  city: string;
  isDefault?: boolean;
}): Promise<AddressDto> {
  const { data } = await api.post<AddressDto>('/addresses', input);
  return data;
}

// --- Orders (customer-scoped) ---
export async function listMyOrders(): Promise<OrderDto[]> {
  const { data } = await api.get<InfinityPaginated<OrderDto>>('/orders', {
    params: { limit: 50 },
  });
  return data.data;
}

export async function getMyOrder(id: string): Promise<OrderDto> {
  const { data } = await api.get<OrderDto>(`/orders/${id}`);
  return data;
}

export interface CreateOrderInput {
  paymentMethod: PaymentMethod;
  pickupAddress: { id: string };
  deliveryAddress: { id: string };
  items: { serviceItem: { id: string }; quantity: number }[];
  notes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderDto> {
  const { data } = await api.post<OrderDto>('/orders', input);
  return data;
}

export async function initiatePayment(
  orderId: string
): Promise<{ payment: { id: string; status: string }; redirect?: { url: string; fields: Record<string, string> } }> {
  const { data } = await api.post('/payments/initiate', { orderId });
  return data;
}
