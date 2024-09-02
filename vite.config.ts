// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

const BASE_PROXY_URL = 'http://localhost:11111'

export default () => {
  return defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    envPrefix: 'A_OPS',
    plugins: [
      vue(),
      // https://github.com/anncwb/vite-plugin-mock/tree/master/#readme
      viteMockServe({
        logger: true,
        mockPath: 'mock',
        localEnabled: false,
      }),
    ],
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            try {
              if (id.includes('node_modules')) {
                const name = id.split('node_modules/')[1].split('/')
                if (name[0] === '.pnpm') {
                  return name[1]
                }
                else {
                  return name[0]
                }
              }
            }
            catch (error) {
              console.error(error)
            }
          },

        },
      },
    },
    server: {
      host: '0.0.0.0',
      hmr: true,
      port: 8080,
      proxy: {
        '/accounts': {
          target: BASE_PROXY_URL,
          secure: false,
          changeOrigin: true,
          ws: false,
        },
        '/hosts': {
          target: BASE_PROXY_URL,
          secure: false,
          changeOrigin: true,
          ws: false,
        },
        '/distribute': {
          target: BASE_PROXY_URL,
          secure: false,
          changeOrigin: true,
          ws: false,
        },
        '/vulnerabilities': {
          target: BASE_PROXY_URL,
          secure: false,
          changeOrigin: true,
          ws: false,
        },
        '/conftrace': {
          target: BASE_PROXY_URL,
          secure: false,
          changeOrigin: true,
          ws: false,
        },
        '/operations': {
          target: BASE_PROXY_URL,
          secure: false,
          changeOrigin: true,
          ws: false,
        },
      },
    },
  })
}
