import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    {
      name: 'styled-jsx-plugin',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('node_modules')) return
        return code.replace(/<style jsx>/g, '<style>')
      }
    }
  ],
})
