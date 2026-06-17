import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  oxc: {
    include: /\.(m?ts|[jt]sx|js)$/
  },
  server: {
    port: 3000
  }
})
