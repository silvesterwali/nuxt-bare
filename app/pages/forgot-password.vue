<script setup lang="ts">
definePageMeta({
  layout: "auth",
});
useHead({
  title: "Forgot Password",
  meta: [
    {
      name: "description",
      content:
        "Forgot your password? Enter your email address to receive a password reset link and regain access to your account.",
    },
  ],
});
</script>

<template>
  <AuthForgotPassword />
</template>
