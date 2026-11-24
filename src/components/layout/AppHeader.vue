<script setup lang="ts">
import { useRoute } from "vue-router";
import SearchBar from "@/components/search/SearchBar.vue";

const route = useRoute();
</script>

<template>
  <header class="topbar">
    <div class="container topbar__inner">
      <RouterLink to="/" class="brand">Aerytics</RouterLink>
      <SearchBar v-if="route.name !== 'home'" compact class="topbar__search" />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--fill-panel);
  border-bottom: 1px solid var(--line);
}

.topbar__inner {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.brand {
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}

.topbar__search {
  margin-left: auto;
}

@media (max-width: 520px) {
  .topbar__search {
    display: none;
  }
}
</style>
