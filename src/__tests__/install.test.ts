/**
 * インストールの状態（小さなストア）と runStartup のテスト。
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// runStartup は「受け取りの登録は 1 回だけ」なので、テストごとに読み込み直す
async function load() {
  vi.resetModules()
  return await import('../startup')
}

function fakePromptEvent(outcome: 'accepted' | 'dismissed') {
  const e = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
  e.prompt = vi.fn(async () => {})
  e.userChoice = Promise.resolve({ outcome })
  return e
}

describe('runStartup', () => {
  let register: ReturnType<typeof vi.fn>
  beforeEach(() => {
    register = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'serviceWorker', { value: { register }, configurable: true })
  })
  afterEach(() => {
    delete (navigator as unknown as Record<string, unknown>).serviceWorker
  })

  it('serviceWorkerUrl を省くと、サービスワーカーは登録しない（サービスワーカーが無いアプリでも使える）', async () => {
    const { runStartup } = await load()
    expect(runStartup()).toBe(false)
    window.dispatchEvent(new Event('load'))
    expect(register).not.toHaveBeenCalled()
  })

  it('serviceWorkerUrl を渡すと登録する', async () => {
    const { runStartup } = await load()
    runStartup({ serviceWorkerUrl: '/sw.js' })
    window.dispatchEvent(new Event('load'))
    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('インストールの知らせを受け取ると、ボタンで入れられる（canPrompt）。入れたら installed', async () => {
    const { runStartup, getInstallState, promptInstall, useInstallState } = await load()
    runStartup()
    const { result } = renderHook(() => useInstallState())
    expect(result.current).toEqual({ canPrompt: false, installed: false })

    const e = fakePromptEvent('accepted')
    act(() => void window.dispatchEvent(e))
    expect(result.current.canPrompt).toBe(true)

    let ok = false
    await act(async () => {
      ok = await promptInstall()
    })
    expect(ok).toBe(true)
    expect(e.prompt).toHaveBeenCalled()
    expect(getInstallState()).toEqual({ canPrompt: false, installed: true })
    expect(result.current.installed).toBe(true)
  })

  it('一部だけ読む（selector）', async () => {
    const { runStartup, useInstallState } = await load()
    runStartup()
    const { result } = renderHook(() => useInstallState((s) => s.canPrompt))
    expect(result.current).toBe(false)
    act(() => void window.dispatchEvent(fakePromptEvent('dismissed')))
    expect(result.current).toBe(true)
  })

  it('知らせが無いうちに promptInstall を呼んでも何もしない', async () => {
    const { promptInstall } = await load()
    expect(await promptInstall()).toBe(false)
  })
})
