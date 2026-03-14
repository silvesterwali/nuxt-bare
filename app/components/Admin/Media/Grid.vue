<script setup lang="ts">
import type { Media } from "@/types/db";

const props = withDefaults(
  defineProps<{
    media: Media[];
    loading?: boolean;
    selectMode?: boolean;
  }>(),
  {
    media: () => [],
    loading: false,
    selectMode: false,
  },
);

const emit = defineEmits<{
  (e: "view", url: string): void;
  (e: "delete", id: number): void;
  (e: "select", id: number): void;
}>();

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function handleCardClick(item: Media) {
  if (props.selectMode) {
    emit("select", item.id);
  }
}
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div
        v-for="i in 6"
        :key="i"
        class="rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse aspect-square"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!media.length"
      class="flex flex-col items-center justify-center py-12 text-gray-400"
    >
      <UIcon name="i-lucide-image" class="w-10 h-10 mb-2" />
      <span>No media found</span>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div
        v-for="item in media"
        :key="item.id"
        class="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        :class="
          selectMode
            ? 'cursor-pointer hover:border-primary-500 hover:ring-2 hover:ring-primary-500/30 transition'
            : ''
        "
        @click="handleCardClick(item)"
      >
        <!-- Image -->
        <div
          class="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
        >
          <img
            v-if="item.type === 'image'"
            :src="item.thumbnail?.full_path || item.full_path || ''"
            :alt="item.originalName"
            class="w-full h-full object-cover transition group-hover:scale-105"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-4xl"
          >
            📄
          </div>
        </div>

        <!-- Info -->
        <div class="p-2">
          <p
            class="text-xs font-medium truncate text-gray-700 dark:text-gray-200"
          >
            {{ item.originalName }}
          </p>
          <p class="text-xs text-gray-400">{{ formatBytes(item.size) }}</p>
        </div>

        <!-- Actions overlay (non-select mode) -->
        <div
          v-if="!selectMode"
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2"
        >
          <UButton
            icon="i-lucide-eye"
            size="sm"
            color="neutral"
            variant="solid"
            aria-label="View"
            @click.stop="emit('view', item.full_path || '')"
          />
          <UButton
            icon="i-lucide-trash-2"
            size="sm"
            color="error"
            variant="solid"
            aria-label="Delete"
            @click.stop="emit('delete', item.id)"
          />
        </div>

        <!-- Select overlay indicator -->
        <div
          v-if="selectMode"
          class="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-2"
        >
          <UBadge color="primary" variant="solid" size="sm">Pilih</UBadge>
        </div>
      </div>
    </div>
  </div>
</template>
