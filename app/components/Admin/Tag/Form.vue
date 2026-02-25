<script setup lang="ts">
import { z } from "zod";
import type { BlogTag } from "@/types/blog";

interface OtherProps {
  tagId: number | null;
  tag: BlogTag | null;
}

const open = defineModel<boolean>();
const props = defineProps<OtherProps>();

const { mutate: createTag } = useTagCreateMutation();
const { mutate: updateTag } = useTagUpdateMutation();

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const state = reactive({
  name: "",
  color: "",
});

const isLoading = ref(false);
const modalTitle = computed(() => (props.tagId ? "Edit Tag" : "New Tag"));

watchEffect(() => {
  if (open.value && props.tag) {
    state.name = props.tag.name || "";
    state.color = props.tag.color || "";
  } else if (open.value && !props.tag) {
    state.name = "";
    state.color = "";
  }
});

async function onSubmit() {
  try {
    const data = {
      name: state.name,
      color: state.color || undefined,
    };

    if (props.tagId) {
      updateTag({
        id: props.tagId,
        data,
      });
    } else {
      createTag(data);
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
            placeholder="Enter tag name"
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
          <UButton label="Save Tag" :loading="isLoading" @click="onSubmit" />
        </div>
      </div>
    </template>
  </UModal>
</template>
