<script setup lang="ts">
import type { Form, FormSubmitEvent } from "@nuxt/ui";

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

interface Schema {
  file: File | null;
  alt: string;
  description: string;
}

const form = ref<Form<Schema>>();

const state = ref<Schema>({
  file: null,
  alt: "",
  description: "",
});

const uploadMutation = useMediaUploadMutation();
const loading = computed(() => uploadMutation.isLoading.value);

async function submit(event: FormSubmitEvent<Schema>) {
  // clear previous validation errors if the form API is available

  form.value?.clear();

  if (!event.data.file) {
    useToast().add({
      title: "Error",
      description: "Please select a file to upload.",
      color: "error",
    });
    return;
  }

  const fileType = event.data.file.type || "";
  const mediaType = fileType.startsWith("image/") ? "image" : "document";

  // Client-side size validation using centralized config (backend also validates)
  const config =
    mediaType === "image"
      ? MEDIA_CONFIG.UPLOAD.IMAGE
      : MEDIA_CONFIG.UPLOAD.DOCUMENT;
  const maxSize = config.maxSize;

  if (event.data.file.size > maxSize) {
    useToast().add({
      title: "File too large",
      description:
        mediaType === "image"
          ? `Images must be ${maxSize / (1024 * 1024)}MB or less.`
          : `Documents must be ${maxSize / (1024 * 1024)}MB or less.`,
      color: "error",
    });
    return;
  }

  const payload = {
    file: event.data.file,
    type: mediaType,
    privacy: "public",
    description: event.data.description,
    alt: event.data.alt,
  };

  try {
    const response = await uploadMutation.mutateAsync(payload);
    emit("reload", response);
    reset();
    open.value = false;
  } catch (err: any) {
    if (form.value) {
      const errors = transformToIssue(err);
      if (errors.length) {
        form.value.setErrors(errors);
      }
    }

    useToast().add({
      title: "Error",
      description: err?.message || "Failed to upload media",
      color: "error",
    });
  }
}

function reset() {
  state.value.file = null;
  state.value.alt = "";
  state.value.description = "";
}

function close() {
  reset();
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Upload media"
    description="Upload an image (max 2MB) or document (max 50MB)"
    icon="i-lucide-upload"
  >
    <template #body>
      <UForm ref="form" :state="state" class="space-y-4" @submit="submit">
        <UFileUpload
          layout="list"
          v-model="state.file"
          label="Drop your file here"
          description="Images (max 2MB) or documents (PDF/Word/Excel, max 50MB)"
        />

        <UFormField label="Alt text" name="alt">
          <UInput
            v-model="state.alt"
            placeholder="Optional alt text"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="state.description"
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
