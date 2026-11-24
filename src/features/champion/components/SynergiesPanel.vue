<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import type { ChampionStats } from "@/types/champion";
import { useStaticDataStore } from "@/stores/staticData";
import { championRoute } from "@/router/links";
import { statWinrateTone } from "@/utils/tones";
import { formatRole } from "@/utils/labels";
import { formatCompact, formatPercent } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import RoleIcon from "@/components/game/icon/RoleIcon.vue";

const props = defineProps<{ stats: ChampionStats }>();

const staticData = useStaticDataStore();

const SHOWN = 5;
const synergies = computed(() =>
  props.stats.synergies.slice(0, SHOWN).map((synergy) => {
    const ally = staticData.champion(synergy.championId);
    return {
      ...synergy,
      name: ally?.name ?? "Champion",
      link: ally ? championRoute(ally, { role: synergy.role, tier: props.stats.tier }) : undefined,
    };
  }),
);
</script>

<template>
  <Panel title="Meilleurs alliés">
    <ul class="synergies">
      <li v-for="synergy in synergies" :key="`${synergy.championId}-${synergy.role}`">
        <component :is="synergy.link ? RouterLink : 'div'" :to="synergy.link" class="synergies__row">
          <span class="synergies__icon">
            <ChampionIcon :champion-id="synergy.championId" :size="32" decorative />
            <RoleIcon :role="synergy.role" :size="16" decorative class="synergies__role" />
          </span>
          <span class="synergies__name">
            {{ synergy.name }}
            <span class="synergies__muted">{{ formatRole(synergy.role) }} · {{ formatCompact(synergy.games) }} parties</span>
          </span>
          <span class="synergies__winrate" :class="`tone-${statWinrateTone(synergy.winrate)}`">{{ formatPercent(synergy.winrate) }}</span>
        </component>
      </li>
    </ul>
  </Panel>
</template>

<style scoped>
.synergies {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.synergies__row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  color: inherit;
  text-decoration: none;
}

a.synergies__row:hover {
  background: var(--fill-hover);
}

.synergies__icon {
  position: relative;
  flex-shrink: 0;
}

.synergies__role {
  position: absolute;
  right: -4px;
  bottom: -4px;
  padding: 1px;
  border-radius: 50%;
  background: var(--fill-base);
}

.synergies__name {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  font-weight: var(--weight-semibold);
}

.synergies__muted {
  font-size: var(--text-xs);
  font-weight: var(--weight-regular);
  color: var(--text-secondary);
}

.synergies__winrate {
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
}
</style>
