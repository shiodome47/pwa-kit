import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { runStartup } from '@shiodome47/pwa-kit'
import '@shiodome47/pwa-kit/style.css'
import './demo.css'
import { App } from './App'

// LINE の中で開かれたら外のブラウザへ移るので、そのときは画面を出さない
if (!runStartup({ serviceWorkerUrl: import.meta.env.PROD ? '/sw.js' : null })) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
