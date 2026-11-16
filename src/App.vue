<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>

<template>
  <AppHeader />

  <main class="container">
    <RouterView />
  </main>

  <AppFooter />
</template>

<style scoped></style>
