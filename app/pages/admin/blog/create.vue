<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const router = useRouter()
const loading = ref(false)
const { locale } = useI18n()

async function handleSubmit(formData: any) {
  loading.value = true
  try {
    const body = {
      slug: { [locale.value]: formData.slug },
      title: { [locale.value]: formData.title },
      shortDescription: { [locale.value]: formData.shortDescription },
      content: { [locale.value]: formData.content },
      status: formData.status,
    }

    console.log('Submitting blog post:', body)

    const result = await $fetch('/api/admin/blog', {
      method: 'POST',
      body,
    })

    useToast().add({
      title: 'Post created',
      description: 'Your blog post has been created successfully.',
      color: 'success',
    })
    await router.push('/admin/blog')
  } catch (error: any) {
    console.error('Blog creation error details:', {
      message: error.message,
      data: error.data,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      error: error,
    })

    // Extract error message from various possible locations
    const errorMessage = 
      error.data?.message || 
      error.data?.statusMessage ||
      error.statusMessage || 
      error.message || 
      'An error occurred'

    useToast().add({
      title: 'Error creating post',
      description: errorMessage,
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/admin/blog" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <UIcon name="i-lucide-arrow-left" />
          </NuxtLink>
          <h1 class="text-3xl font-bold">Create New Post</h1>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Add a new blog post with multi-language support
        </p>
      </div>
    </div>

    <!-- Form Card -->
    <UCard class="max-w-4xl">
      <AdminBlogForm :is-loading="loading" @submit="handleSubmit" />
    </UCard>
  </div>
</template>
