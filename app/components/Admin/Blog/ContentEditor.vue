<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

interface Props {
  modelValue: string
  placeholder?: string
  readonly?: boolean
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const items: EditorToolbarItem[][] = [
  [
    {
      icon: 'i-lucide-heading',
      content: {
        align: 'start'
      },
      items: [
        {
          kind: 'heading',
          level: 1,
          icon: 'i-lucide-heading-1',
          label: 'Heading 1'
        },
        {
          kind: 'heading',
          level: 2,
          icon: 'i-lucide-heading-2',
          label: 'Heading 2'
        },
        {
          kind: 'heading',
          level: 3,
          icon: 'i-lucide-heading-3',
          label: 'Heading 3'
        }
      ]
    }
  ],
  [
    {
      kind: 'mark',
      mark: 'bold',
      icon: 'i-lucide-bold',
      tooltip: { text: 'Bold' }
    },
    {
      kind: 'mark',
      mark: 'italic',
      icon: 'i-lucide-italic',
      tooltip: { text: 'Italic' }
    },
    {
      kind: 'mark',
      mark: 'underline',
      icon: 'i-lucide-underline',
      tooltip: { text: 'Underline' }
    },
    {
      kind: 'mark',
      mark: 'strike',
      icon: 'i-lucide-strikethrough',
      tooltip: { text: 'Strikethrough' }
    },
    {
      kind: 'mark',
      mark: 'code',
      icon: 'i-lucide-code',
      tooltip: { text: 'Code' }
    }
  ],
  [
    {
      kind: 'bulletList',
      icon: 'i-lucide-list',
      tooltip: { text: 'Bullet List' }
    },
    {
      kind: 'orderedList',
      icon: 'i-lucide-list-ordered',
      tooltip: { text: 'Ordered List' }
    },
    {
      kind: 'codeBlock',
      icon: 'i-lucide-square-code',
      tooltip: { text: 'Code Block' }
    },
    {
      kind: 'blockquote',
      icon: 'i-lucide-text-quote',
      tooltip: { text: 'Blockquote' }
    }
  ],
  [
    {
      kind: 'link',
      icon: 'i-lucide-link',
      tooltip: { text: 'Link' }
    }
  ]
]
</script>

<template>
  <div class="space-y-2">
    <div class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">
      Body
    </div>

    <UEditor
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      v-slot="{ editor }"
      content-type="markdown"
      :placeholder="placeholder || 'Write your content here... Markdown supported'"
      :disabled="readonly"
      class="w-full border rounded-lg overflow-hidden"
      :ui="{ base: 'prose prose-sm dark:prose-invert max-w-none p-4' }"
    >
      <UEditorToolbar
        :editor="editor"
        :items="items"
        class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2"
      />
    </UEditor>

    <div class="text-xs text-gray-500 dark:text-gray-400">
      💡 Use formatting toolbar above or type markdown directly
    </div>
  </div>
</template>
