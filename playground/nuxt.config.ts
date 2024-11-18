export default defineNuxtConfig({
  extends: [
    './base'
  ],

  modules: [
    '../src/module',
    '@nuxthub/core'
  ],

  ssr: false,

  devtools: { enabled: true },

  compatibilityDate: '2024-11-11',

  autoImport: {
    connectors: [
      './connectors/icons.ts',
      './connectors/directives.ts'
    ]
  }
});
