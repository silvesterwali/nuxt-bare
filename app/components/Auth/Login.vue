<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const { login, loading } = useAuth();
const { transformToIssue } = useValidateHelper();
const toast = useToast();

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

const authForm = useTemplateRef("authForm");

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "text", // use text to avoid browser email validation quirks
    label: "Email Address",
    placeholder: "name@example.com",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "remember",
    type: "checkbox",
    label: "Remember me",
  },
];

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
    if (authForm.value?.formRef) {
      const errors = transformToIssue(err);
      if (errors && errors.length) {
        authForm.value.formRef.setErrors(errors);
      }
    }

    toast.add({
      title: "Error",
      description: err?.message || "Failed to login",
      color: "error",
    });
  }
}
</script>

<template>
  <UAuthForm
    ref="authForm"
    title="Login"
    description="Welcome back"
    icon="i-lucide-lock"
    :schema="schema"
    :fields="fields"
    :loading="loading"
    :submit="{ label: 'Login', block: true }"
    @submit="onSubmit"
  >
    <!-- password hint slot shows forgot link under inputs -->
    <template #password-hint>
      <NuxtLink
        to="/forgot-password"
        class="text-sm font-medium text-primary hover:underline"
      >
        Forgot password?
      </NuxtLink>
    </template>
  </UAuthForm>
</template>
