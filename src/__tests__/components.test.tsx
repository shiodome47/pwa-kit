/**
 * 画面の部品（文言の差し替え・アプリの名前・LINE の帯・明るい／暗い）のテスト。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EN_LABELS, InstallGuide, IosInstallGuide, JA_LABELS, LineBanner } from '../index'

const SRC = resolve(process.cwd(), 'src')

describe('<IosInstallGuide>', () => {
  it('4 つの手順。アプリの名前は props で渡す', () => {
    render(<IosInstallGuide appName="手話学習" icon="🤟" />)
    const guide = screen.getByTestId('ios-install-guide')
    expect(guide.querySelectorAll('li')).toHaveLength(4)
    expect(guide).toHaveAccessibleName(JA_LABELS.iosGuideName)
    expect(guide).toHaveTextContent('ホーム画面にできた「手話学習」のアイコンから開きます。')
    expect(guide).toHaveTextContent('🤟')
    // **…** は太字
    expect(screen.getByText('共有ボタン').tagName).toBe('STRONG')
  })

  it('アイコンを省くと、名前の 1 文字目', () => {
    const { container } = render(<IosInstallGuide appName="Lamp" />)
    expect(container.querySelector('.pwa-kit__app-icon')).toHaveTextContent('L')
  })

  it('文言は一部だけ差し替えられる（残りは日本語のまま）。英語は EN_LABELS', () => {
    const { rerender } = render(<IosInstallGuide appName="App" labels={{ iosStep4: (n) => `「**${n}**」を開く。完了です。` }} />)
    expect(screen.getByTestId('ios-install-guide')).toHaveTextContent('「App」を開く。完了です。')
    expect(screen.getByTestId('ios-install-guide')).toHaveTextContent('共有ボタン')
    rerender(<IosInstallGuide appName="App" labels={EN_LABELS} />)
    expect(screen.getByTestId('ios-install-guide')).toHaveTextContent('Open “App” from the new icon on your Home Screen.')
  })

  it('theme で明るい・暗いを決める（system は印を付けず、端末の設定に合わせる）', () => {
    const { rerender } = render(<IosInstallGuide appName="App" theme="dark" className="extra" />)
    const el = screen.getByTestId('ios-install-guide')
    expect(el).toHaveAttribute('data-theme', 'dark')
    expect(el).toHaveClass('pwa-kit', 'pwa-kit--ios-guide', 'extra')
    rerender(<IosInstallGuide appName="App" />)
    expect(screen.getByTestId('ios-install-guide')).not.toHaveAttribute('data-theme')
  })
})

describe('<InstallGuide>', () => {
  it('iPhone・iPad では、手順の図を出す', () => {
    render(<InstallGuide appName="App" apple theme="light" />)
    expect(screen.getByTestId('ios-install-guide')).toHaveAttribute('data-theme', 'light')
    expect(screen.getByText(/次の手順でホーム画面に追加します/)).toBeInTheDocument()
    expect(screen.getByText(JA_LABELS.benefit)).toBeInTheDocument()
  })

  it('それ以外（ボタンが出ないブラウザ）は、メニューから追加するよう伝える', () => {
    render(<InstallGuide appName="App" apple={false} labels={{ otherBrowser: 'menu please' }} />)
    expect(screen.getByText('menu please')).toBeInTheDocument()
    expect(screen.queryByTestId('ios-install-guide')).toBeNull()
  })
})

describe('<LineBanner>', () => {
  it('LINE の外では出さない', () => {
    const { container } = render(<LineBanner />)
    expect(container).toBeEmptyDOMElement()
  })
  it('出すと、「ブラウザで開く」を太字で案内する。文言は差し替えられる', () => {
    const { rerender } = render(<LineBanner show />)
    expect(screen.getByRole('note')).toHaveTextContent('LINE の中で開いています')
    expect(screen.getByText('「ブラウザで開く」').tagName).toBe('STRONG')
    rerender(<LineBanner show labels={EN_LABELS} />)
    expect(screen.getByRole('note')).toHaveTextContent('You are inside LINE')
  })
})

describe('部品専用の CSS', () => {
  const css = readFileSync(resolve(SRC, 'style.css'), 'utf8')

  it('すべての決まりが .pwa-kit の中だけに効く（使う側のページの見た目を変えない）', () => {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const selectors = [...noComments.matchAll(/([^{};]+)\{/g)]
      .map((m) => m[1].trim())
      .filter((s) => !s.startsWith('@'))
      .flatMap((s) => s.split(',').map((x) => x.trim()))
    expect(selectors.length).toBeGreaterThan(10)
    for (const s of selectors) {
      expect(s, s).toMatch(/^(:where\()?\.pwa-kit([\s.:[)]|$)/)
    }
  })

  it('部品が使うクラスは、すべて CSS に書いてある', () => {
    const tsx = ['IosInstallGuide.tsx', 'InstallGuide.tsx', 'LineBanner.tsx', 'icons.tsx', 'common.tsx']
      .map((f) => readFileSync(resolve(SRC, f), 'utf8'))
      .join('\n')
    const used = new Set([...tsx.matchAll(/pwa-kit__[a-z0-9-]+/g)].map((m) => m[0]))
    expect(used.size).toBeGreaterThan(10)
    for (const cls of used) expect(css, cls).toContain(`.${cls}`)
    for (const v of ['ios-guide', 'line-banner']) expect(css).toContain(`.pwa-kit--${v}`)
  })

  it('色は変数（--pk-…）で、明るい・暗いの両方がある', () => {
    expect(css).toMatch(/--pk-accent:/)
    expect(css).toMatch(/\[data-theme='dark'\]/)
    expect(css).toMatch(/prefers-color-scheme: dark/)
    expect(css).toMatch(/:not\(\[data-theme='light'\]\)/)
  })
})
