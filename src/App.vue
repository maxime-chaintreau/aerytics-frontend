<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import { useStaticDataStore } from "./stores/staticData";

useStaticDataStore().load();
</script>

<template>
  <AppHeader />

  <main class="container">
    <RouterView />
  </main>

  <AppFooter />
</template>
