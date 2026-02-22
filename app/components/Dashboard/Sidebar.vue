<script setup lang="ts">
defineProps<{
  title?: string;
  width?: string;
}>();

const isOpen = defineModel<boolean>("open", { default: false });
</script>

<template>
  <div>
    <!-- Desktop Sidebar -->
    <aside
      class="hidden lg:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75 backdrop-blur h-full fixed inset-y-0 left-0 z-50"
    >
      <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <slot name="header">
            <UIcon name="i-lucide-box" class="w-6 h-6 text-primary-500" />
            <span class="truncate">{{ title || "Dashboard" }}</span>
          </slot>
        </NuxtLink>
      </div>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        <slot />
      </div>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <slot name="footer" />
      </div>
    </aside>

    <!-- Mobile Sidebar -->
    <USlideover v-model:open="isOpen" side="left" :ui="{ width: 'max-w-[16rem]' }">
      <template #header>
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <slot name="header">
              <UIcon name="i-lucide-box" class="w-6 h-6 text-primary-500" />
              <span class="truncate">{{ title || "Dashboard" }}</span>
            </slot>
          </NuxtLink>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="isOpen = false" />
        </div>
      </template>

      <div class="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
        <slot />
      </div>

      <template #footer>
        <div class="p-4 border-t border-gray-200 dark:border-gray-800">
          <slot name="footer" />
        </div>
      </template>
    </USlideover>
  </div>
</template>
