'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { StoreMedia, StoreProduct } from '@/lib/store-shared'

interface FeatureHighlight {
  badge: string
  title: string
  detail: string
}

function getCategoryStory(product: StoreProduct): {
  eyebrow: string
  headline: string
  highlights: FeatureHighlight[]
  packageContents: string[]
} {
  const sub = product.subCategoryName || ''
  const mat = product.material || sub || '프리미엄 소재'

  if (product.category === 'housing') {
    return {
      eyebrow: 'HOUSING ARCHITECTURE',
      headline: `${mat} 바디가 완성하는 단단한 타건감과 데스크 위 존재감.`,
      highlights: [
        {
          badge: '01 · MATERIAL',
          title: `${mat} 정밀 가공 바디`,
          detail: sub.includes('알루미늄')
            ? '고강도 알루미늄 블록을 CNC 절삭 후 아노다이징 마감하여 통울림을 억제하고 묵직한 타건음을 구현합니다.'
            : sub.includes('목재')
              ? '천연 원목 고유의 나뭇결과 따뜻하고 깊은 울림을 그대로 살린 오가닉 데스크테리어 하우징입니다.'
              : `${mat} 소재 특유의 경쾌한 반발력과 깔끔한 사운드 프로파일을 균형 있게 조율했습니다.`,
        },
        {
          badge: '02 · LAYOUT FIT',
          title: `${product.layout ? `${product.layout}% 배열` : '표준 배열'} 전용 설계`,
          detail: `동일한 ${product.layout ? `${product.layout}%` : '표준'} 규격의 PCB 기판과 1:1로 체결되도록 나사 홀 및 USB 포트 위치를 정밀하게 설계했습니다.`,
        },
        {
          badge: '03 · ACOUSTICS',
          title: '안정적인 마운트 & 흡음 구조',
          detail: '타이핑 시 손끝에 전달되는 불필요한 진동을 줄이고 스위치 본연의 소리를 선명하게 끌어올립니다.',
        },
      ],
      packageContents: [
        `${product.name} 상·하판 바디`,
        '전용 보강판 및 흡음 폼 세트',
        '실리콘 범폰 및 조립용 정밀 볼트 일체',
      ],
    }
  }

  if (product.category === 'pcb') {
    const isWireless = Boolean(product.isWireless) || sub.includes('무선')
    const isSolder = product.categoryId === 'pcb-solder' || sub.includes('솔더링')
    const isBarebone = Boolean(product.categoryId?.startsWith('kb-'))

    return {
      eyebrow: isBarebone ? 'BAREBONE KIT' : 'PCB ENGINEERING',
      headline: isBarebone
        ? '하우징과 기판이 조립된 베어본 키트로 빠르고 완벽한 커스텀 빌드를 경험하세요.'
        : '정확한 입력과 폭넓은 커스터마이징을 뒷받침하는 핵심 기판.',
      highlights: [
        {
          badge: '01 · CONNECTIVITY',
          title: isWireless ? '트라이모드 유·무선 지원' : '초저지연 유선 USB-C 연결',
          detail: isWireless
            ? 'USB-C 유선, 블루투스 멀티페어링, 2.4GHz 전용 리시버를 자유롭게 오가며 멀티 디바이스 환경을 구축할 수 있습니다.'
            : '안정적인 폴링레이트와 끊김 없는 신호 전달을 보장하는 표준 USB Type-C 인터페이스를 지원합니다.',
        },
        {
          badge: '02 · SOCKET',
          title: isSolder ? '클래식 솔더링 마니아 규격' : '납땜 없는 핫스왑 소켓',
          detail: isSolder
            ? '원하는 위치에 스위치를 직접 납땜하여 유격 없는 완벽한 일체감과 다양한 스플릿 배열 커스텀이 가능합니다.'
            : '카일/게이트론 정품 핫스왑 소켓이 사전 실장되어 납땜 없이 스위치를 손쉽게 꽂고 교체할 수 있습니다.',
        },
        {
          badge: '03 · COMPATIBILITY',
          title: `${product.supportPins?.join('/') || '3/5'}핀 스위치 호환 & QMK/VIA`,
          detail: `3핀·5핀 체리식 기계식 스위치를 폭넓게 지원하며, ${product.layout ? `${product.layout}% 배열` : '표준'} 하우징과 완벽히 호환됩니다.`,
        },
      ],
      packageContents: isBarebone
        ? [
            `${product.name} 베어본 본체 (하우징 + PCB + 보강판)`,
            '스테빌라이저 기본 장착',
            'USB-C 파라코드 케이블 및 스위치/키캡 풀러',
          ]
        : [
            `${product.name} 기판 본체 (사전 검수 완료)`,
            '정전기 방지 실드 패키지',
            '초기 불량 테스트 체크리스트',
          ],
    }
  }

  if (product.category === 'switches') {
    const type = product.switchType || sub || '기계식'
    return {
      eyebrow: 'SWITCH DYNAMICS',
      headline: `매 타이핑마다 손끝에 전해지는 ${sub || type} 특유의 선명한 타건감.`,
      highlights: [
        {
          badge: '01 · FEEL & SOUND',
          title: `${sub || type} 스위치 특성`,
          detail:
            type === 'linear' || sub.includes('리니어')
              ? '걸림 없이 바닥까지 매끄럽게 눌리는 직선적인 키감으로 빠른 게이밍과 장시간 타이핑 모두에 적합합니다.'
              : type === 'tactile' || sub.includes('택타일')
                ? '누르는 순간 또렷하게 걸리는 구분감과 경쾌한 반발력으로 타이핑의 즐거움을 극대화합니다.'
                : type === 'silent' || sub.includes('저소음')
                  ? '내부 댐퍼 구조가 바닥 치는 소음과 복귀음을 흡수하여 사무실·도서관 등 정숙한 환경에 최적화되었습니다.'
                  : '명쾌한 클릭 바/재킷 구조로 타자기 같은 경쾌한 클릭음과 명확한 입력 피드백을 전달합니다.',
        },
        {
          badge: '02 · PIN SPEC',
          title: `안정적인 ${product.pin || 5}핀(PCB 마운트) 구조`,
          detail: '기판 위에서 스위치가 흔들리지 않도록 좌우 고정 다리가 결합되어 균일하고 정갈한 타건감을 유지합니다.',
        },
        {
          badge: '03 · PACKAGE',
          title: '90개입 넉넉한 풀 구성',
          detail: '65%, 75%, 텐키리스(87키) 키보드 1대를 여유롭게 채우고 스페어 스위치까지 확보할 수 있는 90개입 패키지입니다.',
        },
      ],
      packageContents: [
        `${product.name} (90개입 1세트)`,
        '핀 휨 방지 전용 보관 컨테이너',
        '체리식(+) 십자 스템 호환',
      ],
    }
  }

  // keycaps
  return {
    eyebrow: 'KEYCAP CRAFTSMANSHIP',
    headline: `${mat} 소재의 질감과 풀배열 호환성을 갖춘 데스크의 마지막 퍼즐.`,
    highlights: [
      {
        badge: '01 · TEXTURE',
        title: `${mat} 프리미엄 소재`,
        detail: sub.includes('PBT')
          ? '두꺼운 PBT 원사를 사용해 장기간 사용해도 번들거림이 적고, 뽀송하고 정갈한 로우피치 타건음을 들려줍니다.'
          : sub.includes('ABS')
            ? '선명하고 깊이 있는 발색과 경계면이 또렷한 이중사출 각인이 돋보이며, 경쾌하고 맑은 하이피치 사운드를 냅니다.'
            : '매끄러운 자기윤활성 POM 소재 특유의 조약돌 부딪히는 듯한 묵직한 타건음과 은은한 빛 투과력을 자랑합니다.',
      },
      {
        badge: '02 · UNIVERSAL FIT',
        title: '풀배열 공용 호환 키트',
        detail: '104키 풀배열부터 87키 텐키리스, 75%, 65% 배열까지 모두 장착할 수 있도록 다양한 길이의 쉬프트·모디파이어 키가 포함되어 있습니다.',
      },
      {
        badge: '03 · STEM',
        title: '체리식(+) 스위치 100% 호환',
        detail: '표준 십자(+) 모양 스템을 채택한 체리, 게이트론, 카일, HMX 등 대부분의 기계식 스위치에 안정적으로 결합됩니다.',
      },
    ],
    packageContents: [
      `${product.name} 풀배열 공용 키캡 세트`,
      '각인 보호 전용 트레이 포장',
      '와이어 키캡 리무버 1개 증정',
    ],
  }
}

export function ProductDetailStory({
  product,
  galleryImages,
}: {
  product: StoreProduct
  galleryImages: Array<{ id: string | number; url: string; alt: string }>
}) {
  const story = getCategoryStory(product)
  const extraImages = galleryImages.length > 1 ? galleryImages.slice(1) : galleryImages

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="mt-24 border-t border-zinc-200 pt-10">
      {/* 섹션 앵커 네비게이션 */}
      <nav
        aria-label="상품 상세 정보 목차"
        className="sticky top-[72px] z-20 -mx-2 mb-14 flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white/90 px-2 py-3 backdrop-blur-md md:top-[84px]"
      >
        {[
          { id: 'detail-story', label: '01. 제품 스토리' },
          { id: 'detail-gallery', label: '02. 디테일 룩북' },
          { id: 'detail-specs', label: '03. 스펙 & 호환성' },
          { id: 'detail-shipping', label: '04. 배송 및 교환 안내' },
        ].map((tab) => (
          <button
            className="rounded-full px-4 py-2 text-xs font-semibold tracking-wider text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 01. 제품 스토리 & 카테고리 핵심 특징 */}
      <section className="scroll-mt-36 space-y-10" id="detail-story">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-zinc-400">{story.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-zinc-950 max-md:text-2xl">
            {story.headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">{product.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
          {story.highlights.map((item) => (
            <div
              className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-7 transition hover:border-zinc-300 hover:bg-white"
              key={item.badge}
            >
              <span className="text-[11px] font-bold tracking-[0.18em] text-zinc-400">
                {item.badge}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-zinc-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 02. 디테일 갤러리 룩북 */}
      {extraImages.length > 0 && (
        <section className="mt-24 scroll-mt-36 space-y-6" id="detail-gallery">
          <div className="flex items-end justify-between border-b border-zinc-200 pb-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">DETAIL GALLERY</p>
              <h2 className="mt-1.5 text-2xl font-medium tracking-[-0.03em]">
                클로즈업 디테일 컷
              </h2>
            </div>
            <span className="text-xs text-zinc-400">{extraImages.length} Cut View</span>
          </div>

          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            {extraImages.map((img, idx) => (
              <div
                className={`relative overflow-hidden rounded-2xl bg-zinc-100 ${
                  idx === 0 && extraImages.length === 3 ? 'col-span-2 aspect-[16/9] max-md:col-span-1 max-md:aspect-[4/3]' : 'aspect-[4/3]'
                }`}
                key={img.id || idx}
              >
                <Image
                  alt={img.alt || `${product.name} 상세 이미지 ${idx + 1}`}
                  className="object-cover transition duration-700 hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 768px) 92vw, 45vw"
                  src={img.url}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 03. 상세 스펙 & 구성품 & 호환성 가이드 */}
      <section className="mt-24 scroll-mt-36" id="detail-specs">
        <div className="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
          <div className="rounded-2xl border border-zinc-200 p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">IN THE BOX</p>
            <h3 className="mt-2 text-xl font-medium tracking-[-0.03em]">기본 패키지 구성품</h3>
            <ul className="mt-6 space-y-3 text-sm text-zinc-700">
              {story.packageContents.map((content) => (
                <li className="flex items-center gap-3" key={content}>
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-bold text-white">
                    ✓
                  </span>
                  <span>{content}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-950 p-8 text-white">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">
                CUSTOM BUILDER GUIDE
              </p>
              <h3 className="mt-2 text-xl font-medium tracking-[-0.03em]">
                다른 부품과의 호환성이 고민되시나요?
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                MONO / STUDIO 커스텀 빌더를 이용하시면 하우징 배열, PCB 핀 규격, 스위치 호환성을
                자동으로 검증하여 실패 없는 나만의 키보드를 조합할 수 있습니다.
              </p>
            </div>
            <div className="mt-6">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold tracking-wider text-zinc-950 transition hover:bg-zinc-200"
                href="/custom"
              >
                커스텀 키보드 빌더로 호환성 확인하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 04. 배송 및 교환/반품 안내 */}
      <section className="mt-24 scroll-mt-36" id="detail-shipping">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">
            DELIVERY &amp; POLICY
          </p>
          <h3 className="mt-2 text-xl font-medium tracking-[-0.03em]">배송 및 교환/반품 안내</h3>
          <div className="mt-6 grid grid-cols-3 gap-6 text-sm leading-6 text-zinc-600 max-lg:grid-cols-1">
            <div>
              <p className="font-semibold text-zinc-900">배송 안내</p>
              <p className="mt-1.5">
                평일 오후 2시 이전 결제 완료 건은 당일 출고되며, 영업일 기준 평균 1~2일 이내
                수령하실 수 있습니다. (전 품목 안전 에어캡 완충 포장 발송)
              </p>
            </div>
            <div>
              <p className="font-semibold text-zinc-900">교환 및 반품</p>
              <p className="mt-1.5">
                단순 변심에 의한 교환/반품은 상품 수령 후 7일 이내 미개봉 상태에 한해 가능합니다.
                납땜(솔더링)이나 조립 흔적이 있는 경우 반품이 제한됩니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-zinc-900">품질 보증 및 A/S</p>
              <p className="mt-1.5">
                초기 불량(기판 인식 불량, 부품 파손 등) 확인 시 무상 1:1 교환을 지원합니다.
                택배 이동 중 스위치 다리가 미세하게 휘어진 경우 핀셋으로 펴서 정상 사용 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 리뷰 오픈 예정 안내 (팀원 연동 후 오픈) */}
      <section className="mt-16 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/40 px-8 py-10 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">CUSTOMER REVIEWS</p>
        <h3 className="mt-2 text-lg font-medium text-zinc-800">실구매자 리뷰</h3>
        <p className="mt-1.5 text-sm text-zinc-500">
          회원 및 주문 내역 시스템 통합 연동 완료 후 실제 구매 인증 리뷰 작성 및 조회가 지원될
          예정입니다.
        </p>
      </section>
    </div>
  )
}
