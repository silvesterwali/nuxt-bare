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

const config = useRuntimeConfig();
const appName = computed(() => config.public.appName || "App");
</script>

<template>
  <div class="min-h-screen flex bg-default">
    <!-- Brand panel — desktop only -->
    <div
      class="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-14 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden"
    >
      <!-- Decorative blobs -->
      <div
        class="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-white/[0.04] rounded-full"
      />
      <div
        class="absolute -bottom-20 -left-20 w-80 h-80 bg-white/[0.04] rounded-full"
      />
      <div
        class="absolute top-1/2 left-1/3 w-48 h-48 bg-white/[0.03] rounded-full -translate-y-1/2"
      />

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-3 relative z-10">
        <AppLogo class="h-7 w-auto text-white" />
        <span class="text-lg font-semibold tracking-tight">{{ appName }}</span>
      </NuxtLink>

      <!-- Tagline -->
      <div class="relative z-10 space-y-5">
        <p
          class="text-[2.25rem] font-display font-bold leading-tight tracking-tight"
        >
          Built for modern teams.
        </p>
        <p class="text-primary-200 text-base leading-relaxed max-w-xs">
          Manage content, users, and media — all in one elegant platform.
        </p>
      </div>

      <p class="text-primary-300/60 text-xs relative z-10">
        © {{ new Date().getFullYear() }} {{ appName }}. All rights reserved.
      </p>
    </div>

    <!-- Form panel -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Top bar -->
      <div class="flex items-center justify-between px-6 pt-5 lg:justify-end">
        <NuxtLink to="/" class="flex items-center gap-2 lg:hidden">
          <AppLogo class="h-7 w-auto" />
          <span class="font-bold text-highlighted text-base">{{
            appName
          }}</span>
        </NuxtLink>
        <UButton
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="isDark = !isDark"
        />
      </div>

      <!-- Centered form -->
      <div class="flex-1 flex items-center justify-center px-6 py-10">
        <div class="w-full max-w-sm">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
