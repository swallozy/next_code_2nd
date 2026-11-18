'use client'

import { useState } from 'react'

export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    // 일반 img를 사용해 백엔드 이미지 도메인을 next.config에 추가하지 않아도 표시합니다.
    <img
      alt={alt}
      className={className}
      src={!src || failed ? '/product-placeholder.svg' : src}
      onError={() => setFailed(true)}
    />
  )
}
