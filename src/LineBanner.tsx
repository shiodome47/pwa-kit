import { RichText, rootProps, type PwaKitCommonProps } from './common'
import { ExternalLinkIcon } from './icons'
import { withLabels, type PwaKitLabels } from './labels'
import { isLineInAppBrowser } from './startup'

export interface LineBannerProps extends PwaKitCommonProps {
  /** 文言の差し替え（lineBanner）。英語は EN_LABELS */
  labels?: Partial<PwaKitLabels>
  /** 出すかどうかを決める（省くと、LINE の中のブラウザのときだけ出す。見本・テスト用） */
  show?: boolean
}

/**
 * LINE の中のブラウザで開いたままのときに出す帯。
 * 自動で外のブラウザに移れなかった場合（LINE の版や設定による）の案内。
 * LINE の中で使うと、データがいつものブラウザとは別の場所に保存されて見えなくなる。
 */
export function LineBanner({ labels, show, ...common }: LineBannerProps) {
  const visible = show ?? (typeof navigator !== 'undefined' && isLineInAppBrowser(navigator.userAgent))
  if (!visible) return null
  const t = withLabels(labels)
  return (
    <div {...rootProps('line-banner', common)} role="note" data-testid="line-banner">
      <ExternalLinkIcon className="pwa-kit__banner-icon" />
      <p className="pwa-kit__banner-text">
        <RichText text={t.lineBanner} />
      </p>
    </div>
  )
}
