import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function removeModuleType(): Plugin {
  return {
    name: 'remove-module-type',
    transformIndexHtml(html: string) {
      return html
        .replace(/\s+type="module"/g, '')
        .replace(/\s+crossorigin/g, '')
        .replace(/<script src=/g, '<script defer src=');
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), removeModuleType()],
  base: './',
  build: {
    rolldownOptions: {
      output: {
        format: 'iife',
      },
    },
  },
})
