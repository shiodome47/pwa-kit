import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 部品のビルド（Vite のライブラリモード）。dist/index.js を作る。
// 型（dist/*.d.ts）は tsc（tsconfig.build.json）、CSS は scripts/copy-css.mjs が作る
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
    minify: false,
    rolldownOptions: {
      // React は使う側のものを使う（部品の中に入れない）
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      // Next.js の App Router でも、そのまま使えるように（この部品はブラウザで動く）
      output: { banner: "'use client';" },
    },
  },
})
