<script setup lang="ts">
import { reactive, ref } from "vue";
import { REGIONS, type Region } from "@/types/riot";
import { useLadder } from "@/composables/useSearchQueries";
import { useRecentSearches } from "@/composables/useRecentSearches";
import { formatRiotId, toRiotIdSlug } from "@/utils/riotId";
import { formatRegion } from "@/utils/labels";
import Panel from "@/components/ui/Panel.vue";
import PlayerIdentity from "@/components/game/PlayerIdentity.vue";

const { lastRegion } = useRecentSearches();
const region = ref<Region>(lastRegion.value);
const ladder = reactive(useLadder(region));
</script>

<template>
  <Panel title="Meilleurs joueurs">
    <template #aside>
      <label class="visually-hidden" for="ladder-region">Région du classement</label>
      <select id="ladder-region" v-model="region" class="ladder__region">
        <option v-for="option in REGIONS" :key="option" :value="option">{{ formatRegion(option) }}</option>
      </select>
    </template>

    <div v-if="ladder.error && !ladder.data" role="alert" class="ladder__message">
      <p>Impossible de charger le classement.</p>
      <button type="button" class="button button--small" :disabled="ladder.isLoading" @click="ladder.refresh()">Réessayer</button>
    </div>

    <div v-else-if="!ladder.data" class="ladder__skeleton" aria-hidden="true">
      <span v-for="n in 5" :key="n" class="skeleton" style="height: 44px" />
    </div>

    <p v-else-if="ladder.data.players.length === 0" class="ladder__message">Aucun joueur classé connu en {{ formatRegion(region) }} pour le moment.</p>

    <ol v-else class="ladder" :aria-busy="ladder.isLoading">
      <li v-for="(card, index) in ladder.data.players" :key="formatRiotId(card.riotId)" class="ladder__row">
        <span class="ladder__place" :class="{ 'ladder__place--top': index < 3 }">{{ index + 1 }}</span>
        <RouterLink class="ladder__link" :to="{ name: 'profile', params: { region: card.region, riotId: toRiotIdSlug(card.riotId) } }">
          <PlayerIdentity :player="card" show-lp />
        </RouterLink>
      </li>
    </ol>
  </Panel>
</template>

<style scoped>
.ladder {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ladder__row {
  display: grid;
  grid-template-columns: 2ch minmax(0, 1fr);
  align-items: center;
  gap: var(--space-2);
  border-bottom: 1px solid var(--line);
}

.ladder__row:last-child {
  border-bottom: none;
}

.ladder__place {
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--text-secondary);
}

.ladder__place--top {
  font-weight: var(--weight-bold);
  color: var(--accent-gold);
}

.ladder__link {
  min-width: 0;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
}

.ladder__link:hover {
  background: var(--fill-hover);
}

.ladder__region {
  padding: 2px var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--fill-panel-2);
  color: var(--text-primary);
  font: inherit;
  font-size: var(--text-sm);
}

.ladder__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ladder__message {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
