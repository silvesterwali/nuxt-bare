export default defineNuxtPlugin(() => {
  globalThis.$fetch = $fetch.create({
    onRequest(ctx) {
      const opts = ctx.options; // rename here
      try {
        const { locale } = useNuxtApp().$i18n;
        opts.headers = opts.headers || {};

        if (opts.headers instanceof Headers) {
          opts.headers.set("Accept-Language", locale.value);
        } else {
          // @ts-ignore
          opts.headers["Accept-Language"] = locale.value;
        }
      } catch (e) {
        opts.headers = opts.headers || {};
      }
    },
  });
});
