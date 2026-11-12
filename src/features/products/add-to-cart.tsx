'use client'

import { useState } from 'react'
import { MinusIcon, PlusIcon } from '@/components/icons'
import { useCart } from '@/features/cart/cart-provider'
import { formatPrice, type StoreProduct } from '@/lib/store-shared'

export function AddToCart({ product, image }: { product: StoreProduct; image?: string }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const option = product.options?.[0]
  const optionValue = option?.value ?? ''
  const unitPrice = product.basePrice + (option?.priceAdjustment ?? 0)

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex h-14 items-center rounded-md border border-zinc-200">
          <button
            aria-label="Decrease quantity"
            className="h-full px-3"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            type="button"
          >
            <MinusIcon />
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            aria-label="Increase quantity"
            className="h-full px-3"
            onClick={() => setQuantity((value) => Math.min(product.stockQuantity, value + 1))}
            type="button"
          >
            <PlusIcon />
          </button>
        </div>
        <button
          className="h-14 flex-1 rounded-md bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.99]"
          onClick={() =>
            addItem({
              productId: String(product.id),
              slug: product.slug,
              name: product.name,
              image,
              optionValue,
              optionLabel: option?.label,
              unitPrice,
              shippingFee: product.shippingFee,
              quantity,
            })
          }
          type="button"
        >
          ADD TO CART — {formatPrice(unitPrice * quantity)}
        </button>
      </div>
    </div>
  )
}
