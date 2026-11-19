import { describe, expect, it } from 'vitest'
import { externalBrowserUrl, isAppleDevice, isIosSafari, isLineInAppBrowser, withoutLineParam } from '../startup'

const LINE_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/14.1.0'
const LINE_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0 Mobile Safari/537.36 Line/14.1.0/IAB'
const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const CHROME_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1'
const CHROME_PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

describe('LINE の中のブラウザ', () => {
  it('LINE を見分ける', () => {
    expect(isLineInAppBrowser(LINE_IOS)).toBe(true)
    expect(isLineInAppBrowser(LINE_ANDROID)).toBe(true)
    expect(isLineInAppBrowser(SAFARI)).toBe(false)
    expect(isLineInAppBrowser(CHROME_PC)).toBe(false)
  })
  it('外のブラウザで開くための印を付ける（パスや #sync=… はそのまま）', () => {
    expect(externalBrowserUrl('https://app.example/settings?x=1#sync=KEY', LINE_IOS)).toBe(
      'https://app.example/settings?x=1&openExternalBrowser=1#sync=KEY',
    )
  })
  it('すでに印があるとき・LINE 以外では何もしない（繰り返さない）', () => {
    expect(externalBrowserUrl('https://app.example/?openExternalBrowser=1', LINE_IOS)).toBeNull()
    expect(externalBrowserUrl('https://app.example/', SAFARI)).toBeNull()
  })
  it('開いた先で印を消す', () => {
    expect(withoutLineParam('https://app.example/settings?x=1&openExternalBrowser=1#sync=KEY')).toBe('/settings?x=1#sync=KEY')
    expect(withoutLineParam('https://app.example/')).toBeNull()
  })
})

describe('iPhone の Safari', () => {
  it('Safari だけを見分ける（Chrome・LINE は別）', () => {
    expect(isIosSafari(SAFARI)).toBe(true)
    expect(isIosSafari(CHROME_IOS)).toBe(false)
    expect(isIosSafari(LINE_IOS)).toBe(false)
    expect(isIosSafari(CHROME_PC)).toBe(false)
  })

  it('iPad の Safari（パソコンのふりをする）も、指で触れるかで iPhone・iPad と分かる。Mac の Safari はちがう', () => {
    const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    expect(isIosSafari(IPAD, 5)).toBe(true)
    expect(isAppleDevice(IPAD, 5)).toBe(true)
    expect(isIosSafari(IPAD, 0)).toBe(false)
    expect(isAppleDevice(IPAD, 0)).toBe(false)
  })
})
