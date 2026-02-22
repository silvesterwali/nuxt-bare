<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { changePassword, loading } = useAuth();
const { transformToIssue } = useValidateHelper();
const toast = useToast();

const schema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const state = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

type Schema = typeof state;

import type { Ref, ComponentPublicInstance } from "vue";

type UFormInstance = ComponentPublicInstance<{
  clear(): void;
  setErrors(errs: any[]): void;
}>;
const form: Ref<UFormInstance | null> = ref(null);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // clear previous validation errors if the form API is available
  if (form.value && typeof form.value.clear === "function") {
    form.value.clear();
  }

  try {
    await changePassword({
      currentPassword: event.data.currentPassword,
      newPassword: event.data.newPassword,
    });
    state.currentPassword = "";
    state.newPassword = "";
    state.confirmPassword = "";
    toast.add({
      title: "Success",
      description: "Password changed successfully",
      color: "success",
    });
  } catch (err: any) {
    const errors = transformToIssue(err);
    if (errors.length) form.value?.setErrors(errors);
  }
}
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Change Password</h1>
      <UButton to="/profile" variant="ghost" icon="i-lucide-arrow-left"
        >Back to Profile</UButton
      >
    </div>

    <UCard>
      <UForm
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Current Password" name="currentPassword">
          <UInput
            v-model="state.currentPassword"
            type="password"
            class="w-full"
          />
        </UFormField>

        <UFormField label="New Password" name="newPassword">
          <UInput v-model="state.newPassword" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Confirm New Password" name="confirmPassword">
          <UInput
            v-model="state.confirmPassword"
            type="password"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton
            type="submit"
            label="Update Password"
            color="neutral"
            :loading="loading"
          />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
