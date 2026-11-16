import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackendErrorState } from '@/components/common/backend-error-state'
import { getProductById } from '@/features/products/api'
import { ProductDetailView } from '@/features/products/product-detail-view'
import { ApiRequestError } from '@/lib/api-client'
import type { StoreProduct } from '@/lib/store-shared'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let product: StoreProduct | null = null
  let backendError: string | null = null

  try {
    product = await getProductById(slug)
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      notFound()
    }
    backendError = err instanceof Error ? err.message : '알 수 없는 네트워크/서버 오류'
  }

  if (backendError) {
    return (
      <section className="mx-auto w-[min(80%,1440px)] py-16 max-lg:w-[92%]">
        <BackendErrorState
          message={backendError}
          title="상품 정보를 백엔드/DB에서 불러오지 못했습니다"
        />
        <div className="mt-6 text-center">
          <Link
            className="text-xs font-semibold tracking-wider text-zinc-500 underline underline-offset-4 hover:text-zinc-950"
            href="/products"
          >
            전체 상품 목록으로 돌아가기
          </Link>
        </div>
      </section>
    )
  }

  if (!product) notFound()

  return (
    <section className="mx-auto w-[min(80%,1440px)] py-10 max-lg:w-[92%]">
      <ProductDetailView product={product} />
    </section>
  )
}
