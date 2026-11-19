/**
 * 部品に出る文言。既定は日本語（JA_LABELS）。
 * 各部品の `labels={...}` で、変えたいものだけ渡せば差し替えられる。英語は EN_LABELS。
 *
 * 文の中の `**…**` は太字になる（例: '画面の下にある**共有ボタン**を押します。'）。
 * アプリの名前が入る文は関数（appName を受け取る）。
 */
export interface PwaKitLabels {
  // ── iPhone・iPad の手順（<IosInstallGuide>） ──
  /** 手順の一覧の名前（読み上げ用） */
  iosGuideName: string
  /** 手順 1: 共有ボタンを押す */
  iosStep1: string
  /** 手順 2: 「ホーム画面に追加」を押す */
  iosStep2: string
  /** 手順 3: 「追加」を押す */
  iosStep3: string
  /** 手順 4: ホーム画面のアイコンから開く。appName はアプリの名前 */
  iosStep4: (appName: string) => string
  /** Safari の画面をまねた図の中の文字（Safari の画面に合わせる） */
  mockCopy: string
  mockReadingList: string
  mockBookmark: string
  mockAddToHome: string
  mockCancel: string
  mockAdd: string

  // ── インストールの案内（<InstallGuide>） ──
  /** インストールのボタン（Android・PC の Chrome・Edge など） */
  installButton: string
  /** ホーム画面のアプリで開いているとき */
  installed: string
  /** iPhone・iPad のとき、手順の前に出す文 */
  iosIntro: string
  /** ボタンが出ないブラウザのとき */
  otherBrowser: string
  /** インストールすると良いこと（インストールしていないときに出す） */
  benefit: string

  // ── LINE の帯（<LineBanner>） ──
  lineBanner: string
}

/** 日本語（既定） */
export const JA_LABELS: PwaKitLabels = {
  iosGuideName: 'ホーム画面に追加する手順',
  iosStep1: '画面の下にある**共有ボタン**（四角から矢印が出ているもの）を押します。見当たらないときは、右下の「…」を押すと出てきます。',
  iosStep2: '出てきた一覧を**下へスクロール**して、「**ホーム画面に追加**」を押します。',
  iosStep3: '右上の「**追加**」を押します。',
  iosStep4: (appName) => `ホーム画面にできた「**${appName}**」のアイコンから開きます。`,
  mockCopy: 'コピー',
  mockReadingList: 'リーディングリストに追加',
  mockBookmark: 'ブックマークを追加',
  mockAddToHome: 'ホーム画面に追加',
  mockCancel: 'キャンセル',
  mockAdd: '追加',

  installButton: 'インストール',
  installed: '今、ホーム画面（アプリ一覧）に追加したアプリで開いています。',
  iosIntro: 'iPhone・iPad では、**Safari** で開いて、次の手順でホーム画面に追加します。',
  otherBrowser: 'ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選んでください。iPhone では Safari で開くと追加できます。',
  benefit: 'ふつうのアプリのように開けて、データも消えにくくなります。',

  lineBanner:
    'LINE の中で開いています。画面の「…」（または共有）メニューから**「ブラウザで開く」**を選んで、いつものブラウザで開き直してください。LINE の中で使うと、データがいつものブラウザとは別に保存されます。',
}

/** 英語（使うときは `labels={EN_LABELS}`） */
export const EN_LABELS: PwaKitLabels = {
  iosGuideName: 'How to add this app to your Home Screen',
  iosStep1: 'Tap the **Share button** at the bottom of the screen (a square with an arrow). If you can’t see it, tap “…” at the bottom right.',
  iosStep2: '**Scroll down** the list and tap “**Add to Home Screen**”.',
  iosStep3: 'Tap “**Add**” at the top right.',
  iosStep4: (appName) => `Open “**${appName}**” from the new icon on your Home Screen.`,
  mockCopy: 'Copy',
  mockReadingList: 'Add to Reading List',
  mockBookmark: 'Add Bookmark',
  mockAddToHome: 'Add to Home Screen',
  mockCancel: 'Cancel',
  mockAdd: 'Add',

  installButton: 'Install',
  installed: 'You are using the app from your Home Screen (app list).',
  iosIntro: 'On iPhone and iPad, open this page in **Safari** and follow these steps.',
  otherBrowser: 'Choose “Install app” or “Add to Home Screen” from your browser’s menu. On iPhone, open this page in Safari to add it.',
  benefit: 'It opens like a regular app, and your data is less likely to be deleted.',

  lineBanner:
    'You are inside LINE. From the “…” (or Share) menu, choose **“Open in browser”** to open this page in your usual browser. Data saved inside LINE is kept apart from your usual browser.',
}

/** 渡された文言を、日本語の既定に重ねる */
export function withLabels(labels?: Partial<PwaKitLabels>): PwaKitLabels {
  return labels ? { ...JA_LABELS, ...labels } : JA_LABELS
}
