<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { transformToIssue } = useValidateHelper();

const route = useRoute();
const userId = computed(() => route.params.id as string);

const { data: user, isLoading: isFetching } = useUserQuery(userId);
const { mutateAsync: updateUser, isLoading: isUpdating } =
  useUserUpdateMutation();

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

type Schema = z.output<typeof schema>;

const roles = ["admin", "user", "moderator"];
const form = useTemplateRef("form");

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
  <div class="p-4 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Edit User</h1>
      <UButton to="/admin/users" variant="ghost" icon="i-lucide-arrow-left"
        >Back to List</UButton
      >
    </div>

    <UCard>
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
  </div>
</template>
