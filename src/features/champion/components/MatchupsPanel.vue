<script setup lang="ts">
import { computed, ref } from "vue";
import type { ChampionStats, Matchup } from "@/types/champion";
import type { ChampionInfo } from "@/types/staticData";
import { useStaticDataStore } from "@/stores/staticData";
import { matchupSections, reliability } from "@/features/champion/championLogic";
import { statWinrateTone } from "@/utils/tones";
import { formatCompact, formatPercent } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import MatchupDialog from "@/features/champion/components/MatchupDialog.vue";

const props = defineProps<{ champion: ChampionInfo; stats: ChampionStats }>();

const staticData = useStaticDataStore();

const sections = computed(() => {
  const { mostPlayed, favorable, difficult } = matchupSections(props.stats.matchups);
  return [
    { id: "most-played", title: "Les plus fréquents", matchups: mostPlayed },
    { id: "favorable", title: "Favorables", matchups: favorable },
    { id: "difficult", title: "Difficiles", matchups: difficult },
  ];
});

const showAll = ref(false);
const allMatchups = computed(() => [...props.stats.matchups].sort((a, b) => b.games - a.games));

const opened = ref<Matchup | null>(null);
const dialogOpen = ref(false);
function openMatchup(matchup: Matchup) {
  opened.value = matchup;
  dialogOpen.value = true;
}
</script>

<template>
  <Panel title="Affrontements" :aside="`${stats.matchups.length} adversaires`">
    <div class="matchups">
      <section v-for="section in sections" :key="section.id" class="matchups__section" :aria-labelledby="`matchups-${section.id}`">
        <h3 :id="`matchups-${section.id}`" class="matchups__heading">{{ section.title }}</h3>
        <ul class="matchups__list">
          <li v-for="matchup in section.matchups" :key="matchup.championId">
            <button type="button" class="matchups__row" aria-haspopup="dialog" @click="openMatchup(matchup)">
              <ChampionIcon :champion-id="matchup.championId" :size="32" decorative />
              <span class="matchups__name">{{ staticData.champion(matchup.championId)?.name ?? "Champion" }}</span>
              <span class="matchups__winrate" :class="`tone-${statWinrateTone(matchup.winrate)}`">{{ formatPercent(matchup.winrate) }}</span>
              <span class="matchups__games">
                {{ formatCompact(matchup.games) }} parties
                <span v-if="reliability(matchup.games) === 'low'" class="matchups__low">· peu fiable</span>
              </span>
            </button>
          </li>
        </ul>
      </section>
    </div>

    <button type="button" class="button matchups__toggle" :aria-expanded="showAll" aria-controls="matchups-all" @click="showAll = !showAll">
      {{ showAll ? "Masquer" : `Voir les ${stats.matchups.length} adversaires` }}
    </button>

    <ul v-show="showAll" id="matchups-all" class="matchups__list matchups__list--all" aria-label="Tous les adversaires, du plus fréquent au plus rare">
      <li v-for="matchup in allMatchups" :key="matchup.championId">
        <button type="button" class="matchups__row" aria-haspopup="dialog" @click="openMatchup(matchup)">
          <ChampionIcon :champion-id="matchup.championId" :size="24" decorative />
          <span class="matchups__name">{{ staticData.champion(matchup.championId)?.name ?? "Champion" }}</span>
          <span class="matchups__winrate" :class="`tone-${statWinrateTone(matchup.winrate)}`">{{ formatPercent(matchup.winrate) }}</span>
          <span class="matchups__games">{{ formatCompact(matchup.games) }}</span>
        </button>
      </li>
    </ul>

    <MatchupDialog v-model:open="dialogOpen" :champion="champion" :stats="stats" :matchup="opened" />
  </Panel>
</template>

<style scoped>
.matchups {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.matchups__heading {
  margin-bottom: var(--space-1);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.matchups__list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.matchups__list--all {
  max-height: 360px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.matchups__row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "icon name winrate"
    "icon games games";
  align-items: center;
  column-gap: var(--space-3);
  width: 100%;
  padding: var(--space-2);
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.matchups__list--all .matchups__row {
  grid-template-areas: "icon name winrate games";
  grid-template-columns: auto 1fr auto 4ch;
  padding-block: var(--space-1);
}

.matchups__row:hover {
  background: var(--fill-hover);
}

.matchups__row:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.matchups__row > :first-child {
  grid-area: icon;
}

.matchups__name {
  grid-area: name;
  overflow: hidden;
  font-weight: var(--weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.matchups__winrate {
  grid-area: winrate;
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
}

.matchups__games {
  grid-area: games;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.matchups__list--all .matchups__games {
  text-align: right;
}

.matchups__low {
  color: var(--state-negative);
}

.matchups__toggle {
  align-self: flex-start;
}
</style>
