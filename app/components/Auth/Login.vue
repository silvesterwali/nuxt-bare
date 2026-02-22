<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { login, loading } = useAuth();
const { transformToIssue } = useValidateHelper();
const toast = useToast();

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

const state = reactive({
  email: "",
  password: "",
});

type Schema = typeof state;

const authForm = useTemplateRef("authForm");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await login(event.data);
    toast.add({
      title: "Success",
      description: "Logged in successfully",
      color: "success",
    });
    navigateTo("/");
  } catch (err: any) {
    const errors = transformToIssue(err);
    if (errors && errors.length) authForm.value?.form?.setErrors(errors);
  }
}
</script>

<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950"
  >
    <AuthForm
      ref="authForm"
      title="Login"
      description="Welcome back! Please login to your account."
      icon="i-lucide-lock"
      :schema="schema"
      :state="state"
      :loading="loading"
      :submit-button="{ label: 'Login', trailingIcon: 'i-lucide-arrow-right' }"
      @submit="onSubmit"
    >
      <template #fields>
        <UFormField label="Email" name="email" required>
          <UInput
            v-model="state.email"
            placeholder="you@example.com"
            icon="i-lucide-mail"
            class="w-full"
            autofocus
          />
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="********"
            icon="i-lucide-key"
            class="w-full"
          />
        </UFormField>
      </template>

      <template #footer>
        <div class="text-sm">
          <NuxtLink
            to="/forgot-password"
            class="font-medium text-primary hover:text-primary-600 dark:hover:text-primary-400"
          >
            Forgot password?
          </NuxtLink>
        </div>
      </template>
    </AuthForm>
  </div>
</template>
