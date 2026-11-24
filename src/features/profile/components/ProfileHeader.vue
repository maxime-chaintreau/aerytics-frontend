<script setup lang="ts">
import { computed, ref } from "vue";
import type { PlayerKey, RoleFilter } from "@/types/riot";
import { useProfileSummary } from "@/composables/useProfileQueries";
import { useStaticDataStore } from "@/stores/staticData";
import { formatRiotId } from "@/utils/riotId";
import { formatRole } from "@/utils/labels";
import { formatDecimal, formatPercent } from "@/utils/format";
import StatTile from "@/components/ui/StatTile.vue";
import Tag from "@/components/ui/Tag.vue";
import RankBadge from "@/components/game/RankBadge.vue";
import placeholderUrl from "@/assets/riot/summoner-none.jpg";

const props = defineProps<{ player: PlayerKey; role: RoleFilter }>();

const {
  data: summary,
  isPending,
  error,
} = useProfileSummary(
  () => props.player,
  () => props.role,
);
const staticData = useStaticDataStore();

// the URL version ("kaori#euw") right away, the server's ("Kaori#EUW") once it arrives
const displayName = computed(() => formatRiotId(summary.value?.riotId ?? props.player.riotId));

const mainChampion = computed(() => {
  const id = summary.value?.mainChampionId;
  return id == null ? undefined : staticData.champion(id);
});

const roleLabel = computed(() => {
  if (!summary.value) return "";
  if (props.role === "ALL") return "Tous rôles";
  return formatRole(props.role === "MAIN" ? summary.value.mainRole : props.role);
});

const iconUrl = computed(() => (summary.value ? staticData.profileIconUrl(summary.value.profileIconId) : undefined));

// passed to CSS as a variable: CSS only downloads it on wide screens
const splashStyle = computed(() => (mainChampion.value ? { "--splash": `url("${staticData.championSplashUrl(mainChampion.value)}")` } : undefined));

const streakLabel = computed(() => {
  const streak = summary.value?.streak;
  if (!streak || streak.count < 2) return null;
  const word = streak.result === "WIN" ? "victoires" : "défaites";
  return { text: `Série : ${streak.count} ${word}`, tone: streak.result === "WIN" ? "positive" : "negative" } as const;
});

const failedIconUrl = ref<string>();
const iconFailed = computed(() => iconUrl.value !== undefined && iconUrl.value === failedIconUrl.value);
</script>

<template>
  <section class="profile-header" :style="splashStyle" aria-labelledby="profile-name">
    <!-- ===== Identity ===== -->
    <div class="profile-header__identity">
      <img v-if="iconUrl && !iconFailed" class="profile-header__icon" :src="iconUrl" alt="" width="72" height="72" decoding="async" @error="failedIconUrl = iconUrl" />
      <span v-else-if="isPending" class="profile-header__icon skeleton" />
      <img v-else class="profile-header__icon" :src="placeholderUrl" alt="" width="72" height="72" />

      <div class="profile-header__text">
        <h1 id="profile-name" class="profile-header__name" tabindex="-1">{{ displayName }}</h1>

        <template v-if="summary">
          <p class="profile-header__meta">
            {{ roleLabel }}
            <template v-if="mainChampion"> · main {{ mainChampion.name }}</template>
            · {{ summary.rankedGames }} parties classées
          </p>
          <div class="profile-header__tags">
            <RankBadge :rank="summary.rank" />
            <Tag v-if="streakLabel" :tone="streakLabel.tone">{{ streakLabel.text }}</Tag>
          </div>
        </template>

        <template v-else-if="isPending">
          <span class="skeleton" style="width: 260px; height: 18px" />
          <span class="skeleton" style="width: 200px; height: 24px" />
        </template>

        <div v-else-if="error" role="alert" class="profile-header__error">Impossible de charger le profil. Clique sur « Actualiser » pour réessayer.</div>
      </div>
    </div>

    <!-- ===== Headline stats ===== -->
    <dl v-if="summary?.stats" class="profile-header__stats">
      <StatTile label="Winrate" :value="formatPercent(summary.stats.winrate)" />
      <StatTile label="KDA" :value="formatDecimal(summary.stats.kda)" />
      <StatTile label="CS / min" :value="formatDecimal(summary.stats.csPerMin)" />
      <StatTile label="Vision / min" :value="formatDecimal(summary.stats.visionPerMin)" />
    </dl>
    <p v-else-if="summary" class="profile-header__no-games">Aucune partie classée sur ce rôle cette saison.</p>
    <div v-else-if="isPending" class="profile-header__stats" aria-hidden="true">
      <span v-for="n in 4" :key="n" class="skeleton" style="width: 72px; height: 52px" />
    </div>

    <p v-if="isPending" class="visually-hidden" role="status">Chargement du profil…</p>
  </section>
</template>

<style scoped>
.profile-header {
  container-type: inline-size;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-6);
  background: var(--fill-panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

@media (min-width: 900px) {
  .profile-header::before {
    content: "";
    position: absolute;
    inset: 0 0 0 35%;
    z-index: -1;
    background-image: var(--splash, none);
    background-size: cover;
    background-position: center 20%;
    opacity: 0.35;
    mask-image: linear-gradient(to right, transparent, black 45%);
  }
}

.profile-header__identity {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;
}

.profile-header__icon {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid var(--accent-gold);
}

.profile-header__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.profile-header__name {
  font-size: var(--text-xl);
  line-height: 1;
  overflow-wrap: anywhere;
}

.profile-header__meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.profile-header__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.profile-header__stats {
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: var(--space-8);
  margin: 0;
}

.profile-header__no-games {
  color: var(--text-secondary);
}

.profile-header__error {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--state-negative);
}

@container (max-width: 342px) {
  .profile-header__stats {
    grid-template-columns: repeat(2, auto);
    gap: var(--space-4) var(--space-8);
  }
}
</style>
