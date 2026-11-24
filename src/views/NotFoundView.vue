<script setup lang="ts">
import { useRoute } from "vue-router";
import { useRecentSearches } from "@/composables/useRecentSearches";
import NotFoundState from "@/components/ui/NotFoundState.vue";
import SearchBar from "@/components/search/SearchBar.vue";
import RecentSearches from "@/features/home/components/RecentSearches.vue";

const route = useRoute();
const { recent } = useRecentSearches();
</script>

<template>
  <div class="not-found-page">
    <NotFoundState title="Page introuvable">
      L'adresse <code class="not-found-page__path">{{ route.path }}</code> ne mène nulle part : elle a peut-être changé, ou il y a une faute de frappe.

      <template #actions>
        <RouterLink to="/" class="button button--primary">Retour à l'accueil</RouterLink>
      </template>

      <template #extra>
        <SearchBar />
      </template>
    </NotFoundState>

    <div v-if="recent.length > 0" class="not-found-page__recent">
      <RecentSearches />
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  padding-bottom: var(--space-8);
}

.not-found-page__path {
  overflow-wrap: anywhere;
  color: var(--text-primary);
}

.not-found-page__recent {
  width: 100%;
  max-width: 640px;
  margin-inline: auto;
}
</style>
