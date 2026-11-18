type PostcodeConstructor = new (options: {
  width: string
  height: string
  minWidth: number
  oncomplete: (address: { zonecode: string; roadAddress: string }) => void
}) => { embed: (host: HTMLElement, options: { autoClose: boolean }) => void }

type PostcodeWindow = Window & {
  kakao?: { Postcode?: PostcodeConstructor }
  daum?: { Postcode?: PostcodeConstructor }
}

const postcodeUrl = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
export const postcodeError = '주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
let pending: Promise<PostcodeConstructor> | undefined

function getPostcode() {
  const { kakao, daum } = window as PostcodeWindow
  return kakao?.Postcode ?? daum?.Postcode
}

// 주소 검색을 열 때만 SDK를 불러옵니다. 로딩 중에는 같은 요청을 재사용하고 실패하면 다시 시도할 수 있습니다.
export function loadPostcode() {
  const Postcode = getPostcode()
  if (Postcode) return Promise.resolve(Postcode)

  pending ??= new Promise<PostcodeConstructor>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = postcodeUrl

    function finish() {
      window.clearTimeout(timeout)
      script.onload = null
      script.onerror = null
      const loaded = getPostcode()
      if (loaded) {
        resolve(loaded)
      } else {
        script.remove()
        reject(new Error(postcodeError))
      }
    }

    const timeout = window.setTimeout(finish, 10000)
    script.onload = finish
    script.onerror = finish
    document.head.append(script)
  }).catch((error) => {
    pending = undefined
    throw error
  })
  return pending
}
