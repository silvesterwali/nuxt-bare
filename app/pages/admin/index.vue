<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard>
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <UIcon
              name="i-lucide-users"
              class="w-6 h-6 text-primary-600 dark:text-primary-400"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            <p class="text-2xl font-bold">128</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <UIcon
              name="i-lucide-activity"
              class="w-6 h-6 text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Active Sessions
            </p>
            <p class="text-2xl font-bold">42</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
