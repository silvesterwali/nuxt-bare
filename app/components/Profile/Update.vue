<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { updateProfile, loading: authLoading } = useAuth();
const { transformToIssue } = useValidateHelper();
const { user } = useUserSession();
const toast = useToast();

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  bio: z.string().optional(),
});

const state = reactive({
  firstName: "",
  lastName: "",
  bio: "",
});

type Schema = z.output<typeof schema>;
const form = useTemplateRef("form");

// Fetch current profile data
const { data: userData, refresh } = await useFetch("/api/user/profile");

// Sync state when profile is loaded
watchEffect(() => {
  if (userData.value?.data?.profile) {
    state.firstName = userData.value.data.profile.firstName || "";
    state.lastName = userData.value.data.profile.lastName || "";
    state.bio = userData.value.data.profile.bio || "";
  }
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await updateProfile(event.data);
    await refresh();
    toast.add({
      title: "Success",
      description: "Profile updated successfully",
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
      <h1 class="text-2xl font-bold">Profile</h1>
      <UButton to="/profile/password" variant="outline" icon="i-lucide-key"
        >Change Password</UButton
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
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="First Name" name="firstName">
            <UInput v-model="state.firstName" class="w-full" />
          </UFormField>

          <UFormField label="Last Name" name="lastName">
            <UInput v-model="state.lastName" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Email (Cannot be changed)" name="email">
          <UInput :model-value="user?.email" disabled class="w-full" />
        </UFormField>

        <UFormField label="Bio" name="bio">
          <UTextarea v-model="state.bio" class="w-full" />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" label="Save Changes" :loading="authLoading" />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
