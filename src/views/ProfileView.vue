<script setup lang="ts">
// Profile page, the player comes from the URL
import { computed, reactive } from "vue";
import { usePlayerFromRoute } from "@/composables/usePlayerFromRoute";
import { useChampionPool, usePlayerMatches, useProfileSummary } from "@/composables/useProfileQueries";
import { isNotFound } from "@/services/http";
import { formatRiotId } from "@/utils/riotId";
import { formatDecimal, formatDuration, formatPercent, formatRelativeTime, formatSigned } from "@/utils/format";

const player = usePlayerFromRoute();

const summary = reactive(useProfileSummary(player));
const championPool = reactive(useChampionPool(player));
const matches = reactive(usePlayerMatches(player));

// the Riot ID as the server writes it ("Kaori#EUW"), the URL version until it arrives ("kaori#euw")
const displayName = computed(() => (player.value ? formatRiotId(summary.data?.riotId ?? player.value.riotId) : ""));

const notFound = computed(() => player.value === null || isNotFound(summary.error));

const isRefreshing = computed(() => summary.isLoading || championPool.isLoading || matches.isLoading);

function refreshAll() {
  summary.refresh();
  championPool.refresh();
  matches.refresh();
}
</script>

<template>
  <template v-if="notFound">
    <h1 tabindex="-1">Joueur introuvable</h1>
    <p>Vérifie le Riot ID et la région.</p>
    <p><RouterLink to="/">&lt;- Retour à l'accueil</RouterLink></p>
  </template>

  <template v-else-if="player">
    <h1 tabindex="-1">{{ displayName }}</h1>

    <button type="button" :disabled="isRefreshing" @click="refreshAll">Actualiser</button>

    <!-- ===== Summary ===== -->
    <section aria-labelledby="summary-title">
      <h2 id="summary-title">Résumé</h2>

      <p v-if="summary.isPending && summary.isLoading" role="status">Chargement du profil…</p>

      <div v-else-if="!summary.data" role="alert">
        <p>Impossible de charger le profil.</p>
        <button type="button" :disabled="summary.isLoading" @click="summary.refresh()">Réessayer</button>
      </div>

      <template v-else>
        <p v-if="summary.isLoading" role="status">Mise à jour…</p>
        <p>
          <template v-if="summary.data.rank"> {{ summary.data.rank.tier }} {{ summary.data.rank.division }} · {{ summary.data.rank.lp }} LP </template>
          <template v-else>Non classé</template>
          · {{ summary.data.rankedGames }} parties classées
        </p>
        <ul>
          <li>Winrate {{ formatPercent(summary.data.stats.winrate) }}</li>
          <li>KDA {{ formatDecimal(summary.data.stats.kda) }}</li>
          <li>CS/min {{ formatDecimal(summary.data.stats.csPerMin) }}</li>
          <li>Vision/min {{ formatDecimal(summary.data.stats.visionPerMin) }}</li>
        </ul>
      </template>
    </section>

    <!-- ===== Champion pool ===== -->
    <section aria-labelledby="pool-title">
      <h2 id="pool-title">Pool de champions</h2>

      <p v-if="championPool.isPending && championPool.isLoading" role="status">Chargement…</p>
      <div v-else-if="!championPool.data" role="alert">
        <p>Impossible de charger les champions.</p>
        <button type="button" @click="championPool.refresh()">Réessayer</button>
      </div>
      <ul v-else>
        <li v-for="champion in championPool.data" :key="champion.championId">
          Champion #{{ champion.championId }} · {{ champion.games }} parties · {{ formatPercent(champion.winrate) }} · {{ formatDecimal(champion.kda) }} KDA
        </li>
      </ul>
    </section>

    <!-- ===== Recent matches ===== -->
    <section aria-labelledby="matches-title">
      <h2 id="matches-title">Dernières parties</h2>

      <p v-if="matches.isPending && matches.isLoading" role="status">Chargement…</p>
      <div v-else-if="!matches.data" role="alert">
        <p>Impossible de charger les parties.</p>
        <button type="button" @click="matches.refresh()">Réessayer</button>
      </div>
      <p v-else-if="matches.data.matches.length === 0">Aucune partie récente.</p>
      <ul v-else>
        <li v-for="match in matches.data.matches" :key="match.matchId">
          {{ match.result === "WIN" ? "Victoire" : match.result === "LOSS" ? "Défaite" : "Remake" }}
          <template v-if="match.lpChange !== null">({{ formatSigned(match.lpChange) }} LP)</template>
          · {{ match.kills }}/{{ match.deaths }}/{{ match.assists }} · {{ match.cs }} CS · {{ formatDuration(match.durationSeconds) }} · {{ formatRelativeTime(match.playedAt) }}
        </li>
      </ul>
    </section>
  </template>
</template>
