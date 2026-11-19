import type { ReactNode } from 'react'

/** 明るい表示・暗い表示。'system' は端末の設定（prefers-color-scheme）に合わせる */
export type PwaKitTheme = 'light' | 'dark' | 'system'

/** どの部品にもある props */
export interface PwaKitCommonProps {
  /** 明るい表示・暗い表示（ふつうは 'system' = 端末の設定に合わせる） */
  theme?: PwaKitTheme
  /** いちばん外の要素に足すクラス */
  className?: string
}

/** いちばん外の要素に付けるもの（クラスと data-theme） */
export function rootProps(variant: string, { theme = 'system', className }: PwaKitCommonProps) {
  return {
    className: ['pwa-kit', `pwa-kit--${variant}`, className].filter(Boolean).join(' '),
    'data-theme': theme === 'system' ? undefined : theme,
  }
}

/** 文の中の `**…**` を太字にする */
export function RichText({ text }: { text: string }): ReactNode {
  const parts = text.split('**')
  return <>{parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="pwa-kit__strong">
        {part}
      </strong>
    ) : (
      part
    ),
  )}</>
}
