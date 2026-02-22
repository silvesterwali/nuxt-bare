<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({
  title: "Reset Password",
  meta: [
    {
      name: "description",
      content:
        "Reset your password to regain access to your account. Enter a new password and confirm it to complete the process.",
    },
  ],
});
</script>

<template>
  <AuthResetPassword />
</template>
