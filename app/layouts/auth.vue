<script setup lang="ts">
const isDark = computed({
  get() {
    return useColorMode().value === "dark";
  },
  set() {
    useColorMode().preference =
      useColorMode().value === "dark" ? "light" : "dark";
  },
});
</script>

<template>
  <div
    class="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
  >
    <div class="absolute top-4 right-4">
      <UButton
        :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
        color="neutral"
        variant="ghost"
        @click="isDark = !isDark"
      />
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <NuxtLink to="/" class="flex justify-center mb-6">
        <AppLogo class="h-10 w-auto text-primary-500" />
      </NuxtLink>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-120">
      <div
        class="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-800"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
