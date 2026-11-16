'use client'

import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/lib/api-client'

interface BackendErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function BackendErrorState({
  title = '백엔드 / DB 서버에 연결할 수 없습니다',
  message,
  onRetry,
}: BackendErrorStateProps) {
  const router = useRouter()

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
      return
    }
    router.refresh()
  }

  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50/70 px-6 py-12 text-center text-zinc-900"
      role="alert"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-600" />
        BACKEND DISCONNECTED
      </span>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-zinc-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
        현재 프론트엔드는 목업 데이터를 사용하지 않으며 실제 Spring Boot API(
        <code className="rounded bg-white px-1.5 py-0.5 text-xs text-zinc-800">{API_BASE_URL}</code>
        ) 및 MySQL DB 응답을 직접 표시합니다. 백엔드 서버 실행 상태와 DB 연결을 확인해 주세요.
      </p>
      {message && (
        <p className="mx-auto mt-3 max-w-xl rounded-lg border border-red-200 bg-white px-4 py-2 font-mono text-xs text-red-700">
          오류 상세: {message}
        </p>
      )}
      <div className="mt-6">
        <button
          className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-semibold tracking-wider text-white transition hover:bg-zinc-800"
          onClick={handleRetry}
          type="button"
        >
          다시 연결 시도
        </button>
      </div>
    </div>
  )
}
