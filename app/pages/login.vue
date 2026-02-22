<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: "guest",
});

useHead({
  title: "Login",
  meta: [
    {
      name: "description",
      content:
        "Login to your account to access exclusive features and personalized content.",
    },
  ],
});
</script>

<template>
  <AuthLogin />
</template>
