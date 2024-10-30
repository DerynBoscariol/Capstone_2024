import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import url from '@rollup/plugin-url'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build', 
  },
  plugins: [
    react(),
    //url({
      //include: ['**/*.css'],
      //limit: 0, // Always copy asset files instead of inlining
    //}),
  ],
})