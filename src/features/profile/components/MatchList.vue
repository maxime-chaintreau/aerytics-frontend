<script setup lang="ts">
import { computed } from "vue";
import type { PlayerKey, RoleFilter } from "@/types/riot";
import { usePlayerMatches } from "@/composables/useProfileQueries";
import Panel from "@/components/ui/Panel.vue";
import MatchRow from "@/features/profile/components/MatchRow.vue";

const props = defineProps<{ player: PlayerKey; role: RoleFilter }>();

const { data, isPending, isLoading, isPlaceholderData, error, hasNextPage, loadNextPage } = usePlayerMatches(
  () => props.player,
  () => props.role,
);

const matches = computed(() => data.value?.pages.flatMap((page) => page.matches) ?? []);

const isLoadingMore = computed(() => isLoading.value && !isPlaceholderData.value && matches.value.length > 0);
</script>

<template>
  <Panel title="Dernières parties">
    <!-- ===== Loading ===== -->
    <div v-if="isPending" class="match-list__skeleton" aria-hidden="true">
      <span v-for="n in 5" :key="n" class="skeleton" style="height: 56px" />
    </div>

    <!-- ===== Only if there is nothing to show ===== -->
    <div v-else-if="matches.length === 0 && error" role="alert" class="match-list__message">Impossible de charger les parties. Clique sur « Actualiser » pour réessayer.</div>

    <!-- ===== Empty ===== -->
    <p v-else-if="matches.length === 0" class="match-list__message">{{ role === "ALL" ? "Aucune partie récente." : "Aucune partie récente sur ce rôle." }}</p>

    <template v-else>
      <ol class="match-list">
        <li v-for="match in matches" :key="match.matchId">
          <MatchRow :match="match" :player="player" />
        </li>
      </ol>

      <button v-if="hasNextPage" type="button" class="match-list__more" :disabled="isLoadingMore" @click="loadNextPage()">
        {{ isLoadingMore ? "Chargement…" : "Charger plus" }}
        <span v-if="!isLoadingMore" class="match-list__more-arrow" aria-hidden="true">▾</span>
      </button>

      <p class="visually-hidden" aria-live="polite">{{ matches.length }} parties affichées</p>
    </template>
  </Panel>
</template>

<style scoped>
.match-list {
  container: match-list / inline-size;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
}

.match-list__more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  width: 100%;
  margin-top: calc(-1 * var(--space-2));
  padding: var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--fill-panel-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition:
    background-color 0.15s,
    color 0.15s;
}

.match-list__more:hover:not(:disabled) {
  background: var(--fill-hover);
  color: var(--text-primary);
}

.match-list__more:disabled {
  cursor: wait;
}

.match-list__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.match-list__message {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}
</style>
