# @shiodome47/pwa-kit

ホーム画面に追加して使う Web アプリ（**PWA** = ふつうのアプリのようにインストールできる Web ページ）の、
つまずきやすいところをまとめた React の部品です。

- **インストールの案内**: Android・PC はボタン 1 つ。iPhone・iPad は Safari の画面をまねた**図つきの手順**
- **LINE の中のブラウザ**で開かれたら、いつものブラウザで開き直す
- ホーム画面のアプリで開いているかの判定、**iPad の見分け**（Safari がパソコンのふりをする件）

- 見本: （Vercel に置いたら、ここに URL を書きます）
- English: [see below](#english)

## 入れ方

```bash
npm install @shiodome47/pwa-kit
```

React 18・19 で使えます。ほかに要るものはありません（アイコンも中に持っています）。

## 使い方

### 1. 起動のときに `runStartup()` を呼ぶ

画面を出す**前に**呼びます。LINE の中で開かれたときは外のブラウザへ移るので、`true` が返ります（そのときは画面を出さない）。

```tsx
import { createRoot } from 'react-dom/client'
import { runStartup } from '@shiodome47/pwa-kit'
import '@shiodome47/pwa-kit/style.css'

if (!runStartup({ serviceWorkerUrl: '/sw.js' })) {
  createRoot(document.getElementById('root')!).render(<App />)
}
```

| 設定 | 意味 | 既定 |
|---|---|---|
| `serviceWorkerUrl` | 登録するサービスワーカー（オフラインで動かすためのファイル）。**省けば登録しない**（サービスワーカーが無いアプリ・開発中） | 登録しない |
| `openLineInBrowser` | LINE の中で開かれたら、外のブラウザで開き直す | `true` |
| `persistStorage` | ブラウザにデータを消さないよう頼む（`navigator.storage.persist()`） | `true` |

`runStartup()` がしていること:

- LINE の中なら、URL に `?openExternalBrowser=1` を付けて開き直す（LINE が外のブラウザで開く）。開いた先では、この印を URL から消す（`#…` などはそのまま）
- ホーム画面のアプリで開いているかを覚える
- インストールの知らせ（`beforeinstallprompt`）を受け取っておく（あとでボタンから出すため）

### 2. インストールの案内を出す

```tsx
import { InstallGuide } from '@shiodome47/pwa-kit'

<InstallGuide appName="手話学習" icon="🤟" />
```

端末とブラウザに合わせて、出すものが変わります。

| 端末・ブラウザ | 出るもの |
|---|---|
| ホーム画面のアプリで開いている | 「今、ホーム画面（アプリ一覧）に追加したアプリで開いています。」 |
| Android・PC の Chrome・Edge など | 「インストール」のボタン |
| iPhone・iPad | 図つきの 4 つの手順（`<IosInstallGuide>`） |
| それ以外 | 「ブラウザのメニューから追加してください」 |

iPhone の手順だけを出したいときは `<IosInstallGuide appName="…" />`。
自分でボタンを作るときは、`useInstallState()`（`canPrompt`・`installed`）と `promptInstall()` を使います。

```tsx
const { canPrompt, installed } = useInstallState()
{canPrompt && <button onClick={() => promptInstall()}>インストール</button>}
```

### 3. LINE の帯を出す

```tsx
import { LineBanner } from '@shiodome47/pwa-kit'

<LineBanner />
```

LINE の中のブラウザで**開いたままのときだけ**出ます（自動で外のブラウザに移れなかったとき。LINE の版や設定による）。
それ以外では何も出しません。画面のいちばん上（ヘッダーの下など）に置きます。

## props

| 部品 | props |
|---|---|
| `<InstallGuide>` | `appName`（必須）・`icon`・`labels`・`theme`・`className`・`onInstalled` |
| `<IosInstallGuide>` | `appName`（必須）・`icon`・`labels`・`theme`・`className` |
| `<LineBanner>` | `labels`・`theme`・`className`・`show`（出すかどうかを決める。見本・テスト用） |

- `appName`: アプリの名前。iPhone の手順の「ホーム画面にできた『〇〇』のアイコン」に出ます。manifest の `short_name`（ホーム画面のアイコンの下に出る名前）と同じにします
- `icon`: 手順の図に出すアイコン（絵文字・`<img>` など）。省くと名前の 1 文字目
- `theme`: `'light'`・`'dark'`・`'system'`（既定。端末の設定に合わせる）。アプリに明るい／暗いの切り替えがあるなら、アプリの設定をそのまま渡します

### 文言を変える（`labels`）

既定は日本語です。変えたいものだけ渡せば、残りは日本語のままです。英語は `EN_LABELS`。
文の中の `**…**` は太字になります。アプリの名前が入る文は関数です。

```tsx
import { EN_LABELS, InstallGuide } from '@shiodome47/pwa-kit'

<InstallGuide appName="My App" labels={EN_LABELS} />

<InstallGuide
  appName="手話学習"
  labels={{
    iosStep4: (name) => `ホーム画面にできた「**${name}**」のアイコンから開きます。`,
    lineBanner: 'LINE の中で開いています。…',
  }}
/>
```

文言の一覧は `PwaKitLabels`（`src/labels.ts`）にあります。

## 見た目（CSS）

```ts
import '@shiodome47/pwa-kit/style.css'
```

- すべて `.pwa-kit`（部品のいちばん外の要素）の中だけに効きます。使う側のページの見た目は変えません。Tailwind は要りません
- 明るい表示・暗い表示の両方があります（`theme`）
- 色や大きさは CSS の変数（`--pk-…`）で変えられます

```css
.pwa-kit {
  --pk-accent: #3b82f6;       /* 押すところの枠 */
  --pk-accent-text: #2563eb;  /* アクセントの色の文字・アイコン */
  --pk-accent-soft: #dbeafe;  /* ホーム画面のアイコンの背景 */
  --pk-button: #2563eb;       /* インストールのボタン */
  --pk-button-hover: #3b82f6;
}
```

| 変数 | 意味 |
|---|---|
| `--pk-accent`・`--pk-accent-text`・`--pk-accent-soft` | アクセントの色（枠・文字・うすい背景） |
| `--pk-button`・`--pk-button-hover`・`--pk-on-button` | インストールのボタン（背景・マウスを乗せたとき・文字） |
| `--pk-text`・`--pk-text-strong`・`--pk-muted` | 文字（ふつう・太字・小さな説明） |
| `--pk-surface`・`--pk-border`・`--pk-divider` | 図・LINE の帯の背景、枠、区切り線 |
| `--pk-step`・`--pk-step-text` | 手順の番号の丸 |
| `--pk-radius`・`--pk-font-size`・`--pk-font-size-small` | 角の丸み・文字の大きさ |

明るい表示・暗い表示で分けて変えるときは、`.pwa-kit[data-theme='dark']` や `@media (prefers-color-scheme: dark)` の中で上書きします。

## 見分けだけ使う

| 関数 | すること |
|---|---|
| `isAppleDevice(ua, maxTouchPoints?)` | iPhone・iPad か（ブラウザはどれでも） |
| `isIosSafari(ua, maxTouchPoints?)` | iPhone・iPad の Safari か（Chrome・LINE などは別） |
| `isStandalone()` | ホーム画面のアプリで開いているか |
| `isLineInAppBrowser(ua)` | LINE の中のブラウザか |
| `externalBrowserUrl(href, ua)`・`withoutLineParam(href)` | 外のブラウザで開き直す URL・開いた先で印を消した URL |
| `getInstallState()`・`subscribeInstallState(fn)` | インストールの状態を React の外で読む・変わったら知る |

## 気をつけること（つまずきやすいところ）

### iPad は、パソコンのふりをする

iPad の Safari は、ふつう「Mac のパソコン」（`Macintosh`）と名乗ります。名前だけでは Mac と見分けられません。
そこで**指で触れるか**（`navigator.maxTouchPoints > 1`）で見分けています（`isAppleDevice`）。

### LINE の中のブラウザ

LINE で送られたリンクを開くと、LINE の中のブラウザで開きます。ここで使うと:

- データ（保存したもの）が、いつものブラウザとは**別の場所**に保存されて、あとで見えなくなる
- ホーム画面に追加できない

そこで `runStartup()` は、URL に `?openExternalBrowser=1` を付けて開き直します（LINE が外のブラウザで開く、LINE の決まり）。
それでも移れなかったとき（LINE の版や設定による）のために、`<LineBanner>` で「ブラウザで開く」を案内します。

### iPhone: Safari とホーム画面のアプリは、データが別

- Safari と、ホーム画面に追加したアプリは**別の入れ物**です。Safari で保存したデータは、ホーム画面のアプリからは見えません（逆も同じ）。
  ホーム画面に追加してもらうなら、**追加してから**使い始めてもらうよう案内します
- Safari は、しばらく開かないサイトのデータを消すことがあります。ホーム画面のアプリにすると消えにくくなります
- iPhone では、インストールのボタンは出せません（`beforeinstallprompt` が無い）。共有メニューから自分で追加してもらうので、図つきの手順を出しています
- iPhone の Chrome などでも、共有メニューから追加できます（iOS 16.4 から）。そのため手順は、Safari に限らず iPhone・iPad で出しています

### サービスワーカー

この部品にサービスワーカー（`sw.js`）そのものは入っていません。オフラインで動かすときは、アプリで用意して `serviceWorkerUrl` に渡します。
Android・PC の Chrome でインストールのボタンを出すには、manifest（`manifest.webmanifest`）とサービスワーカーが要ります。

## 開発

```bash
npm install
npm test            # テスト（vitest）
npm run typecheck   # 型の確かめ
npm run build       # dist/ を作る（Vite のライブラリモード）
npm run dev         # 見本のページ（examples/web）
```

公開の手順は [`PUBLISHING.md`](PUBLISHING.md)。

## ライセンス

MIT。アイコンの絵の形は [Lucide](https://lucide.dev)（ISC ライセンス）と同じです。

---

## English

React parts for the tricky bits of **PWAs** (web apps you add to the Home Screen).

- **Install guide**: a button on Android / desktop; **illustrated steps** that mimic Safari’s screens on iPhone and iPad
- Re-open the page in the usual browser when it was opened **inside LINE’s in-app browser**
- Detect standalone mode (opened from the Home Screen) and **iPadOS** (iPad Safari pretends to be a Mac)

```bash
npm install @shiodome47/pwa-kit
```

React 18 or 19. No other dependencies (icons are built in).

```tsx
import { createRoot } from 'react-dom/client'
import { EN_LABELS, InstallGuide, LineBanner, runStartup } from '@shiodome47/pwa-kit'
import '@shiodome47/pwa-kit/style.css'

// Call before rendering. Returns true while it is moving out of LINE (don't render then).
// Omit serviceWorkerUrl if your app has no service worker.
if (!runStartup({ serviceWorkerUrl: '/sw.js' })) {
  createRoot(root).render(<App />)
}

<LineBanner labels={EN_LABELS} />
<InstallGuide appName="My App" labels={EN_LABELS} />
```

- `<InstallGuide appName icon labels theme className onInstalled />`: shows a note when installed, an Install button when the browser allows it, the iPhone steps on Apple devices, or a hint to use the browser menu
- `<IosInstallGuide appName icon labels theme className />`: just the 4 illustrated iPhone / iPad steps
- `<LineBanner labels theme className show />`: shown only inside LINE’s browser
- `useInstallState()` / `promptInstall()`: build your own install button
- `isAppleDevice` / `isIosSafari` / `isStandalone` / `isLineInAppBrowser` / `externalBrowserUrl` / `withoutLineParam`

**Labels** default to Japanese. Pass only what you want to change; `EN_LABELS` is English. `**…**` in a label becomes bold.

**Styles** apply only inside `.pwa-kit`. `theme` is `'light' | 'dark' | 'system'` (default). Change colors with CSS variables such as `--pk-accent`, `--pk-accent-text`, `--pk-button` (see the table above).

**Gotchas**

- **iPad** Safari reports itself as a Mac; touch support (`maxTouchPoints > 1`) tells them apart.
- **LINE**: data saved inside LINE’s browser is kept apart from the usual browser, and you can’t add to the Home Screen from it. `runStartup()` adds `?openExternalBrowser=1` so LINE opens the page externally, and removes it afterwards.
- **iPhone**: Safari and the Home Screen app **do not share data**. Ask people to add the app first, then start using it. Safari may also delete data of sites not visited for a while; Home Screen apps keep it better. iOS has no install prompt, hence the illustrated steps.
- This package does not include a service worker; bring your own and pass `serviceWorkerUrl`.

MIT License.
