import { defineConfig, resolveBaseUrl } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path, {resolve} from 'path'
import dts from 'vite-plugin-dts'
import fs from 'fs'
import json from '@rollup/plugin-json'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ rollupTypes: false, insertTypesEntry: true, afterBuild: copyAssets })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/ui-components'),
      name: 'XComponent',
      fileName: 'x-component',

    },
    emptyOutDir: true,
    assetsDir: resolve(__dirname, './src/assets'),
    
    rollupOptions: {
      external: ['react', 'styled-components'],
      plugins: [],
    },
    copyPublicDir: true
  },
  server: {
    host: '0.0.0.0'
  },
  assetsInclude: ['src/assets'],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@libs': resolve(__dirname, './src/libs'),
      '@dist': resolve(__dirname, './dist'),
      '@public': resolve(__dirname, './public'),
    }
  },
  
})

async function copyAssets () {
  fs.cpSync(path.resolve(__dirname, './src/assets'), path.resolve(__dirname, './dist/assets'), {recursive: true})
}