import { ApiRequestError, apiRequest } from '@/lib/api-client'

export type CustomerSignupRequest = {
  email: string
  password: string
  name: string
  phone: string
  postalCode: string
  address: string
  detailAddress: string
  termsConsent: { serviceTerms: boolean; privacyPolicy: boolean }
}

type MemberApiResponse<T> = { success?: unknown; message?: unknown; data?: T }

// 팀 백엔드의 공통 응답은 회원 API에서만 풀어 다른 기능의 공용 요청 동작을 유지합니다.
async function memberRequest<T>(path: string, init: RequestInit, status: number): Promise<T | undefined> {
  const result = await apiRequest<MemberApiResponse<T> | null>(path, init, status)
  if (result?.success !== true) {
    const message = typeof result?.message === 'string' && result.message
      ? result.message : '서버 응답을 확인하지 못했습니다. 다시 시도해 주세요.'
    throw new ApiRequestError(message, status)
  }
  return result.data
}
/** 현재 입력의 이메일 사용 가능 여부를 조회합니다. 가입 시에는 서버와 DB가 중복 여부를 다시 판단합니다. */
export async function checkSignupEmail(email: string, signal: AbortSignal): Promise<boolean> {
  const query = new URLSearchParams({ email })
  const result = await memberRequest<{ available?: unknown } | null>(
    `/api/auth/check-email?${query}`, { signal, cache: 'no-store' }, 200,
  )
  if (typeof result?.available !== 'boolean') {
    throw new Error('중복 확인 결과를 확인하지 못했습니다.')
  }
  return result.available
}

/** 팀 화면의 평면 요청 형식을 전송하며, 계약된 201 응답을 받은 경우에만 가입 완료로 처리합니다. */
export async function signUpCustomer(input: CustomerSignupRequest): Promise<void> {
  await memberRequest('/api/users/signup', { method: 'POST', body: JSON.stringify(input) }, 201)
}

export async function deleteCustomerAccount(): Promise<void> {
  throw new Error('TODO: 회원탈퇴 API를 연결하세요.')
}
