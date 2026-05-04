import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Set to '/your-repo-name/' if deploying to username.github.io/repo-name/
  // Set to '/' if using a custom domain
  base: process.env.VITE_BASE_PATH || '/'
})
