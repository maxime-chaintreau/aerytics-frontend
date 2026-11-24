<script setup lang="ts">
import type { MatchParticipant } from "@/types/match";
import { useStaticDataStore } from "@/stores/staticData";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";

defineProps<{ participants: MatchParticipant[]; label: string }>();
const selected = defineModel<string>({ required: true });

const staticData = useStaticDataStore();
</script>

<template>
  <div class="picker" role="group" :aria-label="label">
    <div v-for="side in ['BLUE', 'RED'] as const" :key="side" class="picker__team" :class="`picker__team--${side.toLowerCase()}`">
      <button
        v-for="player in participants.filter((participant) => participant.side === side)"
        :key="player.puuid"
        type="button"
        class="picker__player"
        :aria-pressed="selected === player.puuid"
        :aria-label="`${staticData.champion(player.championId)?.name ?? ''} — ${player.riotId.gameName}`"
        :title="player.riotId.gameName"
        @click="selected = player.puuid"
      >
        <ChampionIcon :champion-id="player.championId" :size="32" decorative />
      </button>
    </div>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.picker__team {
  display: flex;
  gap: var(--space-1);
  padding: 2px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--team-color) 12%, transparent);
}

.picker__team--blue {
  --team-color: var(--team-blue);
}

.picker__team--red {
  --team-color: var(--team-red);
}

.picker__player {
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 150ms ease;
}

.picker__player:hover {
  opacity: 1;
}

.picker__player[aria-pressed="true"] {
  border-color: var(--team-color);
  opacity: 1;
}
</style>
