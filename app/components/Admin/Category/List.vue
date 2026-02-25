<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { BlogCategory } from "@/types/blog";

const UBadge = resolveComponent("UBadge");

const { locale } = useI18n();
const { data: categories, isLoading: pending } = useCategoriesQuery();
const { mutate: deleteCategory } = useCategoryDeleteMutation();

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
    deleteConfirmOpen.value = false;
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

const columns: TableColumn<BlogCategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => {
      const color = row.getValue("color") as string | undefined;
      if (!color) return "-";
      return h("div", { class: "flex items-center gap-2" }, [
        h("div", {
          class: "w-4 h-4 rounded",
          style: { backgroundColor: color },
        }),
        h("span", color),
      ]);
    },
  },
  {
    accessorKey: "language",
    header: "Language",
    cell: ({ row }) => {
      const language = row.getValue("language") as string | undefined;
      if (!language) return "-";
      return h(
        "div",
        { class: "flex gap-1 flex-wrap" },

        h(UBadge, { color: "primary", variant: "subtle", size: "sm" }, () =>
          language.toUpperCase(),
        ),
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const UDropdownMenu = resolveComponent("UDropdownMenu");
      const UButton = resolveComponent("UButton");
      return h(
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
      );
    },
  },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Categories</h2>
        <p class="text-gray-500 dark:text-gray-400">
          Manage blog categories. Currently editing in
          <span class="font-semibold uppercase">{{ locale }}</span> language.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="New Category"
        @click="openCreateModal"
      />
    </div>

    <UCard>
      <UTable :data="paginated" :columns="columns" :loading="pending" />
      <div
        class="flex justify-end p-3 border-t border-gray-200 dark:border-gray-700"
      >
        <UPagination
          v-model:page="page"
          :total="(categories || []).length"
          :items-per-page="perPage"
        />
      </div>
    </UCard>

    <AdminCategoryForm
      v-model:open="isOpen"
      :category-id="editingId"
      :category="selectedCategory"
    />

    <UModal
      v-model="deleteConfirmOpen"
      title="Delete Category"
      icon="i-lucide-trash-2"
    >
      <template #body>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this category? This action cannot be
          undone.
        </p>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            @click="deleteConfirmOpen = false"
          />
          <UButton color="error" label="Delete" @click="confirmDelete" />
        </div>
      </template>
    </UModal>
  </div>
</template>
