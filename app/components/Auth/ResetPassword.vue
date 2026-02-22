<script setup lang="ts">
import { useResetPasswordForm } from "~/composables/useResetPasswordForm";
import type { AuthFormField } from "@nuxt/ui";

const { schema, onSubmit, loading, token } = useResetPasswordForm();

const fields: AuthFormField[] = [
  {
    name: "password",
    type: "password",
    label: "New Password",
    placeholder: "New password",
    icon: "i-lucide-key",
    required: true,
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirm Password",
    placeholder: "Confirm password",
    icon: "i-lucide-key",
    required: true,
  },
];
</script>

<template>
  <UAuthForm
    v-if="token"
    title="Create a New Password"
    description="Please enter your new password below."
    icon="i-lucide-lock"
    :schema="schema"
    :fields="fields"
    :loading="loading"
    :submit="{ label: 'Save New Password', block: true }"
    @submit="onSubmit"
  >
    <template #footer>
      <NuxtLink
        to="/login"
        class="text-sm font-medium text-primary hover:underline"
      >
        Back to Login
      </NuxtLink>
    </template>
  </UAuthForm>

  <UCard v-else class="w-full max-w-sm mx-auto text-center p-6 text-red-500">
    Invalid or missing reset token.
  </UCard>
</template>
