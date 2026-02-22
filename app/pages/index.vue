<template>
  <UContainer>
    <UPageHero
      title="Welcome to Nuxt 3 with Nuxt UI"
      description="A Nuxt/Vue-integrated UI library providing a rich set of fully-styled, accessible and highly customizable components for building modern web applications."
      headline="New release"
    />
  </UContainer>
</template>

<script setup lang="ts">
useHead({
  title: "Home",
  meta: [
    {
      name: "description",
      content:
        "Welcome to our Nuxt 3 application! Explore our features and enjoy a seamless experience.",
    },
  ],
});
</script>

<style scoped></style>
