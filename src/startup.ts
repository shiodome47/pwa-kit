import { useSyncExternalStore } from 'react'

/**
 * 起動時に一度だけ行うこと（アプリの画面を出す前）と、端末・ブラウザの見分け。
 *
 * - LINE の中のブラウザで開かれたら、いつものブラウザで開き直す
 *   （URL に ?openExternalBrowser=1 を付けると LINE が外のブラウザで開く。開いた先ではこの印を消す）
 * - サービスワーカーを登録する（ホーム画面へのインストールとオフライン用。省いてもよい）
 * - ブラウザにデータを消さないよう頼む（インストールしたときなどに認められる）
 * - インストールの案内（beforeinstallprompt）を受け取っておく
 */

const LINE_PARAM = 'openExternalBrowser'

// ─── LINE の中のブラウザ ─────────────────────────────────────

/** LINE アプリの中のブラウザか */
export function isLineInAppBrowser(userAgent: string): boolean {
  return /\bLine\/\d/i.test(userAgent)
}

/**
 * LINE の中で開かれていたら、外のブラウザで開くための URL を返す（それ以外は null）。
 * すでに印が付いているのに LINE のまま（古い LINE など）のときは、繰り返さないよう null。
 */
export function externalBrowserUrl(href: string, userAgent: string): string | null {
  if (!isLineInAppBrowser(userAgent)) return null
  const url = new URL(href)
  if (url.searchParams.has(LINE_PARAM)) return null
  url.searchParams.set(LINE_PARAM, '1')
  return url.toString()
}

/** 外のブラウザで開いた後、URL から印を消す（#sync=… などはそのまま）。印が無ければ null */
export function withoutLineParam(href: string): string | null {
  const url = new URL(href)
  if (!url.searchParams.has(LINE_PARAM)) return null
  url.searchParams.delete(LINE_PARAM)
  return url.pathname + url.search + url.hash
}

// ─── 端末の見分け ─────────────────────────────────────────────

const touchPoints = () => (typeof navigator === 'undefined' ? 0 : (navigator.maxTouchPoints ?? 0))

/**
 * iPhone・iPad か（ブラウザはどれでも。ホーム画面のアプリでも）。
 * iPad の Safari はパソコン（Macintosh）のふりをするので、指で触れるか（maxTouchPoints）で見分ける。
 */
export function isAppleDevice(userAgent: string, maxTouchPoints: number = touchPoints()): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && (maxTouchPoints > 1 || /Mobile/i.test(userAgent)))
}

/** iPhone・iPad の Safari か（ボタンでは入れられず、共有メニューから追加する） */
export function isIosSafari(userAgent: string, maxTouchPoints?: number): boolean {
  return isAppleDevice(userAgent, maxTouchPoints) && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|Line\//i.test(userAgent)
}

/** ホーム画面（アプリ一覧）に追加したアプリとして開いているか */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// ─── インストールの状態（小さなストア） ─────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallState {
  /** ボタンからインストールできる（Chrome・Edge・Android など） */
  canPrompt: boolean
  /** ホーム画面から開いている（インストール済み） */
  installed: boolean
}

let state: InstallState = { canPrompt: false, installed: false }
let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

function setInstallState(patch: Partial<InstallState>) {
  state = { ...state, ...patch }
  for (const l of listeners) l()
}

/** 今のインストールの状態（React の外で読むとき） */
export function getInstallState(): InstallState {
  return state
}

/** インストールの状態が変わったら呼ばれる。やめるときは返り値の関数を呼ぶ */
export function subscribeInstallState(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * インストールの状態（React の画面で使う）。変わると画面が描き直される。
 *
 * ```tsx
 * const { canPrompt, installed } = useInstallState()
 * const installed = useInstallState((s) => s.installed) // 一部だけ
 * ```
 */
export function useInstallState(): InstallState
export function useInstallState<T>(selector: (s: InstallState) => T): T
export function useInstallState<T>(selector?: (s: InstallState) => T): T | InstallState {
  const get = () => (selector ? selector(state) : state)
  return useSyncExternalStore(subscribeInstallState, get, get)
}

/** インストールの確認を出す（ボタンを押したときに呼ぶ）。インストールされたら true */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const e = deferred
  deferred = null
  setInstallState({ canPrompt: false })
  await e.prompt()
  const { outcome } = await e.userChoice
  if (outcome === 'accepted') setInstallState({ installed: true })
  return outcome === 'accepted'
}

// ─── 起動 ─────────────────────────────────────────────────────

export interface StartupOptions {
  /**
   * 登録するサービスワーカーのファイル（例: '/sw.js'）。
   * 省く・null なら登録しない（サービスワーカーが無いアプリ・開発中など）
   */
  serviceWorkerUrl?: string | null
  /** LINE の中のブラウザで開かれたら、外のブラウザで開き直す（ふつうは true） */
  openLineInBrowser?: boolean
  /** ブラウザにデータを消さないよう頼む（navigator.storage.persist。ふつうは true） */
  persistStorage?: boolean
}

let listening = false

/**
 * 画面を出す前に呼ぶ。外のブラウザへ移るときは true（そのときは画面を出さない）。
 *
 * ```ts
 * if (!runStartup({ serviceWorkerUrl: '/sw.js' })) createRoot(el).render(<App />)
 * ```
 */
export function runStartup({ serviceWorkerUrl = null, openLineInBrowser = true, persistStorage = true }: StartupOptions = {}): boolean {
  if (typeof window === 'undefined') return false

  if (openLineInBrowser) {
    const reopen = externalBrowserUrl(window.location.href, navigator.userAgent)
    if (reopen) {
      // replace ではなくふつうのページ移動にする（LINE が移動を拾って外のブラウザで開くため）
      window.location.href = reopen
      return true
    }
  }
  const clean = withoutLineParam(window.location.href)
  if (clean) window.history.replaceState(window.history.state, '', clean)

  setInstallState({ installed: isStandalone() })

  // 2 回呼ばれても、受け取りの登録は 1 回だけ
  if (!listening) {
    listening = true
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferred = e as BeforeInstallPromptEvent
      setInstallState({ canPrompt: true })
    })
    window.addEventListener('appinstalled', () => setInstallState({ installed: true, canPrompt: false }))
  }

  if (serviceWorkerUrl && 'serviceWorker' in navigator) {
    const register = () => void navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {})
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }
  if (persistStorage) void navigator.storage?.persist?.().catch(() => {})
  return false
}
