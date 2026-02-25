<script setup lang="ts">
import { z } from "zod";
import type { BlogCategory } from "@/types/blog";

interface OtherProps {
  categoryId: number | null;
  category: BlogCategory | null;
}

const open = defineModel<boolean>();
const props = defineProps<OtherProps>();

const { mutate: createCategory } = useCategoryCreateMutation();
const { mutate: updateCategory } = useCategoryUpdateMutation();

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const state = reactive({
  name: "",
  description: "",
  color: "",
});

const isLoading = ref(false);
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
    const data = {
      name: state.name,
      description: state.description || undefined,
      color: state.color || undefined,
    };

    if (props.categoryId) {
      updateCategory({
        id: props.categoryId,
        data,
      });
    } else {
      createCategory(data);
    }

    open.value = false;
  } catch (error) {
    console.error("Form submission error:", error);
  }
}

function close() {
  open.value = false;
}
</script>

<template>
  <UModal v-model="open" :title="modalTitle" @close="close">
    <template #body>
      <div class="flex flex-col gap-4">
        <CommonLanguageContentViewer />
        <UFormField label="Name" required>
          <UInput
            v-model="state.name"
            placeholder="Enter category name"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="state.description"
            placeholder="Enter category description"
            :rows="3"
            class="w-full"
          />
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
