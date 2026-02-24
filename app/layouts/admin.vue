<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { user, clear } = useUserSession();
const router = useRouter();

const open = ref(false);

const links: NavigationMenuItem[][] = [
  [
    {
      label: "Dashboard",
      to: "/admin",
      exact: true,
      icon: "i-lucide-layout-dashboard",
      onSelect: () => (open.value = false),
    },
    {
      label: "Blog",
      to: "/admin/blog",
      icon: "i-lucide-file-text",
      onSelect: () => (open.value = false),
    },
    {
      label: "Users",
      to: "/admin/users",
      icon: "i-lucide-users",
      onSelect: () => (open.value = false),
    },
  ],
];

const logout = async () => {
  await clear();
  router.push("/login");
};

const userItems = [
  {
    label: "Profile",
    to: "/profile",
    icon: "i-lucide-user",
  },
  {
    label: "Logout",
    icon: "i-lucide-log-out",
    onSelect: logout,
  },
];

const groups = computed(() => [
  {
    id: "links",
    label: "Go to",
    items: [...(links[0] || []), ...(links[1] || [])],
  },
]);
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-bold text-gray-900 dark:text-white"
        >
          <AppLogo class="h-6 w-auto text-primary-500" />
          <span v-if="!collapsed" class="truncate">Admin</span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UDropdownMenu
          :items="userItems"
          :content="{ side: 'top', align: 'start' }"
          class="w-full"
        >
          <UButton color="neutral" variant="ghost" class="w-full justify-start">
            <template #leading>
              <UAvatar :alt="user?.name" size="2xs" />
            </template>
            <div class="text-left truncate flex-1">
              <p class="font-medium text-sm">{{ user?.name || "User" }}</p>
            </div>
            <template #trailing>
              <UIcon name="i-lucide-chevron-up" class="ml-auto" />
            </template>
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <DashboardNavbar :title="$route.meta.title?.toString() || 'Dashboard'">
        <template #left>
          <UDashboardSidebarToggle />
        </template>
      </DashboardNavbar>

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </UDashboardGroup>
</template>
