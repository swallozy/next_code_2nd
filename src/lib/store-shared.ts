export type StoreMedia = {
  id: string | number
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

export type StoreProduct = {
  id: string | number
  name: string
  slug: string
  basePrice: number
  category: 'pcb' | 'switches' | 'keycaps' | 'housing'
  description: string
  stockQuantity: number
  shippingFee: number
  brand: string
  kcCertificationNumber?: string | null
  options?: Array<{
    id?: string | null
    label: string
    value: string
    priceAdjustment: number
  }> | null
  images: Array<string | number | StoreMedia>
  // 키보드 부품 상세 스펙 (nextcode 호환 속성)
  layout?: string
  supportPins?: number[]
  isWireless?: boolean
  pin?: number
  switchType?: string
  soundType?: string
  material?: string
  style?: string
  isSoldOut?: boolean
  status?: 'ACTIVE' | 'SOLD_OUT'
  subCategoryName?: string
  categoryId?: string
  parentCategoryId?: string
  galleryImages?: string[]
}

export function isProductSoldOut(product: {
  isSoldOut?: boolean
  soldOut?: boolean
  stockQuantity: number
  status?: string
}): boolean {
  return (
    Boolean(product.isSoldOut || product.soldOut) ||
    product.stockQuantity <= 0 ||
    product.status === 'SOLD_OUT'
  )
}

export function mediaFrom(value: StoreProduct['images'][number]): StoreMedia | null {
  return typeof value === 'object' ? value : null
}

// 카테고리 ID를 우선 사용하고, 기존 API 응답의 이름도 지원합니다.
export function resolveProductCategory(
  categoryId: string | undefined,
  categoryName: string,
): StoreProduct['category'] {
  const categories: Record<string, StoreProduct['category']> = {
    housing: 'housing',
    pcb: 'pcb',
    keyboards: 'pcb',
    switches: 'switches',
    keycaps: 'keycaps',
    하우징: 'housing',
    기판: 'pcb',
    '기판 (PCB)': 'pcb',
    스위치: 'switches',
    키캡: 'keycaps',
  }
  const category = Object.hasOwn(categories, categoryId ?? '')
    ? categories[categoryId!]
    : Object.hasOwn(categories, categoryName)
      ? categories[categoryName]
      : undefined
  if (!category) throw new Error('알 수 없는 상품 카테고리입니다.')
  return category
}

export function formatPrice(value: number) {
  return `${new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value)}원`
}

export const productCategoryLabels: Record<StoreProduct['category'], string> = {
  pcb: 'PCB',
  switches: 'SWITCHES',
  keycaps: 'KEYCAPS',
  housing: 'HOUSING',
}
