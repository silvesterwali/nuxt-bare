<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

const { locale } = useI18n();
const { data: tags, isLoading: pending } = useTagsQuery();
const { mutate: deleteTag, isLoading: deleting } = useTagDeleteMutation();

// pagination
const page = ref(1);
const perPage = ref(10);
const paginated = computed(() => {
  const arr = tags.value || [];
  const start = (page.value - 1) * perPage.value;
  return arr.slice(start, start + perPage.value);
});

const isOpen = ref(false);
const editingId = ref<number | null>(null);
const selectedTag = ref<BlogTag | null>(null);
const deleteConfirmOpen = ref(false);
const tagToDelete = ref<number | null>(null);

function openCreateModal() {
  editingId.value = null;
  selectedTag.value = null;
  isOpen.value = true;
}

function openEditModal(tag: BlogTag) {
  editingId.value = tag.id;
  selectedTag.value = tag;
  isOpen.value = true;
}

function openDeleteModal(id: number) {
  tagToDelete.value = id;
  deleteConfirmOpen.value = true;
}

function confirmDelete() {
  if (tagToDelete.value) {
    deleteTag(tagToDelete.value);
    tagToDelete.value = null;
  }
}

function handleDeleteTag(id: number) {
  openDeleteModal(id);
}

function getRowActions(rowId: number, tag: BlogTag) {
  return [
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      onSelect: () => openEditModal(tag),
    },
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => handleDeleteTag(rowId),
    },
  ];
}

const columns: TableColumn<BlogTag>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      class: {
        th: "text-left",
        td: "text-left",
      },
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "color",
    header: "Color",
    meta: {
      class: {
        th: "text-center",
        td: "text-center",
      },
    },
    cell: ({ row }) => {
      const color = row.getValue("color") as string | undefined;
      if (!color) return "-";
      return h("div", { class: "flex items-center justify-center gap-2" }, [
        h("div", {
          class: "w-4 h-4 rounded",
          style: { backgroundColor: color },
        }),
        h("span", { class: "text-sm" }, color),
      ]);
    },
  },
  {
    accessorKey: "language",
    header: "Language",
    meta: {
      class: {
        th: "text-center",
        td: "text-center",
      },
    },
    cell: ({ row }) => {
      const language = row.getValue("language") as string | undefined;
      if (!language) return "-";

      return h(
        "div",
        { class: "flex gap-1 flex-wrap justify-center" },
        h(UBadge, { color: "primary", variant: "subtle", size: "sm" }, () =>
          language.toUpperCase(),
        ),
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    meta: {
      class: {
        th: "text-right",
        td: "text-right",
      },
    },
    cell: ({ row }) =>
      h(
        UDropdownMenu,
        {
          items: getRowActions(row.original.id, row.original),
          content: { align: "end" },
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            size: "sm",
            "aria-label": "Actions",
          }),
      ),
  },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <CommonPageHeader title="Tags">
      <template #description>
        Manage blog tags. Currently editing in
        <span class="font-semibold uppercase">{{ locale }}</span> language.
      </template>
      <UButton icon="i-lucide-plus" label="New Tag" @click="openCreateModal" />
    </CommonPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <UTable :data="paginated" :columns="columns" :loading="pending" />
      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted">{{ (tags || []).length }} entries</p>
          <UPagination
            v-model:page="page"
            :total="(tags || []).length"
            :items-per-page="perPage"
          />
        </div>
      </template>
    </UCard>

    <AdminTagForm
      v-model:open="isOpen"
      :tag-id="editingId"
      :tag="selectedTag"
    />

    <!-- Confirm Delete Modal -->
    <CommonConfirmDelete
      v-model:open="deleteConfirmOpen"
      title="Delete Tag"
      message="Are you sure you want to delete this tag? This action cannot be undone."
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
