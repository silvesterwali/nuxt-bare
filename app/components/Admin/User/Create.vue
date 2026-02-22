<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { mutateAsync: createUser, isLoading: pending } = useUserCreateMutation();
const { transformToIssue } = useValidateHelper();
const toast = useToast();

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "user", "moderator"]),
});

const state = reactive({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  role: "user" as const,
});

type Schema = z.output<typeof schema>;

const roles = ["admin", "user", "moderator"];
const form = useTemplateRef("form");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await createUser({
      ...event.data,
      name: `${event.data.firstName} ${event.data.lastName}`.trim(),
    });
    // Toast is handled in mutation onSuccess
    navigateTo("/admin/users");
  } catch (err: any) {
    const errors = transformToIssue(err);
    if (errors.length) form.value?.setErrors(errors);
  }
}
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Create User</h1>
      <UButton to="/admin/users" variant="ghost" icon="i-lucide-arrow-left"
        >Back to List</UButton
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
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" />
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
          <UButton type="submit" label="Create User" :loading="pending" />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
