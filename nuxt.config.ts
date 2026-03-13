// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils/module",
    "@nuxtjs/google-fonts",
    // "@nuxtjs/mcp-toolkit",
    "@nuxtjs/seo",
    "@pinia/colada-nuxt",
    "@pinia/nuxt",
    // "evlog",
    "nuxt-auth-utils",
    "nuxt-authorization",
    "nuxt-email-renderer",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
  ],

  devtools: {
    enabled: true,
  },

  nitro: {
    externals: {
      external: ["better-sqlite3"],
    },
    storage: {
      file: {
        driver: "fs",
        base: "assets",
      },
    },
  },
  // evlog: {
  //   env: {
  //     service: "nuxt-bare",
  //   },
  // },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/admin/**": { ssr: false },
  },

  compatibilityDate: "2026-01-15",

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    // Private keys (only available on server-side)
    authSecret: process.env.AUTH_SECRET,

    // Mail configuration for nodemailer
    mailHost: process.env.NUXT_MAIL_HOST || "localhost",
    mailPort: process.env.NUXT_MAIL_PORT || "587",
    mailUsername: process.env.NUXT_MAIL_USER || "",
    mailPassword: process.env.NUXT_MAIL_PASS || "",
    mailFrom: process.env.NUXT_MAIL_FROM || "noreply@example.com",
    mailSecure: process.env.NUXT_MAIL_SECURE === "true", // true for port 465, false for other ports

    // App configuration
    appName: process.env.NUXT_APP_NAME || "Nuxt App",
    appUrl: process.env.NUXT_APP_URL || "http://localhost:3000",

    // Public keys (available on both server and client-side)
    public: {
      appName: process.env.NUXT_APP_NAME || "Nuxt App",
    },
  },
  i18n: {
    vueI18n: "./i18n.config.ts",
    // list of supported locales; each can include a code, ISO, and file path
    locales: [
      { code: "en", iso: "en-US", file: "en.json" },
      { code: "id", iso: "id-ID", file: "id.json" },
    ],
    defaultLocale: "en",
    strategy: "no_prefix", // simplest strategy, no prefix on routes
    // where translation files live
    langDir: "locales/",
  },
});
