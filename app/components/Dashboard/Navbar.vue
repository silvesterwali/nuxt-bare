<script setup lang="ts">
defineProps<{
  title?: string;
  badge?: string | number;
  icon?: string;
  to?: string;
}>();

const isDark = computed({
  get() {
    return useColorMode().value === "dark";
  },
  set() {
    useColorMode().preference =
      useColorMode().value === "dark" ? "light" : "dark";
  },
});

const { locale, locales, setLocale } = useI18n();
const router = useRouter();

const localeItems = computed(() => {
  const uniqueLocales = locales.value.filter(
    (l: any, index: number, self: any[]) =>
      index === self.findIndex((t: any) => t.code === l.code),
  );
  return uniqueLocales.map((l: any) => ({
    label: l.code === "en" ? "English" : l.code === "id" ? "Indonesia" : l.code,
    onSelect: async () => {
      await setLocale(l.code);
      // Reload the page to apply language changes throughout
      await router.go(0);
    },
    icon: locale.value === l.code ? "i-lucide-check" : undefined,
  }));
});
</script>

<template>
  <header
    class="flex-shrink-0 h-16 flex items-center gap-4 px-4 sm:px-6 w-full border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75 backdrop-blur z-10 sticky top-0"
  >
    <!-- Left slot: Mobile menu button (handled by parent typically, or hidden) -->
    <slot name="left">
      <div class="flex items-center gap-1.5 min-w-0">
        <UIcon
          v-if="icon"
          :name="icon"
          class="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400"
        />
        <h1
          v-if="title"
          class="truncate font-semibold text-gray-900 dark:text-white"
        >
          {{ title }}
        </h1>
        <UBadge v-if="badge" :label="badge" variant="subtle" size="xs" />
      </div>
    </slot>

    <!-- Center/Right slot -->
    <div class="flex-1 flex items-center justify-end gap-1.5 min-w-0">
      <slot name="right" />

      <UDropdownMenu :items="localeItems">
        <UButton icon="i-lucide-languages" color="neutral" variant="ghost" />
      </UDropdownMenu>

      <UButton
        :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
        color="neutral"
        variant="ghost"
        to=""
        @click="isDark = !isDark"
      />

      <slot name="user-menu" />
    </div>
  </header>
</template>
