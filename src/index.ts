/**
 * @shiodome47/pwa-kit — ホーム画面に追加して使う Web アプリ（PWA）の、つまずきやすいところをまとめたもの。
 * LINE の中のブラウザから出る・インストールの案内（iPhone の図つきの手順）・端末の見分け。
 *
 * 見た目は `import '@shiodome47/pwa-kit/style.css'` で読み込む。
 */
export * from './startup'
export * from './labels'
export type { PwaKitTheme, PwaKitCommonProps } from './common'
export * from './IosInstallGuide'
export * from './InstallGuide'
export * from './LineBanner'
