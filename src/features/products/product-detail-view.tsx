'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CloseIcon, MinusIcon, PlusIcon } from '@/components/icons'
import { useCart } from '@/features/cart/cart-provider'
import { ProductDetailStory } from '@/features/products/product-detail-story'
import { formatPrice, mediaFrom, type StoreProduct } from '@/lib/store-shared'

interface ProductDetailViewProps {
  product: StoreProduct
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart()

  // 갤러리 이미지 세트 (images 우선, 비어 있을 경우 galleryImages fallback)
  const rawImages = product.images.length
    ? product.images.map(mediaFrom).filter((image) => Boolean(image?.url))
    : (product.galleryImages || []).map((url, index) => ({
        id: index + 1,
        url,
        alt: product.name,
      }))

  const images = rawImages.map((image, index) => ({
    id: image?.id ?? index + 1,
    url: image!.url as string,
    alt: image?.alt || `${product.name} 이미지 ${index + 1}`,
  }))

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const safeImageIndex = images.length > 0 ? selectedImageIndex % images.length : 0
  const currentImage = images[safeImageIndex]

  const handlePrevImage = () => {
    if (images.length <= 1) return
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNextImage = () => {
    if (images.length <= 1) return
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  // 단일 상품 가격
  const unitPrice = product.basePrice

  // 수량
  const [quantity, setQuantity] = useState(1)

  // 품절 및 판매중지 상태
  const isDiscontinued = product.status === 'DISCONTINUED'
  const isSoldOut =
    Boolean(product.isSoldOut) || product.stockQuantity <= 0 || product.status === 'SOLD_OUT'
  const isUnavailable = isDiscontinued || isSoldOut

  // 수량 조절
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncreaseQuantity = () => {
    if (quantity >= product.stockQuantity) {
      alert(`최대 주문 가능 수량은 ${product.stockQuantity}개입니다.`)
      return
    }
    setQuantity((prev) => prev + 1)
  }

  // 장바구니 담기
  const handleAddToCart = () => {
    if (isUnavailable) {
      alert(
        isDiscontinued ? '판매가 중단된 상품입니다.' : '현재 품절되어 장바구니에 담을 수 없습니다.',
      )
      return
    }

    addItem({
      productId: String(product.id),
      slug: product.slug,
      name: product.name,
      image: currentImage?.url ?? undefined,
      unitPrice,
      shippingFee: product.shippingFee,
      quantity,
    })
  }

  return (
    <>
      <div className="grid grid-cols-[1.25fr_.75fr] gap-16 max-lg:grid-cols-1">
        {/* 좌측: 메인 이미지 & 갤러리 썸네일 */}
        <div>
          <div className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
            {currentImage?.url ? (
              <button
                aria-label="이미지 크게 보기"
                className="relative h-full w-full cursor-zoom-in text-left"
                onClick={() => setZoomOpen(true)}
                type="button"
              >
                <Image
                  alt={currentImage.alt || product.name}
                  className={`object-cover transition-all duration-300 group-hover:scale-[1.02] ${
                    isUnavailable ? 'opacity-60' : ''
                  }`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 50vw"
                  src={currentImage.url}
                />
              </button>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-xs tracking-[0.16em] text-zinc-400">
                IMAGE PENDING
              </div>
            )}

            {/* 좌우 이미지 전환 버튼 */}
            {images.length > 1 && (
              <>
                <button
                  aria-label="이전 이미지"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg font-medium text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevImage()
                  }}
                  type="button"
                >
                  ‹
                </button>
                <button
                  aria-label="다음 이미지"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg font-medium text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNextImage()
                  }}
                  type="button"
                >
                  ›
                </button>
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-zinc-950/75 px-2.5 py-1 text-[11px] font-medium tracking-wider text-white backdrop-blur">
                  {safeImageIndex + 1} / {images.length}
                </span>
              </>
            )}

            {currentImage?.url && (
              <button
                className="absolute bottom-3 right-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white"
                onClick={() => setZoomOpen(true)}
                type="button"
              >
                확대 보기
              </button>
            )}

            {/* 품절/단종 뱃지 */}
            {isDiscontinued ? (
              <span className="absolute right-4 top-4 rounded bg-zinc-800 px-3 py-1 text-xs font-semibold tracking-wider text-white">
                DISCONTINUED
              </span>
            ) : isSoldOut ? (
              <span className="absolute right-4 top-4 rounded bg-zinc-950 px-3 py-1 text-xs font-semibold tracking-wider text-white">
                SOLD OUT
              </span>
            ) : null}
          </div>

          {/* 썸네일 리스트 */}
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.slice(0, 8).map((image, index) => {
                const isSelected = safeImageIndex === index
                return (
                  <button
                    className={`relative aspect-square overflow-hidden rounded-md bg-zinc-100 transition ${
                      isSelected
                        ? 'ring-2 ring-zinc-950 ring-offset-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    key={image.id || index}
                    onClick={() => setSelectedImageIndex(index)}
                    type="button"
                  >
                    <Image
                      alt={image.alt || product.name}
                      className="object-cover"
                      fill
                      sizes="15vw"
                      src={image.url}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

      {/* 우측: 상품 정보 및 주문 컨트롤 */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {product.brand} / {product.category.replace('-', ' ')}
          {product.subCategoryName ? ` · ${product.subCategoryName}` : ''}
        </p>
        <h1 className="mt-5 text-5xl font-medium leading-none tracking-[-0.06em]">
          {product.name}
        </h1>

        <div className="mt-6 flex items-baseline gap-3">
          <p className="text-2xl font-medium">{formatPrice(unitPrice)}</p>
        </div>

        <p className="my-8 border-y border-zinc-200 py-6 text-base leading-7 text-zinc-600">
          {product.description}
        </p>

        {/* 수량 및 장바구니 담기 */}
        <div className="flex gap-3">
          <div className="flex h-14 items-center rounded-md border border-zinc-200">
            <button
              aria-label="Decrease quantity"
              className="h-full px-3 text-zinc-600 hover:text-black disabled:opacity-40"
              disabled={isUnavailable}
              onClick={handleDecreaseQuantity}
              type="button"
            >
              <MinusIcon />
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              aria-label="Increase quantity"
              className="h-full px-3 text-zinc-600 hover:text-black disabled:opacity-40"
              disabled={isUnavailable}
              onClick={handleIncreaseQuantity}
              type="button"
            >
              <PlusIcon />
            </button>
          </div>

          <button
            className={`h-14 flex-1 rounded-md px-6 text-sm font-semibold tracking-wide transition ${
              isUnavailable
                ? 'cursor-not-allowed bg-zinc-200 text-zinc-400'
                : 'bg-zinc-950 text-white hover:bg-zinc-800 active:scale-[0.99]'
            }`}
            disabled={isUnavailable}
            onClick={handleAddToCart}
            type="button"
          >
            {isDiscontinued
              ? 'DISCONTINUED'
              : isSoldOut
                ? 'SOLD OUT'
                : `ADD TO CART — ${formatPrice(unitPrice * quantity)}`}
          </button>
        </div>

        {/* 제품 사양 및 상세 정보 */}
        <dl className="mt-10 grid grid-cols-2 gap-y-4 border-t border-zinc-200 pt-7 text-sm">
          <dt className="text-zinc-500">Stock</dt>
          <dd className="text-right font-medium">
            {isUnavailable ? 'Out of stock' : `${product.stockQuantity} available`}
          </dd>

          <dt className="text-zinc-500">Shipping</dt>
          <dd className="text-right">
            {product.shippingFee ? formatPrice(product.shippingFee) : 'Complimentary'}
          </dd>

          {product.category === 'keycaps' ? (
            <>
              <dt className="text-zinc-500">Layout</dt>
              <dd className="text-right font-medium">풀배열 공용 (모든 배열 호환)</dd>
            </>
          ) : product.layout ? (
            <>
              <dt className="text-zinc-500">Layout</dt>
              <dd className="text-right font-medium">{product.layout}%</dd>
            </>
          ) : null}

          {product.pin && (
            <>
              <dt className="text-zinc-500">Pin spec</dt>
              <dd className="text-right font-medium">{product.pin} Pin</dd>
            </>
          )}

          {product.supportPins && product.supportPins.length > 0 && (
            <>
              <dt className="text-zinc-500">Supported Pins</dt>
              <dd className="text-right font-medium">{product.supportPins.join(', ')} Pin</dd>
            </>
          )}

          {product.switchType && (
            <>
              <dt className="text-zinc-500">Switch Type</dt>
              <dd className="text-right font-medium uppercase">{product.switchType}</dd>
            </>
          )}

          {product.material && (
            <>
              <dt className="text-zinc-500">Material</dt>
              <dd className="text-right font-medium">{product.material}</dd>
            </>
          )}

          <dt className="text-zinc-500">KC certification</dt>
          <dd className="text-right">{product.kcCertificationNumber || 'Not applicable'}</dd>
        </dl>
      </div>
    </div>

      {/* 하단 스크롤 상세 콘텐츠 */}
      <ProductDetailStory galleryImages={images} product={product} />

      {/* 이미지 확대 라이트박스 모달 */}
      {zoomOpen && currentImage?.url && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 p-6 backdrop-blur-sm"
          onClick={() => setZoomOpen(false)}
          role="dialog"
        >
          <button
            aria-label="확대 창 닫기"
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setZoomOpen(false)}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <div
            className="relative flex max-h-[85vh] w-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square w-full max-w-[680px] overflow-hidden rounded-2xl bg-zinc-900">
              <Image
                alt={currentImage.alt || product.name}
                className="object-contain"
                fill
                sizes="90vw"
                src={currentImage.url}
              />

              {images.length > 1 && (
                <>
                  <button
                    aria-label="이전 이미지"
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl font-medium text-zinc-900 shadow transition hover:bg-white"
                    onClick={handlePrevImage}
                    type="button"
                  >
                    ‹
                  </button>
                  <button
                    aria-label="다음 이미지"
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl font-medium text-zinc-900 shadow transition hover:bg-white"
                    onClick={handleNextImage}
                    type="button"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-zinc-300">
              <span className="font-medium text-white">{product.name}</span>
              {images.length > 1 && (
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {safeImageIndex + 1} / {images.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
