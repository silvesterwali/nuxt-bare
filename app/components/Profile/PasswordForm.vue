<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { changePassword } = useAuth();
const { transformToIssue } = useValidateHelper();
const toast = useToast();

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Must be at least 8 characters"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const passwordState = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordLoading = ref(false);
const passwordForm = ref<{ setErrors(errs: any[]): void } | null>(null);

async function onPasswordSubmit(event: FormSubmitEvent<any>) {
  try {
    passwordLoading.value = true;
    await changePassword({
      currentPassword: event.data.currentPassword,
      newPassword: event.data.newPassword,
    });
    passwordState.currentPassword = "";
    passwordState.newPassword = "";
    passwordState.confirmPassword = "";
    toast.add({
      title: "Success",
      description: "Password changed",
      color: "success",
    });
  } catch (err: any) {
    if (passwordForm.value) {
      const errors = transformToIssue(err);
      if (errors.length) {
        passwordForm.value.setErrors(errors as any);
      }
    }

    useToast().add({
      title: "Error",
      description: err?.message || "Failed to change password",
      color: "error",
    });
  } finally {
    passwordLoading.value = false;
  }
}
</script>

<template>
  <div class="border-l border-gray-200 pl-6">
    <h2 class="text-xl font-semibold mb-4">Change Password</h2>
    <UForm
      ref="passwordForm"
      :schema="passwordSchema"
      :state="passwordState"
      class="space-y-4"
      @submit="onPasswordSubmit"
    >
      <UFormField label="Current Password" name="currentPassword">
        <UInput
          v-model="passwordState.currentPassword"
          type="password"
          class="w-full"
        />
      </UFormField>

      <UFormField label="New Password" name="newPassword">
        <UInput
          v-model="passwordState.newPassword"
          type="password"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Confirm New Password" name="confirmPassword">
        <UInput
          v-model="passwordState.confirmPassword"
          type="password"
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end">
        <UButton
          type="submit"
          label="Update Password"
          color="neutral"
          :loading="passwordLoading"
        />
      </div>
    </UForm>
  </div>
</template>
