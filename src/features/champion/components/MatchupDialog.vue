<script setup lang="ts">
import { computed } from "vue";
import type { ChampionStats, Matchup } from "@/types/champion";
import type { ChampionInfo } from "@/types/staticData";
import { useStaticDataStore } from "@/stores/staticData";
import { RELIABILITY_LABELS, formatLaneDiff, reliability } from "@/features/champion/championLogic";
import { championRoute } from "@/router/links";
import { statsTierLabel } from "@/utils/statsTier";
import { diffTone, statWinrateTone } from "@/utils/tones";
import { formatRole } from "@/utils/labels";
import { formatInteger, formatPercent } from "@/utils/format";
import Dialog from "@/components/ui/Dialog.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";

const props = defineProps<{
  champion: ChampionInfo;
  stats: ChampionStats;
  matchup: Matchup | null;
}>();

const open = defineModel<boolean>("open", { required: true });

const staticData = useStaticDataStore();
const opponent = computed(() => (props.matchup ? staticData.champion(props.matchup.championId) : undefined));

const title = computed(() => `${props.champion.name} contre ${opponent.value?.name ?? "?"}`);
const subtitle = computed(() => `${formatRole(props.stats.role)} · Patch ${props.stats.patch} · ${statsTierLabel(props.stats.tier)}`);

const opponentLink = computed(() => (opponent.value ? championRoute(opponent.value, { role: props.stats.role, tier: props.stats.tier }) : undefined));

const level = computed(() => (props.matchup ? reliability(props.matchup.games) : "low"));
</script>

<template>
  <Dialog v-model:open="open" :title="title" :subtitle="subtitle">
    <div v-if="matchup" class="matchup">
      <div class="matchup__versus" aria-hidden="true">
        <ChampionIcon :champion-id="champion.key" :size="56" decorative />
        <span class="matchup__vs">VS</span>
        <ChampionIcon :champion-id="matchup.championId" :size="56" decorative />
      </div>

      <p class="matchup__winrate">
        <span :class="`tone-${statWinrateTone(matchup.winrate)}`">{{ formatPercent(matchup.winrate) }}</span>
        de victoires pour {{ champion.name }}
      </p>

      <dl class="matchup__stats">
        <div>
          <dt>Écart d'or à 15 min</dt>
          <dd :class="`tone-${diffTone(matchup.goldDiff15)}`">{{ formatLaneDiff(matchup.goldDiff15) }}</dd>
        </div>
        <div>
          <dt>Écart d'expérience à 15 min</dt>
          <dd :class="`tone-${diffTone(matchup.xpDiff15)}`">{{ formatLaneDiff(matchup.xpDiff15) }}</dd>
        </div>
        <div>
          <dt>Écart de sbires à 15 min</dt>
          <dd :class="`tone-${diffTone(matchup.csDiff15)}`">{{ formatLaneDiff(matchup.csDiff15, 1) }}</dd>
        </div>
        <div>
          <dt>Premier sang de la voie</dt>
          <dd>{{ formatPercent(matchup.firstBloodRate) }}</dd>
        </div>
        <div>
          <dt>Parties</dt>
          <dd>{{ formatInteger(matchup.games) }}</dd>
        </div>
        <div>
          <dt>Fiabilité</dt>
          <dd :class="{ 'tone-negative': level === 'low' }">{{ RELIABILITY_LABELS[level] }}</dd>
        </div>
      </dl>

      <p v-if="level === 'low'" class="matchup__note">Peu de parties : ce taux de victoire dépend encore beaucoup du hasard.</p>

      <RouterLink v-if="opponentLink" :to="opponentLink" class="button matchup__link" @click="open = false"> Voir la page de {{ opponent?.name }} <span aria-hidden="true">→</span> </RouterLink>
    </div>
  </Dialog>
</template>

<style scoped>
.matchup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.matchup__versus {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.matchup__vs {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  color: var(--text-secondary);
}

.matchup__winrate {
  color: var(--text-secondary);
}

.matchup__winrate span {
  display: block;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  line-height: 1.1;
}

.matchup__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
  width: 100%;
  margin: 0;
}

.matchup__stats > div {
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--fill-base);
}

.matchup__stats dt {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.matchup__stats dd {
  margin: var(--space-1) 0 0;
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
}

.matchup__note {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
