<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { transformToIssue } = useValidateHelper();

const route = useRoute();
const userId = computed(() => route.params.id as string);

// `useUserQuery` returns a standardized response shape { message, data }
// so we rename the value to avoid confusion and unwrap the `data` field later.
const { data: userResp, isLoading: isFetching } = useUserQuery(userId);
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

// admin password reset schema

type Schema = z.output<typeof schema>;

const roles = ["admin", "user", "moderator"];
import type { Ref, ComponentPublicInstance } from "vue";

type UFormInstance = ComponentPublicInstance<{
  clear(): void;
  setErrors(errs: any[]): void;
}>;
const form: Ref<UFormInstance | null> = ref(null);

// populate form state once the query returns data
watchEffect(() => {
  const u = userResp.value?.data;
  if (u) {
    state.email = u.email;
    state.firstName = u.profile?.firstName || "";
    state.lastName = u.profile?.lastName || "";
    state.role = u.role as any;
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
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Edit User</h1>
      <UButton to="/admin/users" variant="ghost" icon="i-lucide-arrow-left"
        >Back to List</UButton
      >
    </div>

    <div>
      <!-- user details card -->
      <UCard>
        <div v-if="isFetching">Loading...</div>
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
            <USelect v-model="state.role" :items="roles" class="w-full" />
          </UFormField>

          <div class="flex justify-end">
            <UButton type="submit" label="Update User" :loading="isUpdating" />
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>
