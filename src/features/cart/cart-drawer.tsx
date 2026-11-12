'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BagIcon, CloseIcon, MinusIcon, PlusIcon } from '@/components/icons'
import { formatPrice } from '@/lib/store-shared'
import type { CartItem } from '@/features/cart/types'

const cartItemKey = (item: CartItem) => `${item.productId}::${item.optionValue ?? ''}`

type CartDrawerProps = {
  open: boolean
  items: CartItem[]
  selectedItems: CartItem[]
  selectedKeys: string[]
  onClose: () => void
  onSelectAll: (selected: boolean) => void
  onToggleSelected: (item: CartItem) => void
  onUpdateQuantity: (index: number, quantity: number) => void
}

export function CartDrawer({
  open,
  items,
  selectedItems,
  selectedKeys,
  onClose,
  onSelectAll,
  onToggleSelected,
  onUpdateQuantity,
}: CartDrawerProps) {
  const subtotal = selectedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <button
        aria-label="장바구니 닫기"
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        type="button"
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white p-7 shadow-2xl transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <h2 className="text-2xl font-medium tracking-[-0.04em]">Your cart</h2>
          <button
            aria-label="장바구니 닫기"
            className="rounded-full border border-zinc-200 p-2 transition hover:bg-zinc-100"
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <BagIcon className="mb-5 size-10 text-zinc-300" />
              <p className="font-medium">Your cart is empty.</p>
              <p className="mt-2 text-sm text-zinc-500">A better desk starts with one good key.</p>
            </div>
          ) : (
            <>
              <label className="mb-2 flex cursor-pointer items-center gap-3 border-b border-zinc-200 pb-4 text-sm">
                <input
                  checked={selectedItems.length === items.length}
                  className="size-4 accent-zinc-950"
                  onChange={(event) => onSelectAll(event.target.checked)}
                  type="checkbox"
                />
                전체 선택 ({selectedItems.length}/{items.length})
              </label>
              {items.map((item, index) => (
                <div
                  className="flex items-center gap-3 border-b border-zinc-100 py-5"
                  key={`${item.productId}-${item.optionValue}-${index}`}
                >
                  <input
                    aria-label={`${item.name} 선택`}
                    checked={selectedKeys.includes(cartItemKey(item))}
                    className="size-4 shrink-0 accent-zinc-950"
                    onChange={() => onToggleSelected(item)}
                    type="checkbox"
                  />
                  <div className="size-20 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                    {item.image && (
                      <Image
                        alt=""
                        className="size-full object-cover grayscale"
                        height={80}
                        src={item.image}
                        width={80}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    {item.optionLabel && (
                      <p className="mt-1 text-xs text-zinc-500">{item.optionLabel}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-zinc-200">
                        <button
                          aria-label="수량 줄이기"
                          className="p-1.5"
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          type="button"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-7 text-center text-xs">{item.quantity}</span>
                        <button
                          aria-label="수량 늘리기"
                          className="p-1.5"
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          type="button"
                        >
                          <PlusIcon />
                        </button>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="border-t border-zinc-200 pt-5">
          <div className="mb-5 flex justify-between text-lg">
            <span>선택 상품 합계</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <Link
            className="flex h-14 items-center justify-center rounded-md bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800"
            href="/checkout"
            onClick={onClose}
          >
            CHECKOUT
          </Link>
        </div>
      </aside>
    </div>
  )
}
