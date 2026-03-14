<script setup>
// currentColor means the fill follows Tailwind text-* classes (e.g. text-white, text-primary)
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    class="h-10 w-auto text-primary"
    fill="currentColor"
  >
    <!--
      Bold S lettermark — rounded ends, strong mid-crossbar
      Built from two arcs + a connecting bridge
    -->
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M25 4H13C8.582 4 5 7.582 5 12c0 4.418 3.582 8 8 8h6c1.657 0 3 1.343 3 3s-1.343 3-3 3H7v4h12c4.418 0 8-3.582 8-8 0-4.418-3.582-8-8-8h-6c-1.657 0-3-1.343-3-3s1.343-3 3-3h11V4Z"
    />
  </svg>
</template>
