<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { requestPasswordReset, loading } = useAuth();
const toast = useToast();

const schema = z.object({
  email: z.string().email("Invalid email"),
});

const state = reactive({
  email: "",
});

type Schema = typeof state;

const success = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await requestPasswordReset(event.data);
    success.value = true;
    toast.add({ title: "Success", description: "Reset link sent to your email", color: "success" });
  } catch (err: any) {
    // Handled in composable
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
    <AuthForm
      title="Forgot Password"
      description="Enter your email address to reset your password."
      icon="i-lucide-circle-help"
      :schema="schema"
      :state="state"
      :loading="loading"
      :submit-button="{ label: 'Send Reset Link', trailingIcon: 'i-lucide-send' }"
      @submit="onSubmit"
    >
      <template #fields>
        <template v-if="success">
          <div class="text-center space-y-4 mb-4">
            <p class="text-green-600 font-medium">Reset link sent to your email!</p>
            <UButton to="/login" label="Return to Login" block variant="outline" color="gray" />
          </div>
        </template>
        <template v-else>
          <UFormField label="Email" name="email" required>
            <UInput
              v-model="state.email"
              placeholder="you@example.com"
              icon="i-lucide-mail"
              class="w-full"
              autofocus
            />
          </UFormField>
        </template>
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
