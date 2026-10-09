// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss','@nuxt/icon'],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5179' // Kendi .NET Core API adresi
    }
  }
})
