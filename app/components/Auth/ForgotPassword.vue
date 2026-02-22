<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const { requestPasswordReset, loading } = useAuth();
const toast = useToast();

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
});

type Schema = z.output<typeof schema>;

const success = ref(false);

const fields = computed<AuthFormField[]>(() =>
  success.value
    ? []
    : [
        {
          name: "email",
          type: "text", // use text to allow trimming and avoid built-in validation
          label: "Email",
          placeholder: "you@example.com",
          icon: "i-lucide-mail",
          required: true,
        },
      ],
);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await requestPasswordReset(event.data);
    success.value = true;
    toast.add({
      title: "Success",
      description: "Reset link sent to your email",
      color: "success",
    });
  } catch (err: any) {
    // Handled in composable
  }
}
</script>

<template>
  <UAuthForm
    title="Forgot Password"
    description="No worries, it happens."
    icon="i-lucide-circle-help"
    :schema="schema"
    :fields="fields"
    :loading="loading"
    :submit="{ label: 'Send Reset Link', block: true }"
    @submit="onSubmit"
  >
    <template #validation>
      <div v-if="success" class="text-center space-y-4 mb-4">
        <p class="text-green-600 font-medium">Reset link sent to your email!</p>
        <UButton
          to="/login"
          label="Return to Login"
          block
          variant="outline"
          color="neutral"
        />
      </div>
    </template>

    <template #footer>
      <NuxtLink
        to="/login"
        class="text-sm font-medium text-primary hover:underline"
      >
        Back to Login
      </NuxtLink>
    </template>
  </UAuthForm>
</template>
