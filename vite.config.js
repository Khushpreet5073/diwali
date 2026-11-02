import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.mp3', '**/*.ogg', '**/*.wav'],
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap']
  }
})
