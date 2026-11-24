<script setup lang="ts">
import { useRecentSearches } from "@/composables/useRecentSearches";
import { formatRiotId, toRiotIdSlug } from "@/utils/riotId";
import Panel from "@/components/ui/Panel.vue";
import PlayerIdentity from "@/components/game/PlayerIdentity.vue";

const { recent, remove, clear } = useRecentSearches();
</script>

<template>
  <Panel title="Recherches récentes">
    <template v-if="recent.length > 0" #aside>
      <button type="button" class="recent__clear" @click="clear">Tout effacer</button>
    </template>

    <p v-if="recent.length === 0" class="recent__empty">Les profils que tu ouvres apparaîtront ici, sur cet appareil uniquement.</p>

    <ul v-else class="recent">
      <li v-for="card in recent" :key="`${card.region}/${formatRiotId(card.riotId)}`" class="recent__row">
        <RouterLink class="recent__link" :to="{ name: 'profile', params: { region: card.region, riotId: toRiotIdSlug(card.riotId) } }">
          <PlayerIdentity :player="card" show-region />
        </RouterLink>
        <button type="button" class="recent__remove" :aria-label="`Retirer ${formatRiotId(card.riotId)} des recherches récentes`" @click="remove(card)">
          <span aria-hidden="true">×</span>
        </button>
      </li>
    </ul>
  </Panel>
</template>

<style scoped>
.recent {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.recent__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-bottom: 1px solid var(--line);
}

.recent__row:last-child {
  border-bottom: none;
}

.recent__link {
  flex: 1;
  min-width: 0;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
}

.recent__link:hover {
  background: var(--fill-hover);
}

.recent__remove,
.recent__clear {
  border: none;
  background: none;
  color: var(--text-secondary);
  font: inherit;
  cursor: pointer;
}

.recent__remove {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
}

.recent__remove:hover,
.recent__clear:hover {
  color: var(--text-primary);
}

.recent__remove:hover {
  background: var(--fill-hover);
}

.recent__clear {
  font-size: var(--text-sm);
}

.recent__empty {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
