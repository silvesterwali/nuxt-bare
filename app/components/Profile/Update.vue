<script setup lang="ts">
import ProfileForm from "~/components/Profile/ProfileForm.vue";
import PasswordForm from "~/components/Profile/PasswordForm.vue";

// no additional script logic here; each form handles its own state and actions
</script>

<template>
  <UContainer>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Profile</h1>
    </div>

    <UCard>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProfileForm />
        <PasswordForm />
      </div>
    </UCard>
  </UContainer>
</template>
