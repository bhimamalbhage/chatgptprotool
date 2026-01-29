import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        rollupOptions: {
            input: resolve(__dirname, 'src/content/index.tsx'),
            output: {
                format: 'iife',
                entryFileNames: 'assets/content.js',
                name: 'ContentScript',
                extend: true,
                globals: {
                    chrome: 'chrome' // Avoid potential scope issues
                }
            }
        }
    }
})
