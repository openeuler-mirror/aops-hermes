import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
// import AutoImport from 'unplugin-auto-import/vite';
// import Components from 'unplugin-vue-components/vite';

export default () => {
  return defineConfig({
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
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

      // https://github.com/antfu/unplugin-auto-import
      // AutoImport({
      //   imports: ['vue', 'vue-router'],
      //   dts: 'src/typings/auto-imports.d.ts',
      //   vueTemplate: true,
      // }),

      // https://github.com/antfu/unplugin-vue-components
      // Components({
      //   extensions: ['vue'],
      //   include: [/\.vue$/, /\.vue\?vue/],
      //   // dts: 'src/typings/components.d.ts',
      //   dts: true,
      // }),
    ],
    server: {
      host: 'localhost',
      hmr: true,
      port: 8000,
      proxy: {
        '/accounts': {
          target: 'http://localhost:11111',
          secure: false,
          changeOrigin: true,
          ws: false,
        },
        '/hosts': {
          target: 'http://localhost:11111',
          secure: false,
          changeOrigin: true,
          ws: false,
        },
        '/distribute': {
          target: 'http://localhost:11111',
          secure: false,
          changeOrigin: true,
          ws: false,
        },
        '/vulnerabilities': {
          target: 'http://localhost:11111',
          secure: false,
          changeOrigin: true,
          ws: false,
        },
      },
    },
  })
}
