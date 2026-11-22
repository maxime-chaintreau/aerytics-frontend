<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import type { MatchDetail } from "@/types/match";
import { useStaticDataStore } from "@/stores/staticData";
import { focusedParticipant, laneOpponent } from "@/features/match/matchLogic";
import { formatQueue, formatResult, formatRole } from "@/utils/labels";
import { formatDateTime, formatDecimal, formatDuration, formatPercent, formatRelativeTime, formatSigned } from "@/utils/format";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import ItemSlots from "@/components/game/ItemSlots.vue";
import RuneIcon from "@/components/game/icon/RuneIcon.vue";
import SummonerSpellIcon from "@/components/game/icon/SummonerSpellIcon.vue";
import Tag from "@/components/ui/Tag.vue";
import Dialog from "@/components/ui/Dialog.vue";

const RunePageDetail = defineAsyncComponent(() => import("@/components/game/RunePageDetail.vue"));

const props = defineProps<{ match: MatchDetail }>();

const staticData = useStaticDataStore();

const player = computed(() => focusedParticipant(props.match));
const opponent = computed(() => laneOpponent(props.match, player.value));
const stats = computed(() => player.value.stats);

const championName = (id: number) => staticData.champion(id)?.name ?? "…";

const minutes = computed(() => props.match.durationSeconds / 60);

const splashStyle = computed(() => {
  const champion = staticData.champion(player.value.championId);
  return champion ? { "--splash": `url("${staticData.championSplashUrl(champion)}")` } : undefined;
});

const runesOpen = ref(false);
</script>

<template>
  <section class="match-header" :class="`match-header--${match.result.toLowerCase()}`" :style="splashStyle" aria-labelledby="match-title">
    <!-- ===== Result ===== -->
    <div class="match-header__result">
      <p class="match-header__result-label">{{ formatResult(match.result) }}</p>
      <p class="match-header__muted">
        <template v-if="match.focus.lpChange !== null && !match.remake">{{ formatSigned(match.focus.lpChange) }} LP · </template>
        {{ formatDuration(match.durationSeconds) }}
      </p>
    </div>

    <!-- ===== Champion, spells, runes ===== -->
    <div class="match-header__loadout">
      <div class="match-header__champion">
        <ChampionIcon :champion-id="player.championId" :size="64" decorative />
        <span class="match-header__level" :title="`Niveau ${player.championLevel}`">{{ player.championLevel }}</span>
      </div>
      <div class="match-header__pair">
        <SummonerSpellIcon v-for="key in player.summonerSpells" :key="key" :spell-key="key" />
      </div>
      <button type="button" class="match-header__pair match-header__runes" aria-haspopup="dialog" title="Voir la page de runes" @click="runesOpen = true">
        <RuneIcon :rune-id="player.runes.primary[0]!" :size="28" decorative />
        <RuneIcon :rune-id="player.runes.subStyle" :size="18" decorative />
        <span class="visually-hidden">Voir la page de runes</span>
      </button>
    </div>

    <!-- ===== Line ===== -->
    <div class="match-header__line">
      <h1 id="match-title" class="match-header__title" tabindex="-1">
        {{ championName(player.championId) }} {{ formatRole(player.role) }}
        <span v-if="opponent" class="match-header__versus">vs {{ championName(opponent.championId) }}</span>
      </h1>
      <p class="match-header__stats">
        <strong class="match-header__kda">{{ stats.kills }} / {{ stats.deaths }} / {{ stats.assists }}</strong>
        <span>{{ formatDecimal(stats.kda, 2) }} KDA</span>
        <span>{{ stats.cs }} CS ({{ formatDecimal(stats.cs / minutes) }}/min)</span>
        <span>Vision {{ stats.visionScore }}</span>
        <span>{{ formatPercent(stats.killParticipation) }} KP</span>
      </p>
      <ItemSlots class="match-header__items" :items="player.items" :role-quest="player.roleQuest" />
    </div>

    <!-- ===== Context ===== -->
    <dl class="match-header__context">
      <div>
        <dt class="visually-hidden">File</dt>
        <dd>{{ formatQueue(match.queue) }}</dd>
      </div>
      <div>
        <dt class="visually-hidden">Jouée</dt>
        <dd>
          <time :datetime="match.startedAt" :title="formatDateTime(match.startedAt)">{{ formatRelativeTime(match.startedAt) }}</time>
        </dd>
      </div>
      <div>
        <dt class="visually-hidden">Patch</dt>
        <dd>Patch {{ match.patch }}</dd>
      </div>
      <div v-if="match.endedInSurrender">
        <dt class="visually-hidden">Fin</dt>
        <dd><Tag>Capitulation</Tag></dd>
      </div>
    </dl>

    <Dialog v-model:open="runesOpen" title="Page de runes" :subtitle="`${championName(player.championId)} · ${formatRole(player.role)}`">
      <RunePageDetail :runes="player.runes" />
    </Dialog>
  </section>
</template>

<style scoped>
.match-header {
  --result-color: var(--state-win);
  container-type: inline-size;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4) var(--space-6);
  padding: var(--space-6);
  background: var(--fill-panel);
  border: 1px solid var(--line);
  border-left: 4px solid var(--result-color);
  border-radius: var(--radius-md);
}

.match-header--loss {
  --result-color: var(--state-loss);
}

.match-header--remake {
  --result-color: var(--text-secondary);
}

@media (min-width: 900px) {
  .match-header::before {
    content: "";
    position: absolute;
    inset: 0 0 0 40%;
    z-index: -1;
    background-image: var(--splash, none);
    background-size: cover;
    background-position: center 20%;
    opacity: 0.3;
    mask-image: linear-gradient(to right, transparent, black 50%);
  }
}

.match-header__result {
  min-width: 120px;
}

.match-header__result-label {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  line-height: 1;
  color: var(--result-color);
}

.match-header__muted {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.match-header__loadout {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.match-header__champion {
  position: relative;
}

.match-header__level {
  position: absolute;
  right: -4px;
  bottom: -4px;
  min-width: 22px;
  padding: 1px 4px;
  border: 1px solid var(--accent-gold);
  border-radius: var(--radius-sm);
  background: var(--fill-base);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-align: center;
}

.match-header__pair {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.match-header__runes {
  justify-content: center;
  padding: var(--space-1);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
}

.match-header__runes:hover {
  border-color: var(--line);
  background: var(--fill-hover);
}

.match-header__line {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  flex: 1 1 280px;
}

.match-header__title {
  font-size: var(--text-lg);
  line-height: 1.2;
}

.match-header__versus {
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
}

.match-header__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.match-header__kda {
  color: var(--text-primary);
}

.match-header__items {
  --item-size: 28px;
  --item-gap: var(--space-1);
}

.match-header__context {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
  margin: 0 0 0 auto;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: right;
}

.match-header__context dd {
  margin: 0;
}

@container (max-width: 640px) {
  .match-header__context {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-3);
    width: 100%;
    margin-left: 0;
    text-align: left;
  }
}
</style>
