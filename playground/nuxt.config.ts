export default defineNuxtConfig({
  extends: [
    './base'
  ],

  // modules: ['../src/module'],
  modules: ['../dist'],
  ssr: false,
  devtools: { enabled: true },

  compatibilityDate: '2024-11-11',

  autoImport: {
    connectors: [
      './connectors/icons.ts'
    ]
  }
});
