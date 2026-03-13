<script setup lang="ts">
import { computed, ref } from "vue";
import { useMediaUploadMutation } from "~/composables/useMediaManagementQuery";
import { useValidateHelper } from "~/composables/useValidateHelper";

const props = defineProps({
  open: { type: Boolean, required: true },
});

const emit = defineEmits<{
  (e: "reload", response: { message: string; data: any }): void;
}>();

const open = defineModel<boolean>("open", {
  default: false,
});

const { transformToIssue } = useValidateHelper();

import type { Ref, ComponentPublicInstance } from "vue";

type UFormInstance = ComponentPublicInstance<{
  clear(): void;
  setErrors(errs: any[]): void;
}>;
const form: Ref<UFormInstance | null> = ref(null);

const file = ref<File | null>(null);
const alt = ref("");
const description = ref("");

const uploadMutation = useMediaUploadMutation();
const loading = computed(() => uploadMutation.isLoading.value);

async function submit() {
  // clear previous validation errors if the form API is available
  if (form.value && typeof form.value.clear === "function") {
    form.value.clear();
  }

  if (!file.value) {
    useToast().add({
      title: "Error",
      description: "Please select a file to upload.",
      color: "error",
    });
    return;
  }

  const fileType = file.value.type || "";
  const mediaType = fileType.startsWith("image/") ? "image" : "document";

  // Client-side size validation (backend also validates)
  const maxSize = mediaType === "image" ? 2 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.value.size > maxSize) {
    useToast().add({
      title: "File too large",
      description:
        mediaType === "image"
          ? "Images must be 2MB or less."
          : "Documents must be 50MB or less.",
      color: "error",
    });
    return;
  }

  const payload = {
    file: file.value,
    type: mediaType,
    privacy: "public",
    description: description.value,
    alt: alt.value,
  };

  try {
    const response = await uploadMutation.mutateAsync(payload);
    emit("reload", response);
    reset();
    open.value = false;
  } catch (err: any) {
    const errors = transformToIssue(err);
    if (errors.length) {
      form.value?.setErrors(errors);
      return;
    }

    useToast().add({
      title: "Error",
      description: "Failed to upload media",
      color: "error",
    });
  }
}

function reset() {
  file.value = null;
  alt.value = "";
  description.value = "";
}

function close() {
  reset();
  open.value = false;
}
</script>

<template>
  <UModal v-model:open="open" title="Upload media" icon="i-lucide-upload">
    <template #body>
      <UForm ref="form" class="space-y-4" @submit.prevent="submit">
        <UFileUpload
          layout="list"
          v-model="file"
          label="Drop your file here"
          description="Images (max 2MB) or documents (PDF/Word/Excel, max 50MB)"
        />

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UFormField label="Alt text" name="alt">
            <UInput
              v-model="alt"
              placeholder="Optional alt text"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="description"
            :rows="3"
            placeholder="Optional description"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            @click="close"
          />
          <UButton
            :loading="loading"
            label="Upload"
            color="primary"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
