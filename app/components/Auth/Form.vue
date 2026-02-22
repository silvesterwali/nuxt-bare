<script setup lang="ts" generic="T extends any">
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  title?: string;
  description?: string;
  icon?: string;
  align?: "center" | "left" | "right";
  loading?: boolean;
  providers?: {
    label: string;
    icon: string;
    click: () => void;
    color?: string;
  }[];
  submitButton?: { label?: string; trailingIcon?: string; block?: boolean };
  schema?: T;
  state?: any;
  fields?: {
    name: string;
    label?: string;
    type?: string;
    placeholder?: string;
    icon?: string;
    required?: boolean;
  }[];
  validate?: (state: any) => Promise<void> | void;
  divider?: string;
}>();

const emit = defineEmits<{
  (e: "submit", event: FormSubmitEvent<any>): void;
}>();

const form = useTemplateRef("form");
defineExpose({
  form,
});

function onSubmit(event: FormSubmitEvent<any>) {
  emit("submit", event);
}
</script>

<template>
  <UCard class="w-full max-w-sm mx-auto">
    <div v-if="icon || title || description" class="text-center mb-6">
      <UIcon
        v-if="icon"
        :name="icon"
        class="w-8 h-8 mx-auto mb-4 text-primary-500"
      />
      <h1 v-if="title" class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ description }}
      </p>
    </div>

    <div v-if="providers?.length" class="space-y-3 mb-6">
      <UButton
        v-for="(provider, index) in providers"
        :key="index"
        :label="provider.label"
        :icon="provider.icon"
        :color="(provider.color as any) || 'white'"
        block
        class="w-full"
        @click="provider.click"
      />
    </div>

    <div
      v-if="providers?.length && (fields?.length || $slots.default)"
      class="relative my-6"
    >
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">
          {{ divider || "Or continue with" }}
        </span>
      </div>
    </div>

    <UForm
      ref="form"
      v-if="schema && state"
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <slot name="fields">
        <template v-if="fields?.length">
          <UFormField
            v-for="field in fields"
            :key="field.name"
            :name="field.name"
            :label="field.label"
            :required="field.required"
          >
            <UInput
              v-model="state[field.name]"
              :type="field.type || 'text'"
              :placeholder="field.placeholder"
              :icon="field.icon"
              class="w-full"
            />
          </UFormField>
        </template>
      </slot>

      <slot />

      <UButton
        type="submit"
        :loading="loading"
        :label="submitButton?.label || 'Submit'"
        :block="submitButton?.block ?? true"
        :trailing-icon="submitButton?.trailingIcon"
      />
    </UForm>

    <div
      v-if="$slots.footer"
      class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      <slot name="footer" />
    </div>
  </UCard>
</template>
