<script setup lang="ts">
import type { PlayerCard } from "@/types/search";
import { formatRankName, formatRegion } from "@/utils/labels";
import { formatInteger } from "@/utils/format";
import ProfileIcon from "@/components/game/icon/ProfileIcon.vue";
import RankIcon from "@/components/game/icon/RankIcon.vue";

withDefaults(defineProps<{ player: PlayerCard; showRegion?: boolean; showLp?: boolean }>(), { showRegion: false, showLp: false });
</script>

<template>
  <span class="identity">
    <span class="identity__icon">
      <ProfileIcon :icon-id="player.profileIconId" :size="32" />
      <span class="identity__level">{{ player.summonerLevel }}</span>
    </span>
    <span class="identity__text">
      <span class="identity__name">
        {{ player.riotId.gameName }}<span class="identity__tag">#{{ player.riotId.tagLine }}</span>
      </span>
      <span class="identity__rank">
        <RankIcon :tier="player.rank?.tier ?? null" :size="14" decorative />
        {{ player.rank ? formatRankName(player.rank) : "Non classé" }}
        <template v-if="showLp && player.rank"> · {{ formatInteger(player.rank.lp) }} LP</template>
        <template v-if="showRegion"> · {{ formatRegion(player.region) }}</template>
      </span>
    </span>
  </span>
</template>

<style scoped>
.identity {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.identity__icon {
  position: relative;
  flex-shrink: 0;
}

.identity__level {
  position: absolute;
  bottom: -5px;
  left: 50%;
  translate: -50% 0;
  padding: 0 3px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--fill-base);
  font-size: 9px;
  line-height: 11px;
  color: var(--text-secondary);
}

.identity__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.identity__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--weight-semibold);
}

.identity__tag {
  font-weight: var(--weight-regular);
  color: var(--text-secondary);
}

.identity__rank {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
</style>
