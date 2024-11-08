export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: false,
  devtools: { enabled: true },
  compatibilityDate: '2024-11-08',

  autoImport: {
    connectors: [
      './connectors/icons.ts'
    ]
  }
});
