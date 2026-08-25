import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      formats: ['iife'],
      name: 'TodoApp',
      fileName: () => 'todo-app.js',
    },
    outDir: resolve(__dirname, 'js'),
    emptyOutDir: false,
    sourcemap: 'inline',
    minify: false,
  },
})
