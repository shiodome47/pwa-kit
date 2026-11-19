import type { ReactNode } from 'react'
import { RichText, rootProps, type PwaKitCommonProps } from './common'
import { BookOpenIcon, ChevronLeftIcon, ChevronRightIcon, CopyIcon, EllipsisIcon, ShareIcon, SquarePlusIcon } from './icons'
import { withLabels, type PwaKitLabels } from './labels'

export interface IosInstallGuideProps extends PwaKitCommonProps {
  /** アプリの名前（ホーム画面のアイコンの下に出る名前。manifest の short_name と同じにする） */
  appName: string
  /** ホーム画面のアイコンの絵（絵文字・<img> など）。省くと、名前の 1 文字目 */
  icon?: ReactNode
  /** 文言の差し替え（変えたいものだけ）。英語は EN_LABELS */
  labels?: Partial<PwaKitLabels>
}

/**
 * iPhone・iPad で「ホーム画面に追加」する手順（図つき・4 つの手順）。
 * Android はボタン 1 つで入れられるが、iPhone は Safari の共有メニューから自分で追加する必要があり、迷いやすい。
 * 図は、Safari の画面をまねた簡単な絵（押すところをアクセントの色の枠で囲む）。
 */
export function IosInstallGuide({ appName, icon, labels, ...common }: IosInstallGuideProps) {
  const t = withLabels(labels)
  return (
    <ol {...rootProps('ios-guide', common)} aria-label={t.iosGuideName} data-testid="ios-install-guide">
      <Step n={1} text={t.iosStep1}>
        <div className="pwa-kit__mock pwa-kit__mock-toolbar">
          <ChevronLeftIcon />
          <ChevronRightIcon />
          <Mark>
            <ShareIcon className="pwa-kit__icon--accent" />
          </Mark>
          <BookOpenIcon />
          <CopyIcon />
          <EllipsisIcon />
        </div>
      </Step>

      <Step n={2} text={t.iosStep2}>
        <div className="pwa-kit__mock pwa-kit__mock-menu">
          <div className="pwa-kit__mock-row">{t.mockCopy}</div>
          <div className="pwa-kit__mock-row">{t.mockReadingList}</div>
          <div className="pwa-kit__mock-row">{t.mockBookmark}</div>
          <div className="pwa-kit__mock-pick">
            <Mark full>
              <span className="pwa-kit__mock-add-row">
                {t.mockAddToHome}
                <SquarePlusIcon className="pwa-kit__icon--accent" />
              </span>
            </Mark>
          </div>
        </div>
      </Step>

      <Step n={3} text={t.iosStep3}>
        <div className="pwa-kit__mock pwa-kit__mock-header">
          <span>{t.mockCancel}</span>
          <span className="pwa-kit__mock-title">{t.mockAddToHome}</span>
          <Mark>
            <span className="pwa-kit__mock-add">{t.mockAdd}</span>
          </Mark>
        </div>
      </Step>

      <Step n={4} text={t.iosStep4(appName)}>
        <div className="pwa-kit__mock pwa-kit__mock-home">
          <Mark>
            <span className="pwa-kit__app-icon">{icon ?? Array.from(appName)[0] ?? ''}</span>
          </Mark>
          <span className="pwa-kit__app-name">{appName}</span>
        </div>
      </Step>
    </ol>
  )
}

function Step({ n, text, children }: { n: number; text: string; children: ReactNode }) {
  return (
    <li className="pwa-kit__step">
      <span className="pwa-kit__step-number" aria-hidden="true">
        {n}
      </span>
      <div className="pwa-kit__step-body">
        <p className="pwa-kit__text">
          <RichText text={text} />
        </p>
        {/* 図は飾り（読み上げは上の文で足りる） */}
        <div aria-hidden="true">{children}</div>
      </div>
    </li>
  )
}

/** 押すところ（アクセントの色の枠） */
function Mark({ children, full = false }: { children: ReactNode; full?: boolean }) {
  return <span className={full ? 'pwa-kit__mark pwa-kit__mark--full' : 'pwa-kit__mark'}>{children}</span>
}
