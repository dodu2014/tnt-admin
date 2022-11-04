import { ConfigEnv, UserConfig, loadEnv } from 'vite'
import { viteMockServe } from 'vite-plugin-mock'
import createVuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'

import path from 'path'
import fs from 'fs'

const CWD = process.cwd()

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_BASE_URL, VITE_PROXY_HOST } = loadEnv(mode, CWD)
  return {
    base: VITE_BASE_URL,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${path.resolve('src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
    },

    plugins: [
      createVuePlugin(),
      vueJsx(),
      viteMockServe({
        mockPath: 'mock',
        localEnabled: true,
      }),
      svgLoader(),
    ],

    server: {
      port: 3000,
      host: '0.0.0.0',
      // 启用 https，参考：https://blog.csdn.net/xfjpeter/article/details/121480873
      https: {
        cert: fs.readFileSync(path.join(__dirname, './src/ssl/cert.crt')),
        key: fs.readFileSync(path.join(__dirname, './src/ssl/cert.key')),
      },
      proxy: {
        '/api': {
          target: VITE_PROXY_HOST,
          changeOrigin: true,
          // secure: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  }
}
