export default defineNuxtConfig({
  extends: [
    './base'
  ],

  modules: [
    '../src/module',
    // '../dist/module',
    // 'nuxt-auto-import',
    '@nuxthub/core'
  ],

  ssr: false,

  devtools: { enabled: true },

  compatibilityDate: '2024-11-11',

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern'
        }
      }
    }
  },

  autoImport: {
    connectors: [
      './connectors/icons.ts',
      './connectors/directives.ts'
    ]
  }
});
