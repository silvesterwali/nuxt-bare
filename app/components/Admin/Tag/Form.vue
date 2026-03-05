<script setup lang="ts">
import { z } from "zod";
import type { BlogTag } from "@/types/blog";

interface OtherProps {
  tagId: number | null;
  tag: BlogTag | null;
}

// bind `open` prop properly so parent v-model updates work
const open = defineModel<boolean>("open", { default: false });
const props = defineProps<OtherProps>();

// use async mutations to await completion for closing modal
const { mutateAsync: createTag, isLoading: creating } = useTagCreateMutation();
const { mutateAsync: updateTag, isLoading: updating } = useTagUpdateMutation();

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// validation issues returned from server
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
  color: "",
});

const isLoading = computed(() => creating.value || updating.value);
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
    issues.value = [];

    const data = {
      name: state.name,
      color: state.color || undefined,
    };

    if (props.tagId) {
      await updateTag({
        id: props.tagId,
        data,
      });
    } else {
      await createTag(data);
    }

    open.value = false;
  } catch (error: any) {
    console.error("Form submission error:", error);
    let arr: any[] = [];
    if (Array.isArray(error)) {
      arr = error;
    } else if (Array.isArray(error?.data)) {
      arr = error.data;
    }
    issues.value = arr as ZodIssue[];
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
            placeholder="Enter tag name"
            class="w-full"
          />
          <template #hint v-if="fieldErrors.name">
            <span class="text-red-500">{{ fieldErrors.name }}</span>
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
          <UButton label="Save Tag" :loading="isLoading" @click="onSubmit" />
        </div>
      </div>
    </template>
  </UModal>
</template>
