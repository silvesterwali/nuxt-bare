<script setup lang="ts">
import { useResetPasswordForm } from "~/composables/useResetPasswordForm";

const { schema, state, onSubmit, loading, token } = useResetPasswordForm();
</script>

<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950"
  >
    <UCard
      v-if="!token"
      class="w-full max-w-sm mx-auto text-center p-6 text-red-500"
    >
      Invalid or missing reset token.
    </UCard>

    <AuthForm
      v-else
      title="Reset Password"
      description="Enter your new password below."
      icon="i-lucide-lock"
      :schema="schema"
      :state="state"
      :loading="loading"
      :submit-button="{
        label: 'Reset Password',
        trailingIcon: 'i-lucide-check',
      }"
      @submit="onSubmit"
    >
      <template #fields>
        <UFormField label="New Password" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="New password"
            icon="i-lucide-key"
            class="w-full"
            autofocus
          />
        </UFormField>

        <UFormField label="Confirm Password" name="confirmPassword" required>
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Confirm password"
            icon="i-lucide-key"
            class="w-full"
          />
        </UFormField>
      </template>

      <template #footer>
        <div class="text-sm">
          <NuxtLink
            to="/login"
            class="font-medium text-primary hover:text-primary-600 dark:hover:text-primary-400"
          >
            Back to Login
          </NuxtLink>
        </div>
      </template>
    </AuthForm>
  </div>
</template>
