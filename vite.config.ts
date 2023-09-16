import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'



// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    server: {
        host: '0.0.0.0'
    },
    base: './',
    build: {
        minify: false,
        outDir: '../talk/web',
        emptyOutDir: true,
        sourcemap: true,
    },
})
