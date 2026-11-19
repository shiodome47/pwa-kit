import { useState, type ReactNode } from 'react'
import { RichText, rootProps, type PwaKitCommonProps } from './common'
import { DownloadIcon } from './icons'
import { IosInstallGuide } from './IosInstallGuide'
import { withLabels, type PwaKitLabels } from './labels'
import { isAppleDevice, promptInstall, useInstallState } from './startup'

export interface InstallGuideProps extends PwaKitCommonProps {
  /** アプリの名前（iPhone の手順の「ホーム画面にできた〇〇」に出る） */
  appName: string
  /** ホーム画面のアイコンの絵（iPhone の手順の図に出る）。省くと、名前の 1 文字目 */
  icon?: ReactNode
  /** 文言の差し替え（変えたいものだけ）。英語は EN_LABELS */
  labels?: Partial<PwaKitLabels>
  /** インストールのボタンを押して、インストールされたら呼ばれる */
  onInstalled?: () => void
  /** iPhone・iPad かどうかを決める（省くと、この端末を見分ける。見本・テスト用） */
  apple?: boolean
}

/**
 * インストールの案内をまとめたもの。端末とブラウザに合わせて、出すものを変える。
 *
 * - ホーム画面のアプリで開いている → そのことを伝える
 * - ボタンで入れられる（Android・PC の Chrome・Edge など）→ インストールのボタン
 * - iPhone・iPad → Safari の画面をまねた図つきの手順（<IosInstallGuide>）
 * - それ以外 → ブラウザのメニューから追加するよう伝える
 *
 * 使う前に、起動のときに `runStartup()` を呼んでおく（ボタンを出すための知らせを受け取るため）。
 */
export function InstallGuide({ appName, icon, labels, onInstalled, apple, ...common }: InstallGuideProps) {
  const { canPrompt, installed } = useInstallState()
  const [busy, setBusy] = useState(false)
  const t = withLabels(labels)
  const ios = apple ?? (typeof navigator !== 'undefined' && isAppleDevice(navigator.userAgent))

  const install = async () => {
    setBusy(true)
    try {
      if (await promptInstall()) onInstalled?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div {...rootProps('install', common)} data-testid="install-guide">
      {installed ? (
        <p className="pwa-kit__text">
          <RichText text={t.installed} />
        </p>
      ) : canPrompt ? (
        <button type="button" className="pwa-kit__button" onClick={() => void install()} disabled={busy}>
          <DownloadIcon />
          {t.installButton}
        </button>
      ) : ios ? (
        <>
          <p className="pwa-kit__text pwa-kit__intro">
            <RichText text={t.iosIntro} />
          </p>
          <IosInstallGuide appName={appName} icon={icon} labels={labels} theme={common.theme} />
        </>
      ) : (
        <p className="pwa-kit__text">
          <RichText text={t.otherBrowser} />
        </p>
      )}
      {!installed && (
        <p className="pwa-kit__note">
          <RichText text={t.benefit} />
        </p>
      )}
    </div>
  )
}
