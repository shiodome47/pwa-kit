// 見本のページのサービスワーカー（何もしない）。Chrome・Edge でインストールのボタンを出すために置いている
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
