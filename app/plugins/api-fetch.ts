export default defineNuxtPlugin(() => {
  // Lazy-load useI18n to avoid initialization timing issues
  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      try {
        const { locale } = useI18n();
        options.headers = options.headers || {};

        // Ensure Headers object compatibility if it's already a Headers instance
        if (options.headers instanceof Headers) {
          options.headers.set("Accept-Language", locale.value);
        } else {
          // @ts-ignore
          options.headers["Accept-Language"] = locale.value;
        }
      } catch (e) {
        // Fallback if i18n is not available yet
        options.headers = options.headers || {};
      }
    },
  });
});
