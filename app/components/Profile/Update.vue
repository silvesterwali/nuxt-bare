<script setup lang="ts">
import ProfileForm from "~/components/Profile/ProfileForm.vue";
import PasswordForm from "~/components/Profile/PasswordForm.vue";

// no additional script logic here; each form handles its own state and actions
</script>

<template>
  <UContainer class="max-w-3xl">
    <CommonPageHeader
      title="Account Settings"
      description="Manage your personal information and security credentials"
    />

    <div class="space-y-6">
      <UCard>
        <ProfileForm />
      </UCard>

      <UCard>
        <PasswordForm />
      </UCard>
    </div>
  </UContainer>
</template>
