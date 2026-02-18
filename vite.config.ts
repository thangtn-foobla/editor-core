/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'EditorCore',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [],
    }
  },
  test: {
    globals: true,
    environment: 'node',
  }
})
