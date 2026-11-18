// 담당 1: 로그인/로그아웃/현재 사용자 API
// 인증 토큰은 백엔드가 HttpOnly 쿠키로 관리하므로 프론트에서는 토큰을 다루지 않는다.
import { ApiRequestError, apiRequest } from '@/lib/api-client'

export type ApiUser = {
  id: string | number
  email: string
  role: 'admin' | 'user'
}

// 백엔드 응답 형식(팀 ApiResponse): { success, message, data: { user: { id, email, role } } }
// role은 대문자(USER / ADMIN)
type ServerUser = {
  id: number
  email: string
  role: string
}

type ServerUserResponse = { success: boolean; message: string | null; data: { user: ServerUser } }

// 백엔드 role(대문자)을 팀 프론트 형식(소문자)으로 변환
function toApiUser(user: ServerUser): ApiUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role.toUpperCase() === 'ADMIN' ? 'admin' : 'user',
  }
}

// 현재 로그인 사용자 조회 (새로고침 시 로그인 상태 복구). 로그인 안 됐으면 user: null
export async function getCurrentUser(): Promise<{ user: ApiUser | null }> {
  try {
    const { data } = await apiRequest<ServerUserResponse>('/api/auth/me')
    return { user: toApiUser(data.user) }
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { user: null }
    }
    throw error
  }
}

// 로그인: 성공 시 백엔드가 토큰을 쿠키로 내려주고, 사용자 정보만 반환
export async function logIn(email: string, password: string): Promise<{ user: ApiUser }> {
  const { data } = await apiRequest<ServerUserResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return { user: toApiUser(data.user) }
}

// 로그아웃: 백엔드가 Refresh Token 삭제 + 쿠키 만료
export async function logOut(): Promise<void> {
  await apiRequest<void>('/api/auth/logout', { method: 'POST' })
}