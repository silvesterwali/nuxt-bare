<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>

<template>
  <AdminCategoryList />
</template>
