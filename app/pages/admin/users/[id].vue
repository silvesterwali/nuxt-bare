<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const route = useRoute();
const userId = computed(() => route.params.id as string);
</script>

<template>
  <AdminUserForm :user-id="userId" />
</template>
