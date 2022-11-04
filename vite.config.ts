import { ConfigEnv, UserConfig, loadEnv } from 'vite'
import { viteMockServe } from 'vite-plugin-mock'
import createVuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'
import { VitePWA } from 'vite-plugin-pwa'

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
      VitePWA({
        mode: 'development',
        base: '/',
        // registerType: process.env.CLAIMS === 'true' ? 'autoUpdate' : undefined,
        includeAssets: ['favicon.svg'],
        manifest: {
          id: 'master',
          name: 'tnt-admin 中后台',
          short_name: 'tnt-admin',
          description: 'tnt-admin 中后台解决方案',

          dir: 'ltr',
          display: 'standalone',
          theme_color: '#0052d9', // 主题颜色，和 index.html 中的保持一致
          background_color: '#FFFFFF',

          start_url: '/master',
          lang: 'zh-Hans-CN',
          // PWA 要求至少有一张 192x192 和 512x512 的图片
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        registerType: 'autoUpdate',
        devOptions: { enabled: true }, // enabled: true 开发模式启用生成文件，默认路径在：dev-dist
        workbox: {
          runtimeCaching: [
            // {
            //   urlPattern: /someInterface/i, // 接口缓存 此处填你想缓存的接口正则匹配
            //   handler: 'CacheFirst',
            //   options: {
            //     cacheName: 'interface-cache',
            //   },
            // },
            // {
            //   urlPattern: /(.*?)\.(js|css|ts|html)/, // js /css /ts /html 静态资源缓存
            //   handler: 'CacheFirst',
            //   options: {
            //     cacheName: 'js-css-cache',
            //   },
            // },
            {
              urlPattern: /(.*?)\.(png|jpe?g|gif|bmp|psd|tiff|tga|eps)/, // 图片缓存
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
              },
            },
          ],
        },
      }),
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
