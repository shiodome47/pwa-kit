import { useEffect, useState, type CSSProperties } from 'react'
import {
  EN_LABELS,
  InstallGuide,
  IosInstallGuide,
  isAppleDevice,
  isIosSafari,
  isLineInAppBrowser,
  isStandalone,
  LineBanner,
  useInstallState,
  type PwaKitTheme,
} from '@shiodome47/pwa-kit'

type Lang = 'ja' | 'en'

const TEXT = {
  ja: {
    lead: 'ホーム画面に追加して使う Web アプリ（PWA）の、つまずきやすいところをまとめた React の部品。',
    labels: '文言',
    theme: '表示',
    themes: { system: '端末に合わせる', light: '明るい', dark: '暗い' },
    accent: '色（--pk-accent など）',
    here: 'この端末での案内（<InstallGuide>）',
    hereNote: 'Android・PC の Chrome・Edge ではボタン、iPhone・iPad では図つきの手順、ホーム画面から開くと「開いています」。',
    ios: 'iPhone・iPad の手順（<IosInstallGuide>）',
    line: 'LINE の帯（<LineBanner>）',
    lineNote: 'LINE の中のブラウザで開いたままのときだけ出る帯（ここでは見本のため、いつも出しています）。',
    detect: 'この端末の見分け',
    yes: 'はい',
    no: 'いいえ',
    rows: ['iPhone・iPad（isAppleDevice）', 'iPhone・iPad の Safari（isIosSafari）', 'LINE の中のブラウザ（isLineInAppBrowser）', 'ホーム画面のアプリ（isStandalone）', 'ボタンで入れられる（canPrompt）'],
    appName: 'pwa-kit',
  },
  en: {
    lead: 'React parts for the tricky bits of web apps you add to the Home Screen (PWAs).',
    labels: 'Labels',
    theme: 'Theme',
    themes: { system: 'System', light: 'Light', dark: 'Dark' },
    accent: 'Color (--pk-accent etc.)',
    here: 'Install guide for this device (<InstallGuide>)',
    hereNote: 'A button on Android / desktop Chrome and Edge, illustrated steps on iPhone and iPad, and a note when opened from the Home Screen.',
    ios: 'iPhone / iPad steps (<IosInstallGuide>)',
    line: 'LINE banner (<LineBanner>)',
    lineNote: 'Shown only while the page is open inside LINE’s in-app browser (always shown here for the demo).',
    detect: 'What this device is',
    yes: 'yes',
    no: 'no',
    rows: ['iPhone / iPad (isAppleDevice)', 'Safari on iPhone / iPad (isIosSafari)', 'Inside LINE (isLineInAppBrowser)', 'Opened from the Home Screen (isStandalone)', 'Can install with a button (canPrompt)'],
    appName: 'pwa-kit',
  },
} as const

/** 色の見本（部品の CSS の変数を上書きする） */
const ACCENTS: Record<string, CSSProperties | undefined> = {
  teal: undefined,
  blue: { '--pk-accent': '#3b82f6', '--pk-accent-text': '#2563eb', '--pk-accent-soft': '#dbeafe', '--pk-button': '#2563eb', '--pk-button-hover': '#3b82f6' } as CSSProperties,
  violet: { '--pk-accent': '#8b5cf6', '--pk-accent-text': '#7c3aed', '--pk-accent-soft': '#ede9fe', '--pk-button': '#7c3aed', '--pk-button-hover': '#8b5cf6' } as CSSProperties,
}

export function App() {
  const [lang, setLang] = useState<Lang>('ja')
  const [theme, setTheme] = useState<PwaKitTheme>('system')
  const [accent, setAccent] = useState('teal')
  const { canPrompt } = useInstallState()
  const t = TEXT[lang]
  const labels = lang === 'en' ? EN_LABELS : undefined
  const ua = navigator.userAgent

  // 見本のページの背景も、選んだ表示に合わせる
  useEffect(() => {
    const html = document.documentElement
    if (theme === 'system') html.removeAttribute('data-theme')
    else html.setAttribute('data-theme', theme)
    html.lang = lang
  }, [theme, lang])

  const detect = [isAppleDevice(ua), isIosSafari(ua), isLineInAppBrowser(ua), isStandalone(), canPrompt]

  return (
    <main className="demo" style={ACCENTS[accent]}>
      <header>
        <h1>pwa-kit</h1>
        <p>{t.lead}</p>
        <pre className="demo__code">
          <code>npm install @shiodome47/pwa-kit</code>
        </pre>
        <Choice label={t.labels} value={lang} onChange={setLang} options={{ ja: '日本語', en: 'English' }} />
        <Choice label={t.theme} value={theme} onChange={setTheme} options={t.themes} />
        <Choice label={t.accent} value={accent} onChange={setAccent} options={{ teal: 'teal', blue: 'blue', violet: 'violet' }} />
      </header>

      <section>
        <h2>{t.here}</h2>
        <p className="demo__muted">{t.hereNote}</p>
        <div className="demo__card">
          <InstallGuide appName={t.appName} labels={labels} theme={theme} />
        </div>
      </section>

      <section>
        <h2>{t.ios}</h2>
        <div className="demo__card">
          <IosInstallGuide appName={t.appName} labels={labels} theme={theme} />
        </div>
      </section>

      <section>
        <h2>{t.line}</h2>
        <p className="demo__muted">{t.lineNote}</p>
        <div className="demo__card demo__card--flush">
          <LineBanner show labels={labels} theme={theme} />
        </div>
      </section>

      <section>
        <h2>{t.detect}</h2>
        <table className="demo__table">
          <tbody>
            {t.rows.map((row, i) => (
              <tr key={row}>
                <th scope="row">{row}</th>
                <td>{detect[i] ? t.yes : t.no}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="demo__muted demo__ua">{ua}</p>
      </section>

      <footer className="demo__footer">
        <a href="https://github.com/shiodome47/pwa-kit">GitHub</a>
        <a href="https://www.npmjs.com/package/@shiodome47/pwa-kit">npm</a>
      </footer>
    </main>
  )
}

function Choice<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: Record<T, string> }) {
  return (
    <div className="demo__choice" role="group" aria-label={label}>
      <span className="demo__muted">{label}:</span>
      {(Object.keys(options) as T[]).map((k) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>
          {options[k]}
        </button>
      ))}
    </div>
  )
}
