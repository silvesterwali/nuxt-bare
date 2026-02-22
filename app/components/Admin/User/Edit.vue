<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { transformToIssue } = useValidateHelper();
const toast = useToast();

const route = useRoute();
const userId = computed(() => route.params.id as string);

const { data: user, isLoading: isFetching } = useUserQuery(userId);
const { mutateAsync: updateUser, isLoading: isUpdating } =
  useUserUpdateMutation();

const passLoading = ref(false);
const passForm = ref<{ setErrors(errs: any[]): void } | null>(null);

async function onPassSubmit(event: FormSubmitEvent<any>) {
  try {
    passLoading.value = true;
    await $fetch(`/api/admin/users/${userId.value}/password`, {
      method: "PATCH",
      body: event.data,
    });
    toast.add({
      title: "Success",
      description: "Password reset",
      color: "success",
    });
    passState.newPassword = "";
    passState.confirmPassword = "";
  } catch (err: any) {
    const errors = transformToIssue(err);
    if (errors.length) passForm.value?.setErrors(errors as any);
  } finally {
    passLoading.value = false;
  }
}

// Reuse schema but password optional for edit
const schema = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "user", "moderator"]),
});

const state = reactive({
  email: "",
  firstName: "",
  lastName: "",
  role: "user" as const,
});

// admin password reset schema
const passSchema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const passState = reactive({
  newPassword: "",
  confirmPassword: "",
});

type Schema = z.output<typeof schema>;

const roles = ["admin", "user", "moderator"];
import type { Ref, ComponentPublicInstance } from "vue";

type UFormInstance = ComponentPublicInstance<{
  clear(): void;
  setErrors(errs: any[]): void;
}>;
const form: Ref<UFormInstance | null> = ref(null);

watchEffect(() => {
  if (user.value) {
    state.email = user.value.email;
    state.firstName = user.value.profile?.firstName || "";
    state.lastName = user.value.profile?.lastName || "";
    state.role = user.value.role as any;
  }
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await updateUser({
      id: userId.value,
      payload: {
        ...event.data,
        name: `${event.data.firstName} ${event.data.lastName}`.trim(),
      },
    });
    // Toast handled in mutation
    navigateTo("/admin/users");
  } catch (err: any) {
    const errors = transformToIssue(err);
    if (errors.length) form.value?.setErrors(errors);
  }
}
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Edit User</h1>
      <UButton to="/admin/users" variant="ghost" icon="i-lucide-arrow-left"
        >Back to List</UButton
      >
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- user details card -->
      <UCard class="shadow-lg rounded-lg">
        <div v-if="isFetching && !user">Loading...</div>
        <UForm
          ref="form"
          v-else
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField label="Email" name="email">
            <UInput v-model="state.email" disabled class="w-full" />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="First Name" name="firstName">
              <UInput v-model="state.firstName" class="w-full" />
            </UFormField>
            <UFormField label="Last Name" name="lastName">
              <UInput v-model="state.lastName" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Role" name="role">
            <USelect v-model="state.role" :options="roles" class="w-full" />
          </UFormField>

          <div class="flex justify-end">
            <UButton type="submit" label="Update User" :loading="isUpdating" />
          </div>
        </UForm>
      </UCard>

      <!-- password reset card for admin -->
      <UCard>
        <h2 class="text-xl font-semibold mb-4">Reset Password</h2>
        <UForm
          ref="passForm"
          :schema="passSchema"
          :state="passState"
          class="space-y-4"
          @submit="onPassSubmit"
        >
          <UFormField label="New Password" name="newPassword">
            <UInput
              v-model="passState.newPassword"
              type="password"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Confirm Password" name="confirmPassword">
            <UInput
              v-model="passState.confirmPassword"
              type="password"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              type="submit"
              label="Reset Password"
              color="neutral"
              :loading="passLoading"
            />
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>
