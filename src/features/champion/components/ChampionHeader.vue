<script setup lang="ts">
import { computed } from "vue";
import type { ChampionStats } from "@/types/champion";
import type { ChampionInfo } from "@/types/staticData";
import { useStaticDataStore } from "@/stores/staticData";
import { formatClasses } from "@/features/champion/championLogic";
import { statsTierLabel } from "@/utils/statsTier";
import { metaTierTone, statWinrateTone } from "@/utils/tones";
import { formatInteger, formatOrdinal, formatPercent } from "@/utils/format";
import { formatRole } from "@/utils/labels";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import Tag from "@/components/ui/Tag.vue";

const props = defineProps<{ champion: ChampionInfo; stats: ChampionStats }>();

const staticData = useStaticDataStore();
const splashStyle = computed(() => ({ "--splash": `url("${staticData.championSplashUrl(props.champion)}")` }));

const summary = computed(() => props.stats.summary);
</script>

<template>
  <header class="champion-header" :style="splashStyle">
    <ChampionIcon :champion-id="champion.key" :size="96" decorative class="champion-header__portrait" />

    <div class="champion-header__identity">
      <h1 tabindex="-1" class="champion-header__name">{{ champion.name }}</h1>
      <p class="champion-header__title">{{ champion.title }}</p>
      <p v-if="champion.tags.length" class="champion-header__classes">{{ formatClasses(champion.tags) }}</p>

      <div class="champion-header__tags">
        <Tag :tone="metaTierTone(summary.tier)"> Tier {{ summary.tier }} · {{ formatOrdinal(summary.rank) }} sur {{ summary.rankOf }} en {{ formatRole(stats.role) }} </Tag>
        <Tag>Patch {{ stats.patch }} · {{ statsTierLabel(stats.tier) }}</Tag>
      </div>
    </div>

    <dl class="champion-header__stats">
      <div>
        <dt>Victoires</dt>
        <dd :class="`tone-${statWinrateTone(summary.winrate)}`">{{ formatPercent(summary.winrate) }}</dd>
      </div>
      <div>
        <dt>Sélection</dt>
        <dd>{{ formatPercent(summary.pickRate) }}</dd>
      </div>
      <div>
        <dt>Bannissement</dt>
        <dd>{{ formatPercent(summary.banRate) }}</dd>
      </div>
      <div>
        <dt>Parties</dt>
        <dd>{{ formatInteger(summary.games) }}</dd>
      </div>
    </dl>
  </header>
</template>

<style scoped>
.champion-header {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--space-4) var(--space-6);
  padding: var(--space-6);
  background: var(--fill-panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

@media (min-width: 900px) {
  .champion-header {
    grid-template-columns: auto 1fr auto;
  }

  .champion-header::before {
    content: "";
    position: absolute;
    inset: 0 0 0 30%;
    z-index: -1;
    background-image: var(--splash);
    background-size: cover;
    background-position: center 20%;
    opacity: 0.35;
    mask-image: linear-gradient(to right, transparent, black 45%);
  }
}

.champion-header__portrait {
  border: 2px solid var(--accent-gold);
  border-radius: var(--radius-md);
}

.champion-header__identity {
  min-width: 0;
}

.champion-header__name {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  line-height: 1;
}

.champion-header__title::first-letter {
  text-transform: uppercase;
}

.champion-header__title {
  margin-top: var(--space-1);
  color: var(--text-secondary);
}

.champion-header__classes {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.champion-header__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.champion-header__stats {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, auto));
  justify-content: start;
  gap: var(--space-6);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 900px) {
  .champion-header__stats {
    grid-column: auto;
  }
}

.champion-header__stats dt {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.champion-header__stats dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}

@media (max-width: 520px) {
  .champion-header {
    padding: var(--space-4);
  }

  .champion-header__name {
    font-size: var(--text-xl);
  }

  .champion-header__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }
}
</style>
