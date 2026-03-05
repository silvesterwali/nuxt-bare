<script setup lang="ts">
import { z } from "zod";
import type { BlogCategory } from "@/types/blog";

interface OtherProps {
  categoryId: number | null;
  category: BlogCategory | null;
}

// `open` is a v-model prop from parent; specify name so model binding works
const open = defineModel<boolean>("open", { default: false });
const props = defineProps<OtherProps>();

// prefer mutateAsync so we can await completion and close modal only on success
const { mutateAsync: createCategory, isLoading: creating } =
  useCategoryCreateMutation();
const { mutateAsync: updateCategory, isLoading: updating } =
  useCategoryUpdateMutation();

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

// track server‑side validation issues (zod `ZodIssue[]`)
import type { ZodIssue } from "zod";
const issues = ref<ZodIssue[]>([]);
const fieldErrors = computed(() => {
  const map: Record<string, string> = {};
  for (const i of issues.value) {
    const key = i.path[0] as string;
    if (!map[key]) map[key] = i.message;
  }
  return map;
});

const state = reactive({
  name: "",
  description: "",
  color: "",
});

const isLoading = computed(() => creating.value || updating.value);
const modalTitle = computed(() =>
  props.categoryId ? "Edit Category" : "New Category",
);

watchEffect(() => {
  if (open.value && props.category) {
    state.name = props.category.name || "";
    state.description = props.category.description || "";
    state.color = props.category.color || "";
  } else if (open.value && !props.category) {
    state.name = "";
    state.description = "";
    state.color = "";
  }
});

async function onSubmit() {
  try {
    // clear any previous issues before submitting
    issues.value = [];

    const data = {
      name: state.name,
      description: state.description || undefined,
      color: state.color || undefined,
    };

    if (props.categoryId) {
      await updateCategory({
        id: props.categoryId,
        data,
      });
    } else {
      await createCategory(data);
    }

    // only close when mutation succeeded
    open.value = false;
  } catch (error: any) {
    console.error("Form submission error:", error);
    let array: any[] = [];
    if (Array.isArray(error)) {
      array = error;
    } else if (Array.isArray(error?.data)) {
      array = error.data;
    }
    issues.value = array as ZodIssue[];
  }
}

function close() {
  open.value = false;
}
</script>

<template>
  <UModal v-model:open="open" :title="modalTitle" @close="close">
    <template #body>
      <div class="flex flex-col gap-4">
        <CommonLanguageContentViewer />
        <UFormField label="Name" required>
          <UInput
            v-model="state.name"
            placeholder="Enter category name"
            class="w-full"
          />
          <template #hint v-if="fieldErrors.name">
            <span class="text-red-500">{{ fieldErrors.name }}</span>
          </template>
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="state.description"
            placeholder="Enter category description"
            :rows="3"
            class="w-full"
          />
          <template #hint v-if="fieldErrors.description">
            <span class="text-red-500">{{ fieldErrors.description }}</span>
          </template>
        </UFormField>

        <UFormField label="Color">
          <div class="flex gap-2">
            <UInput
              v-model="state.color"
              type="color"
              placeholder="#000000"
              class="w-16"
            />
            <UInput
              v-model="state.color"
              placeholder="e.g., #FF5733"
              class="flex-1"
            />
          </div>
        </UFormField>

        <div class="flex justify-end gap-2 pt-4">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            @click="close"
          />
          <UButton
            label="Save Category"
            :loading="isLoading"
            @click="onSubmit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
