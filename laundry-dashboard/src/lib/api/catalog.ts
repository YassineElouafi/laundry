import { api } from './client'
import type {
  InfinityPaginated,
  LocalizedString,
  PriceType,
  ServiceCategoryDto,
  ServiceItemDto,
} from './types'

// --- Categories ---
export async function listCategories(): Promise<ServiceCategoryDto[]> {
  const { data } = await api.get<InfinityPaginated<ServiceCategoryDto>>(
    '/service-categories',
    { params: { limit: 50 } }
  )
  return data.data
}

export interface CategoryInput {
  name: LocalizedString
  icon?: string | null
  active?: boolean
  sortOrder?: number
}

export async function createCategory(
  input: CategoryInput
): Promise<ServiceCategoryDto> {
  const { data } = await api.post<ServiceCategoryDto>(
    '/service-categories',
    input
  )
  return data
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<ServiceCategoryDto> {
  const { data } = await api.patch<ServiceCategoryDto>(
    `/service-categories/${id}`,
    input
  )
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/service-categories/${id}`)
}

// --- Items ---
export async function listItems(): Promise<ServiceItemDto[]> {
  const { data } = await api.get<InfinityPaginated<ServiceItemDto>>(
    '/service-items',
    { params: { limit: 100 } }
  )
  return data.data
}

export interface ItemInput {
  name: LocalizedString
  priceType: PriceType
  unitPrice: number
  active?: boolean
  category: { id: string }
}

export async function createItem(input: ItemInput): Promise<ServiceItemDto> {
  const { data } = await api.post<ServiceItemDto>('/service-items', input)
  return data
}

export async function updateItem(
  id: string,
  input: Partial<ItemInput>
): Promise<ServiceItemDto> {
  const { data } = await api.patch<ServiceItemDto>(`/service-items/${id}`, input)
  return data
}

export async function deleteItem(id: string): Promise<void> {
  await api.delete(`/service-items/${id}`)
}
