<script setup lang="ts">
import { computed } from "vue";
import type { PlayerKey } from "@/types/riot";
import type { MatchSummary } from "@/types/profile";
import { useStaticDataStore } from "@/stores/staticData";
import { csPerMinute, matchKda } from "@/features/profile/profileLogic";
import { toRiotIdSlug } from "@/utils/riotId";
import { formatDecimal, formatDuration, formatRelativeTime, formatSigned } from "@/utils/format";
import ChampionIcon from "@/components/game/ChampionIcon.vue";
import ItemIcon from "@/components/game/ItemIcon.vue";

const props = defineProps<{ match: MatchSummary; player: PlayerKey }>();

const staticData = useStaticDataStore();

const RESULT_LABELS = { WIN: "Victoire", LOSS: "Défaite", REMAKE: "Remake" } as const;

const link = computed(() => ({
  name: "match",
  params: { region: props.player.region, riotId: toRiotIdSlug(props.player.riotId), matchId: props.match.matchId },
}));

const championName = computed(() => staticData.champion(props.match.championId)?.name ?? "…");
const opponentName = computed(() => (props.match.opponentChampionId === null ? null : (staticData.champion(props.match.opponentChampionId)?.name ?? "…")));
</script>

<template>
  <RouterLink :to="link" class="match" :class="`match--${match.result.toLowerCase()}`">
    <!-- ===== Result ===== -->
    <div class="match__result">
      <span class="match__result-label">{{ RESULT_LABELS[match.result] }}</span>
      <span v-if="match.lpChange !== null && match.result !== 'REMAKE'" class="match__muted"> {{ formatSigned(match.lpChange) }} LP </span>
    </div>

    <!-- ===== Champion vs opponent ===== -->
    <div class="match__champion">
      <ChampionIcon :champion-id="match.championId" decorative />
      <div class="match__stack">
        <span class="match__strong">{{ championName }}</span>
        <span v-if="opponentName" class="match__muted">vs {{ opponentName }}</span>
      </div>
    </div>

    <!-- ===== K/D/A ===== -->
    <div class="match__stack match__kda">
      <span class="match__strong">
        {{ match.kills }} / <span class="match__deaths">{{ match.deaths }}</span> / {{ match.assists }}
      </span>
      <span class="match__muted">{{ formatDecimal(matchKda(match)) }} KDA</span>
    </div>

    <!-- ===== CS ===== -->
    <div class="match__stack match__cs">
      <span class="match__strong">{{ match.cs }} CS</span>
      <span class="match__muted">{{ formatDecimal(csPerMinute(match)) }} / min</span>
    </div>

    <!-- ===== Items ===== -->
    <div class="match__items">
      <ItemIcon v-for="(itemId, slot) in match.items" :key="slot" :item-id="itemId" />
    </div>

    <!-- ===== Duration and date ===== -->
    <div class="match__stack match__time">
      <span class="match__strong">{{ formatDuration(match.durationSeconds) }}</span>
      <span class="match__muted">{{ formatRelativeTime(match.playedAt) }}</span>
    </div>

    <span class="match__arrow" aria-hidden="true">›</span>
    <span class="visually-hidden">Voir l'analyse de la partie</span>
  </RouterLink>
</template>

<style scoped>
.match {
  display: grid;
  grid-template-columns: 72px minmax(140px, 1.4fr) minmax(88px, 1fr) minmax(76px, 1fr) auto minmax(88px, 1fr) 16px;
  grid-template-areas: "result champion kda cs items time arrow";
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-left: 3px solid var(--result-color);
  border-radius: var(--radius-sm);
  background: var(--fill-panel-2);
  font-size: var(--text-sm);
  transition: background-color 0.15s;
  --champion-size: 40px;
  --item-size: 24px;
}

.match:hover {
  background: var(--fill-hover);
}

.match--win {
  --result-color: var(--state-win);
}

.match--loss {
  --result-color: var(--state-loss);
}

.match--remake {
  --result-color: var(--text-secondary);
}

.match__result {
  grid-area: result;
  display: flex;
  flex-direction: column;
}

.match__result-label {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--result-color);
}

.match__champion {
  grid-area: champion;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.match__stack {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.match__kda {
  grid-area: kda;
}

.match__cs {
  grid-area: cs;
}

.match__time {
  grid-area: time;
}

.match__items {
  grid-area: items;
  display: flex;
  gap: 3px;
}

.match__items > :last-child {
  margin-left: var(--space-1);
}

.match__strong {
  font-weight: var(--weight-semibold);
  white-space: nowrap;
}

.match__muted {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
}

.match__deaths {
  color: var(--state-negative);
}

.match__arrow {
  grid-area: arrow;
  font-size: var(--text-lg);
  line-height: 1;
  color: var(--text-secondary);
  transition: transform 0.15s;
}

.match:hover .match__arrow {
  color: var(--text-primary);
  transform: translateX(2px);
}

@container match-list (max-width: 720px) {
  .match {
    grid-template-columns: 56px minmax(0, 1fr) auto 10px;
    grid-template-areas:
      "result champion kda   arrow"
      "time   items    cs    arrow";
    gap: var(--space-2) 6px;
    padding: var(--space-2);
    --champion-size: 32px;
    --item-size: 18px;
  }

  .match__cs,
  .match__kda {
    text-align: right;
  }

  .match__items {
    gap: 2px;
  }

  .match__items > :last-child {
    margin-left: 2px;
  }

  .match__kda .match__strong {
    word-spacing: -2px;
  }
}

@container match-list (max-width: 300px) {
  .match {
    grid-template-columns: 48px minmax(0, 1fr) auto 10px;
    --item-size: 16px;
  }
}
</style>
