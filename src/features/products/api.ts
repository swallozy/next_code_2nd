import { apiRequest } from '@/lib/api-client'
import type { StoreProduct } from '@/lib/store-shared'
import type { Category, GetProductsParams, ProductListResponse } from './types'

/**
 * 카테고리 목록 조회 (Spring Boot /api/categories 직접 호출)
 */
export async function getCategories(): Promise<Category[]> {
  return await apiRequest<Category[]>('/api/categories')
}

/**
 * 페이징 및 소분류 필터링을 지원하는 상품 목록 조회
 */
export async function getPaginatedProducts(
  params: GetProductsParams = {},
): Promise<ProductListResponse> {
  const search = new URLSearchParams()
  if (params.categoryId && params.categoryId !== 'all') search.set('category', params.categoryId)
  if (params.subcategoryId) search.set('subcategory', params.subcategoryId)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.size !== undefined) search.set('size', String(params.size))

  const queryString = search.toString() ? `?${search.toString()}` : ''
  return await apiRequest<ProductListResponse>(`/api/products${queryString}`)
}

/**
 * 상품 목록 조회 (백엔드 API 직접 호출, 목업 fallback 없음)
 */
export async function getProducts(
  categoryOrParams?: StoreProduct['category'] | GetProductsParams,
): Promise<StoreProduct[]> {
  if (typeof categoryOrParams === 'object' && categoryOrParams !== null) {
    const res = await getPaginatedProducts(categoryOrParams)
    return res.content
  }

  const category = categoryOrParams as StoreProduct['category'] | undefined
  const query = category ? `?category=${category}` : ''
  const result = await apiRequest<StoreProduct[] | ProductListResponse>(`/api/products${query}`)
  if (Array.isArray(result)) return result
  if (result && Array.isArray(result.content)) return result.content
  throw new Error('백엔드 상품 목록 응답 형식이 올바르지 않습니다.')
}

/**
 * 상품 단건 상세 조회 (productId 또는 slug 기준)
 */
export async function getProductById(productId: string | number): Promise<StoreProduct> {
  const idStr = String(productId)
  return await apiRequest<StoreProduct>(`/api/products/${encodeURIComponent(idStr)}`)
}

/**
 * nextcode 호환용 별칭
 */
export const getProductDetail = getProductById
