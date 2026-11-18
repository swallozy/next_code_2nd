'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { checkSignupEmail, signUpCustomer } from '@/features/user/api'
import { loadPostcode, postcodeError } from '@/features/user/postcode'
import { ApiRequestError } from '@/lib/api-client'

const inputBaseClass =
  'h-12 w-full rounded-md border border-zinc-300 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5'
const inputClass = 'mt-2 ' + inputBaseClass
const outlineButton =
  'h-12 shrink-0 rounded-md border border-zinc-300 px-4 text-sm font-medium transition hover:border-zinc-950 hover:bg-zinc-50 disabled:opacity-60'
const dialogClass =
  'm-auto w-[min(92%,480px)] rounded-xl border border-zinc-200 bg-white p-6 shadow-xl backdrop:bg-black/50'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^010[0-9]{8}$/

const terms = [
  {
    name: 'serviceTerms',
    label: '서비스 이용약관',
    description: '회원은 정확한 가입 정보를 제공하며 계정을 안전하게 관리합니다.',
  },
  {
    name: 'privacyPolicy',
    label: '개인정보 수집·이용',
    description: '이메일, 이름, 연락처, 배송지는 회원 관리와 주문 배송에 사용됩니다. 비밀번호는 해시로 저장됩니다.',
  },
] as const

type EmailCheck = { email: string; available: boolean; message: string }
type FormError = { message: string; fields?: Record<string, string> }

// 서버와 같은 정책으로 제출 전에 안내합니다. 브라우저 검사는 우회할 수 있으므로 최종 검증은 서버가 다시 수행합니다.
function validPassword(password: string) {
  const length = Array.from(password).length
  return length >= 8 && length <= 20 && /[a-z]/i.test(password) && /[0-9]/.test(password)
    && new TextEncoder().encode(password).length <= 72
}

/** 가입 입력과 사전 확인, 주소 선택, 제출 결과를 관리합니다. HTTP 요청 형식과 오류 해석은 회원 API에 맡깁니다. */
export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [emailCheck, setEmailCheck] = useState<EmailCheck | null>(null)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordConfirmTouched, setPasswordConfirmTouched] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [postalCode, setPostalCode] = useState('')
  const [address, setAddress] = useState('')
  const [detail, setDetail] = useState('')
  const [termsConsent, setTermsConsent] = useState({ serviceTerms: false, privacyPolicy: false })
  const [postcodeMessage, setPostcodeMessage] = useState('')
  const [error, setError] = useState<FormError | null>(null)
  const [pending, setPending] = useState(false)
  const [completed, setCompleted] = useState(false)
  const submitLock = useRef(false)
  const emailRequest = useRef<AbortController | null>(null)
  const postcodeDialog = useRef<HTMLDialogElement>(null)
  const postcodeHost = useRef<HTMLDivElement>(null)
  const postcodeSession = useRef<symbol | null>(null)
  const detailAddress = useRef<HTMLInputElement>(null)
  const successDialog = useRef<HTMLDialogElement>(null)
  const normalizedEmail = email.trim()
  const currentEmailCheck = emailCheck?.email === normalizedEmail ? emailCheck : null
  const available = currentEmailCheck?.available === true
  const emailValid = emailPattern.test(normalizedEmail) && normalizedEmail.length <= 50
  const disabled = pending || completed
  // 재입력 칸에서 벗어나거나 가입을 시도하면 불일치를 표시합니다.
  // 그 뒤에는 두 칸의 현재 값을 비교해 어느 쪽을 수정해도 안내를 갱신합니다.
  const passwordsMatch = password === passwordConfirm
  const showPasswordMismatch = passwordConfirmTouched && !passwordsMatch
  const passwordValid = validPassword(password)
  const phoneValid = phonePattern.test(phone)
  const hasRequiredFields = !!(name.trim() && postalCode.trim() && address.trim() && detail.trim())
  const canSubmit = available && passwordValid && phoneValid
    && hasRequiredFields && termsConsent.serviceTerms && termsConsent.privacyPolicy

  // 형식이 맞는 이메일의 입력이 500ms 동안 멈추면 중복을 확인합니다.
  // 이메일을 바꾸면 이전 결과를 지우고 요청을 취소해 현재 주소의 결과만 사용합니다.
  useEffect(() => {
    const addressToCheck = email.trim()
    if (!emailPattern.test(addressToCheck) || addressToCheck.length > 50) return

    // 이전 이메일의 응답이 나중에 도착해도 현재 입력의 중복 확인 결과를 덮어쓰지 않도록 요청마다 취소 신호를 둡니다.
    const request = new AbortController()
    emailRequest.current = request
    const timer = window.setTimeout(async () => {
      try {
        const available = await checkSignupEmail(addressToCheck, request.signal)
        if (!request.signal.aborted) {
          setEmailCheck({
            email: addressToCheck,
            available,
            message: available ? '사용 가능한 이메일입니다.' : '중복된 이메일입니다.',
          })
        }
      } catch (error) {
        if (!request.signal.aborted) {
          setEmailCheck({
            email: addressToCheck,
            available: false,
            message: error instanceof ApiRequestError && error.status === 400
              ? error.message
              : '이메일을 확인하지 못했습니다. 입력을 수정한 뒤 다시 시도해 주세요.',
          })
        }
      }
    }, 500)
    return () => {
      window.clearTimeout(timer)
      request.abort()
    }
  }, [email])

  function closeAddressSearch() {
    postcodeSession.current = null
    postcodeHost.current?.replaceChildren()
    postcodeDialog.current?.close()
    setPostcodeMessage('')
  }

  async function searchAddress() {
    const dialog = postcodeDialog.current
    const host = postcodeHost.current
    if (!dialog || !host || dialog.open) return
    const session = Symbol()
    postcodeSession.current = session
    // SDK 로딩 중 모달을 닫았다가 다시 열 수 있어, 이전 검색의 콜백이 새 화면을 변경하지 않게 구분합니다.
    const isCurrent = () => dialog.isConnected && dialog.open && postcodeSession.current === session
    dialog.showModal()
    setPostcodeMessage('주소 검색을 불러오는 중입니다.')
    try {
      const Postcode = await loadPostcode()
      if (!isCurrent()) return
      setPostcodeMessage('')
      new Postcode({
        width: '100%',
        height: '100%',
        minWidth: 240,
        oncomplete({ zonecode, roadAddress }) {
          if (!isCurrent()) return
          if (!zonecode || !roadAddress) {
            setPostcodeMessage('도로명 주소가 포함된 검색 결과를 선택해 주세요.')
            return
          }
          // 선택한 우편번호와 도로명 주소를 각각 우편번호와 기본 주소 칸에 채웁니다.
          // 새 배송지에 맞게 상세 주소를 비우고 해당 칸으로 포커스를 옮깁니다.
          setPostalCode(zonecode)
          setAddress(roadAddress)
          setDetail('')
          setError(null)
          closeAddressSearch()
          detailAddress.current?.focus()
        },
      }).embed(host, { autoClose: false })
    } catch {
      if (isCurrent()) setPostcodeMessage(postcodeError)
    }
  }

  // 재입력 칸에서 벗어나기 전에 제출해도 불일치를 표시하고 요청을 막습니다.
  // 필수 조건을 모두 충족하면 한 번만 요청하며, 201 응답 뒤 완료 안내를 엽니다.
  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitLock.current || completed) return
    setPasswordConfirmTouched(true)
    if (!passwordsMatch || !canSubmit) return
    setError(null)
    // 상태 갱신이 화면에 반영되기 전 연속 제출도 막기 위해 pending과 별도로 즉시 잠급니다.
    submitLock.current = true
    setPending(true)
    try {
      await signUpCustomer({
        email: normalizedEmail, password, name: name.trim(), phone, postalCode: postalCode.trim(),
        address: address.trim(), detailAddress: detail.trim(), termsConsent,
      })
      setPassword('')
      setPasswordConfirm('')
      setCompleted(true)
      // 완료 안내에서 확인을 누르면 스토어로 이동하고 기존 로그인 패널을 엽니다.
      successDialog.current?.showModal()
    } catch (cause) {
      if (cause instanceof ApiRequestError) {
        setError({ message: cause.message, fields: cause.fieldErrors })
        if (cause.status === 409) {
          setEmailCheck({ email: normalizedEmail, available: false, message: cause.message })
        }
      } else {
        setError({ message: '서버 연결에 실패했습니다. 다시 시도해 주세요.' })
      }
    } finally {
      submitLock.current = false
      setPending(false)
    }
  }

  const fields = error?.fields
  const emailFeedback = fields?.email || (email && !emailValid ? '올바른 이메일 형식으로 입력해 주세요.'
    : currentEmailCheck?.message || (emailValid ? '이메일 중복을 확인하고 있습니다.' : ''))

  return (
    <section className="mx-auto w-[min(92%,560px)] py-14 sm:py-20">
      <div className="mb-8 text-center">
        <p className="text-[10px] font-semibold tracking-[0.24em] text-zinc-500">
          MONO / KEYS · ACCOUNT
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.06em] sm:text-5xl">회원가입</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          계정을 만들고 더 편안한 쇼핑을 시작해 보세요.
        </p>
      </div>

      <form className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-9" onSubmit={submitSignup}>
        <label className="block text-sm font-medium text-zinc-800">
          이메일
          <input
            aria-describedby="signup-email-feedback"
            autoComplete="email"
            className={inputClass}
            disabled={disabled}
            maxLength={50}
            name="email"
            onChange={(event) => {
              emailRequest.current?.abort()
              setEmail(event.target.value)
              setEmailCheck(null)
              setError(null)
            }}
            placeholder="example@email.com"
            required
            type="email"
            value={email}
          />
          <span className="mt-1 block text-xs text-zinc-600" id="signup-email-feedback" role="status">
            {emailFeedback}
          </span>
        </label>

        <label className="block text-sm font-medium text-zinc-800">
          비밀번호
          <input
            aria-describedby="signup-password-feedback"
            autoComplete="new-password"
            className={inputClass}
            disabled={disabled}
            maxLength={40}
            name="password"
            onChange={(event) => {
              setPassword(event.target.value)
              setError(null)
            }}
            placeholder="8~20자, 영문과 숫자 포함"
            required
            type="password"
            value={password}
          />
          <span className="mt-1 block text-xs text-zinc-600" id="signup-password-feedback">
            {fields?.password || (password && !passwordValid ? '8~20자이며 영문과 숫자를 포함해야 합니다.' : '')}
          </span>
        </label>

        <div>
          <label className="block text-sm font-medium text-zinc-800" htmlFor="signup-password-confirm">비밀번호 확인</label>
          <input
            aria-describedby="signup-password-confirm-feedback"
            aria-invalid={showPasswordMismatch}
            autoComplete="new-password"
            className={inputClass}
            disabled={disabled}
            id="signup-password-confirm"
            maxLength={40}
            name="passwordConfirm"
            onBlur={() => setPasswordConfirmTouched(true)}
            onChange={(event) => {
              setPasswordConfirm(event.target.value)
              setError(null)
            }}
            onInvalid={(event) => {
              if (!passwordsMatch) {
                event.preventDefault()
                setPasswordConfirmTouched(true)
              }
            }}
            placeholder="비밀번호를 다시 입력해 주세요"
            required
            type="password"
            value={passwordConfirm}
          />
          <p className="mt-1 text-xs text-red-700" id="signup-password-confirm-feedback" role="status">
            {showPasswordMismatch && '비밀번호가 일치하지 않습니다.'}
          </p>
        </div>

        <label className="block text-sm font-medium text-zinc-800">
          이름
          <input autoComplete="name" className={inputClass} disabled={disabled} maxLength={50}
            name="name" onChange={(event) => setName(event.target.value)} placeholder="이름을 입력해 주세요"
            required value={name} />
          {fields?.name && <span className="mt-1 block text-xs text-red-700">{fields.name}</span>}
        </label>

        <label className="block text-sm font-medium text-zinc-800">
          전화번호
          <input
            autoComplete="tel-national"
            className={inputClass}
            disabled={disabled}
            inputMode="numeric"
            maxLength={13}
            name="phone"
            onBlur={() => setPhoneTouched(true)}
            onChange={(event) => setPhone(event.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
            placeholder="010-0000-0000"
            required
            type="tel"
            value={[phone.slice(0, 3), phone.slice(3, 7), phone.slice(7)].filter(Boolean).join('-')}
          />
          {(fields?.phoneNumber || (phoneTouched && !phoneValid)) && (
            <span className="mt-1 block text-xs text-red-700">
              {fields?.phoneNumber || '010으로 시작하는 11자리 연락처를 입력해 주세요.'}
            </span>
          )}
        </label>

        <fieldset className="space-y-3 border-t border-zinc-200 pt-5" disabled={disabled}>
          <legend className="text-sm font-medium text-zinc-800">기본배송지</legend>
          <div className="flex items-center gap-2">
            <input
              aria-label="우편번호"
              className={inputBaseClass + ' max-w-36 bg-zinc-50'}
              maxLength={10}
              name="postalCode"
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder="우편번호"
              required
              value={postalCode}
            />
            <button aria-haspopup="dialog" className={outlineButton} onClick={searchAddress} type="button">
              주소 검색
            </button>
          </div>
          <input
            aria-label="기본 주소"
            className={inputClass + ' mt-0 bg-zinc-50'}
            maxLength={255}
            name="address"
            onChange={(event) => setAddress(event.target.value)}
            required
            value={address}
          />
          <input
            aria-label="상세 주소"
            autoComplete="address-line2"
            className={inputClass + ' mt-0'}
            maxLength={255}
            name="detailAddress"
            onChange={(event) => setDetail(event.target.value)}
            value={detail}
            placeholder="상세 주소 (동·호수 등)"
            ref={detailAddress}
            required
          />
          {['defaultAddress', 'defaultAddress.zonecode', 'defaultAddress.roadAddress', 'defaultAddress.detailAddress'].map(
            (field) => fields?.[field] && <p className="text-xs text-red-700" key={field}>{fields[field]}</p>,
          )}
        </fieldset>

        <fieldset className="space-y-3 border-t border-zinc-200 pt-5" disabled={disabled}>
          <legend className="text-sm font-medium text-zinc-800">약관 동의</legend>
          {terms.map(({ name, label, description }) => (
            <div className="space-y-1" key={name}>
              <label className="flex items-center gap-2 text-sm text-zinc-800">
                <input
                  checked={termsConsent[name]}
                  className="size-4 accent-zinc-950"
                  name={name}
                  onChange={(event) => {
                    setTermsConsent({ ...termsConsent, [name]: event.target.checked })
                    setError(null)
                  }}
                  required
                  type="checkbox"
                />
                {label} (필수)
              </label>
              <details className="pl-6 text-xs leading-5 text-zinc-600">
                <summary className="cursor-pointer">{label} 내용 보기</summary>
                <p>{description}</p>
              </details>
            </div>
          ))}
          {fields?.termsConsent && <p className="text-xs text-red-700">{fields.termsConsent}</p>}
        </fieldset>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">{error.message}</p>
        )}

        <button
          className="h-13 w-full rounded-md bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-50"
          disabled={disabled || !canSubmit}
          type="submit"
        >
          {pending ? '가입 요청 중…' : '회원가입'}
        </button>

        <p className="text-center text-sm text-zinc-500">
          이미 계정이 있으신가요?{' '}
          <Link className="font-semibold text-zinc-900 underline underline-offset-4" href="/?login=1">
            스토어에서 로그인
          </Link>
        </p>
      </form>

      <div className="mt-7 text-center">
        <Link className="text-xs font-medium tracking-[0.1em] text-zinc-500 hover:text-black" href="/">
          ← BACK TO STORE
        </Link>
      </div>
      <dialog
        aria-labelledby="signup-postcode-title"
        className={dialogClass}
        onCancel={(event) => {
          event.preventDefault()
          closeAddressSearch()
        }}
        ref={postcodeDialog}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xl font-medium" id="signup-postcode-title">주소 검색</h2>
          <button className={outlineButton} onClick={closeAddressSearch} type="button">닫기</button>
        </div>
        {postcodeMessage && <p className="text-sm text-zinc-700" role="status">{postcodeMessage}</p>}
        <div className="h-[min(55vh,440px)]" ref={postcodeHost} />
      </dialog>
      <dialog
        aria-labelledby="signup-success"
        className={dialogClass}
        onCancel={(event) => event.preventDefault()}
        ref={successDialog}
      >
        <h2 className="text-xl font-medium" id="signup-success">회원가입이 완료되었습니다.</h2>
        <button
          className="mt-5 h-12 rounded-md bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
          onClick={() => router.replace('/?login=1')}
          type="button"
        >
          확인
        </button>
      </dialog>
    </section>
  )
}
