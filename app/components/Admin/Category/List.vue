<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

const { locale } = useI18n();
const { data: categories, isLoading: pending } = useCategoriesQuery();
const { mutate: deleteCategory, isLoading: deleting } =
  useCategoryDeleteMutation();

// pagination
const page = ref(1);
const perPage = ref(10);
const paginated = computed(() => {
  const arr = categories.value || [];
  const start = (page.value - 1) * perPage.value;
  return arr.slice(start, start + perPage.value);
});

const isOpen = ref(false);
const editingId = ref<number | null>(null);
const selectedCategory = ref<BlogCategory | null>(null);
const deleteConfirmOpen = ref(false);
const categoryToDelete = ref<number | null>(null);

function openCreateModal() {
  editingId.value = null;
  selectedCategory.value = null;
  isOpen.value = true;
}

function openEditModal(category: BlogCategory) {
  editingId.value = category.id;
  selectedCategory.value = category;
  isOpen.value = true;
}

function openDeleteModal(id: number) {
  categoryToDelete.value = id;
  deleteConfirmOpen.value = true;
}

function confirmDelete() {
  if (categoryToDelete.value) {
    deleteCategory(categoryToDelete.value);
    categoryToDelete.value = null;
  }
}

function handleDeleteCategory(id: number) {
  openDeleteModal(id);
}

function getRowActions(rowId: number, category: BlogCategory) {
  return [
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      onSelect: () => openEditModal(category),
    },
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => handleDeleteCategory(rowId),
    },
  ];
}

const columnsData: TableColumn<BlogCategory>[] = [
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
    <CommonPageHeader title="Categories">
      <template #description>
        Manage blog categories. Currently editing in
        <span class="font-semibold uppercase">{{ locale }}</span> language.
      </template>
      <UButton icon="i-lucide-plus" label="New Category" @click="openCreateModal" />
    </CommonPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <UTable :data="paginated" :columns="columnsData" :loading="pending" />
      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted">
            {{ (categories || []).length }} entries
          </p>
          <UPagination
            v-model:page="page"
            :total="(categories || []).length"
            :items-per-page="perPage"
          />
        </div>
      </template>
    </UCard>

    <AdminCategoryForm
      v-model:open="isOpen"
      :category-id="editingId"
      :category="selectedCategory"
    />

    <!-- Confirm Delete Modal -->
    <CommonConfirmDelete
      v-model:open="deleteConfirmOpen"
      title="Delete Category"
      message="Are you sure you want to delete this category? This action cannot be undone."
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
