import type { StoreProduct } from '@/lib/store-shared'

/** Presentation-only fixtures used when the Spring API is offline in development. */
export const demoProducts: StoreProduct[] = [
  {
    id: 'demo-slate-65',
    name: 'Slate 65',
    slug: 'slate-65',
    basePrice: 189,
    category: 'pcb',
    description: 'A compact aluminum keyboard with a quiet, balanced sound profile.',
    stockQuantity: 42,
    shippingFee: 0,
    brand: 'MONO',
    kcCertificationNumber: 'R-R-MKY-S65',
    options: [
      {
        id: 'slate-charcoal',
        label: 'Charcoal / Linear',
        value: 'charcoal-linear',
        priceAdjustment: 0,
      },
      { id: 'slate-bone', label: 'Bone / Tactile', value: 'bone-tactile', priceAdjustment: 12 },
    ],
    images: [
      {
        id: 'slate-image',
        url: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=84&w=1800',
        alt: 'Slate 65 mechanical keyboard',
      },
    ],
  },
  {
    id: 'demo-arc-tkl',
    name: 'Arc TKL',
    slug: 'arc-tkl',
    basePrice: 229,
    category: 'pcb',
    description:
      'A tenkeyless workhorse shaped for long days, with CNC aluminum and hot-swap sockets.',
    stockQuantity: 18,
    shippingFee: 12,
    brand: 'MONO',
    kcCertificationNumber: 'R-R-MKY-ATK',
    options: [
      {
        id: 'arc-graphite',
        label: 'Graphite / Linear',
        value: 'graphite-linear',
        priceAdjustment: 0,
      },
      { id: 'arc-silver', label: 'Silver / Silent', value: 'silver-silent', priceAdjustment: 18 },
    ],
    images: [
      {
        id: 'arc-image',
        url: 'https://images.unsplash.com/photo-1697022976768-2fd7f4e4c399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=84&w=1800',
        alt: 'Arc tenkeyless keyboard',
      },
    ],
  },
  {
    id: 'demo-ivory-air',
    name: 'Ivory Air',
    slug: 'ivory-air',
    basePrice: 149,
    category: 'pcb',
    description: 'Low-profile wireless typing with a crisp, understated feel.',
    stockQuantity: 31,
    shippingFee: 0,
    brand: 'FORM',
    kcCertificationNumber: 'R-R-FRM-IVA',
    options: [
      { id: 'ivory-mac', label: 'Mac layout', value: 'mac', priceAdjustment: 0 },
      { id: 'ivory-windows', label: 'Windows layout', value: 'windows', priceAdjustment: 0 },
    ],
    images: [
      {
        id: 'ivory-image',
        url: 'https://images.unsplash.com/photo-1669884210028-81aa4c7442e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=84&w=1800',
        alt: 'Ivory low profile keyboard',
      },
    ],
  },
]
