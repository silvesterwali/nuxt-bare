<script setup lang="ts">
const { user, clear } = useUserSession();
const router = useRouter();

const items = computed(() => {
  const defaultItems = [
    {
      label: "Home",
      to: "/",
      icon: "i-lucide-house",
    },
    {
      label: "Profile",
      to: "/profile",
      icon: "i-lucide-user",
    },
  ];

  if (user.value?.role === "admin") {
    defaultItems.push({
      label: "Admin",
      to: "/admin/users",
      icon: "i-lucide-settings",
    });
  }

  return defaultItems;
});

const logout = async () => {
  await clear();
  router.push("/login");
};

const isDark = computed({
  get() {
    return useColorMode().value === "dark";
  },
  set() {
    useColorMode().preference =
      useColorMode().value === "dark" ? "light" : "dark";
  },
});
</script>

<template>
  <div class="flex flex-col min-h-screen font-sans">
    <header
      class="border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75 backdrop-blur sticky top-0 z-50"
    >
      <div
        class="container mx-auto px-4 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="flex items-center gap-2">
            <AppLogo class="h-6 w-auto text-primary-500" />
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-2">
            <UButton
              v-for="item in items"
              :key="item.to"
              :to="item.to"
              variant="ghost"
              :icon="item.icon"
              :label="item.label"
            />
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            color="neutral"
            variant="ghost"
            @click="isDark = !isDark"
          />

          <template v-if="user">
            <UDropdownMenu
              :items="[
                { label: user.email, slot: 'account', disabled: true },
                { label: 'Profile', to: '/profile', icon: 'i-lucide-user' },
                {
                  label: 'Settings',
                  to: '/profile',
                  icon: 'i-lucide-settings',
                },
                { separator: true },
                { label: 'Logout', icon: 'i-lucide-log-out', onSelect: logout },
              ]"
            >
              <UButton
                variant="ghost"
                color="neutral"
                :label="user.name || 'User'"
                trailing-icon="i-lucide-chevron-down"
              />

              <template #account-item="{ item }">
                <div class="text-left">
                  <p>Signed in as</p>
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {{ item.label }}
                  </p>
                </div>
              </template>
            </UDropdownMenu>
          </template>
          <template v-else>
            <UButton
              to="/login"
              label="Sign In"
              variant="ghost"
              color="neutral"
            />
            <UButton to="/register" label="Sign Up" color="primary" />
          </template>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="border-t border-gray-200 dark:border-gray-800 py-6">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} Nuxt Bare. All rights reserved.
      </div>
    </footer>
  </div>
</template>
