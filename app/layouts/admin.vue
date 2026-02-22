<script setup lang="ts">
const { user, clear } = useUserSession();
const router = useRouter();

const isOpen = ref(false);

const links = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: "i-lucide-layout-dashboard",
    click: () => (isOpen.value = false),
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: "i-lucide-users",
    click: () => (isOpen.value = false),
  },
];

const logout = async () => {
  await clear();
  router.push("/login");
};

const userItems = [
  [
    {
      label: "Profile",
      to: "/profile",
      icon: "i-lucide-user",
    },
    {
      label: "Logout",
      icon: "i-lucide-log-out",
      click: logout,
    },
  ],
];
</script>

<template>
  <div class="fixed inset-0 flex overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans">
    <DashboardSidebar v-model:open="isOpen" title="Admin">
      <template #header>
        <AppLogo class="h-6 w-auto text-primary-500" />
        <span class="font-bold text-gray-900 dark:text-gray-100">Admin</span>
      </template>

      <DashboardGroup title="General">
        <UNavigationMenu orientation="vertical" :items="links" class="w-full" />
      </DashboardGroup>

      <template #footer>
        <UDropdownMenu :items="userItems" :content="{ side: 'top', align: 'start' }" class="w-full">
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
    </DashboardSidebar>

    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
      <DashboardNavbar :title="$route.meta.title?.toString() || 'Dashboard'">
        <template #left>
          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            class="lg:hidden mr-2"
            @click="isOpen = true"
          />
        </template>
      </DashboardNavbar>

      <div class="flex-1 overflow-auto p-4 sm:p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
