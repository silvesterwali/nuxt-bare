<template>
  <div>
    <div
      class="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200"
    >
      <div class="flex items-start gap-2">
        <UIcon name="i-lucide-info" class="mt-0.5 shrink-0" />
        <div>
          <p class="font-medium">Language-Specific</p>
          <p class="text-xs mt-1">
            You are currently editing in
            <strong>{{ locale.toUpperCase() }}</strong> language. Changes will
            only affect this language's version.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n();
</script>

<style scoped></style>
