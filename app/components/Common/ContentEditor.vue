<script setup lang="ts">
import type { EditorToolbarItem } from "@nuxt/ui";

const modelValue = defineModel<string>({
  required: true,
});

interface Props {
  placeholder?: string;
  readonly?: boolean;
  minHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  minHeight: "16rem",
});

// Word / character count computed from raw markdown value
const wordCount = computed(() => {
  const text = modelValue.value?.trim() ?? "";
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
});

const charCount = computed(() => modelValue.value?.length ?? 0);

const items: EditorToolbarItem[][] = [
  // Text style: H2 → H4 only (no H1 allowed)
  [
    {
      icon: "i-lucide-heading",
      tooltip: { text: "Headings" },
      content: { align: "start" },
      items: [
        {
          kind: "paragraph",
          icon: "i-lucide-case-sensitive",
          label: "Paragraph",
        },
        {
          kind: "heading",
          level: 2,
          icon: "i-lucide-heading-2",
          label: "Heading 2",
        },
        {
          kind: "heading",
          level: 3,
          icon: "i-lucide-heading-3",
          label: "Heading 3",
        },
        {
          kind: "heading",
          level: 4,
          icon: "i-lucide-heading-4",
          label: "Heading 4",
        },
      ],
    },
  ],
  // Inline marks
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "i-lucide-bold",
      tooltip: { text: "Bold (⌘B)" },
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-lucide-italic",
      tooltip: { text: "Italic (⌘I)" },
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-lucide-underline",
      tooltip: { text: "Underline (⌘U)" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-lucide-strikethrough",
      tooltip: { text: "Strikethrough" },
    },
    {
      kind: "mark",
      mark: "code",
      icon: "i-lucide-code",
      tooltip: { text: "Inline Code" },
    },
    {
      kind: "clearFormatting",
      icon: "i-lucide-remove-formatting",
      tooltip: { text: "Clear Formatting" },
    },
  ],
  // Alignment
  [
    {
      kind: "textAlign",
      align: "left",
      icon: "i-lucide-align-left",
      tooltip: { text: "Align Left" },
    },
    {
      kind: "textAlign",
      align: "center",
      icon: "i-lucide-align-center",
      tooltip: { text: "Align Center" },
    },
    {
      kind: "textAlign",
      align: "right",
      icon: "i-lucide-align-right",
      tooltip: { text: "Align Right" },
    },
  ],
  // Lists & blocks
  [
    {
      kind: "bulletList",
      icon: "i-lucide-list",
      tooltip: { text: "Bullet List" },
    },
    {
      kind: "orderedList",
      icon: "i-lucide-list-ordered",
      tooltip: { text: "Ordered List" },
    },
    {
      kind: "blockquote",
      icon: "i-lucide-text-quote",
      tooltip: { text: "Blockquote" },
    },
    {
      kind: "codeBlock",
      icon: "i-lucide-square-code",
      tooltip: { text: "Code Block" },
    },
    {
      kind: "horizontalRule",
      icon: "i-lucide-minus",
      tooltip: { text: "Horizontal Rule" },
    },
  ],
  // Link & history
  [
    {
      kind: "link",
      icon: "i-lucide-link",
      tooltip: { text: "Insert Link" },
    },
    {
      kind: "undo",
      icon: "i-lucide-undo-2",
      tooltip: { text: "Undo (⌘Z)" },
    },
    {
      kind: "redo",
      icon: "i-lucide-redo-2",
      tooltip: { text: "Redo (⌘⇧Z)" },
    },
  ],
];
</script>

<template>
  <div class="flex flex-col rounded-[calc(var(--ui-radius)+2px)] border border-default overflow-hidden transition-shadow focus-within:shadow-sm focus-within:ring-1 focus-within:ring-primary/40">
    <!-- Editor area (toolbar lives inside v-slot to access the editor instance) -->
    <UEditor
      v-model="modelValue"
      v-slot="{ editor }"
      content-type="markdown"
      :placeholder="placeholder || 'Start writing…'"
      :disabled="readonly"
      class="w-full"
      :style="{ minHeight: props.minHeight }"
      :ui="{
        base: 'prose prose-sm dark:prose-invert max-w-none px-4 py-3 focus:outline-none',
      }"
    >
      <UEditorToolbar
        :editor="(editor as any)"
        :items="items"
        class="border-b border-default bg-muted px-2 py-1.5 flex-shrink-0"
      />
    </UEditor>

    <!-- Status bar -->
    <div
      class="flex items-center justify-between px-4 py-1.5 border-t border-default bg-muted/50 text-xs text-muted select-none"
    >
      <span v-if="readonly" class="flex items-center gap-1">
        <UIcon name="i-lucide-lock" class="size-3" />
        Read only
      </span>
      <span v-else class="flex items-center gap-1 text-muted/70">
        <UIcon name="i-lucide-type" class="size-3" />
        Markdown
      </span>

      <div class="flex items-center gap-3">
        <span>{{ wordCount }} {{ wordCount === 1 ? "word" : "words" }}</span>
        <USeparator orientation="vertical" class="h-3" />
        <span>{{ charCount }} chars</span>
      </div>
    </div>
  </div>
</template>
