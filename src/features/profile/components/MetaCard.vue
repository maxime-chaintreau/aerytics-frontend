<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import type { PlayerKey, Role, RoleFilter, Tier } from "@/types/riot";
import { profileKeys, useProfileSummary } from "@/composables/useProfileQueries";
import { useRoleMeta } from "@/composables/useMetaQueries";
import { useStaticDataStore } from "@/stores/staticData";
import { statsTierFor } from "@/utils/statsTier";
import { metaTierTone, statWinrateTone } from "@/utils/tones";
import { formatRole, formatTier } from "@/utils/labels";
import { formatPercent } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import Tag from "@/components/ui/Tag.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import ChampionLink from "@/components/game/ChampionLink.vue";

const props = defineProps<{ player: PlayerKey; role: RoleFilter }>();

const SKELETON_ROWS = 5;

const { data: summary } = useProfileSummary(
  () => props.player,
  () => props.role,
);
const staticData = useStaticDataStore();

const playerId = (player: PlayerKey) => profileKeys.player(player).join("/");

const lastKnown = shallowRef<{ player: string; mainRole: Role; tier: Tier | null } | null>(null);
watch(
  summary,
  (value) => {
    if (value) lastKnown.value = { player: playerId(props.player), mainRole: value.mainRole, tier: value.rank?.tier ?? null };
  },
  { immediate: true },
);

const facts = computed(() => {
  if (summary.value) return { mainRole: summary.value.mainRole, tier: summary.value.rank?.tier ?? null };
  const last = lastKnown.value;
  return last && last.player === playerId(props.player) ? last : null;
});

const metaRole = computed<Role | null>(() => {
  if (!facts.value) return null;
  return props.role === "ALL" || props.role === "MAIN" ? facts.value.mainRole : props.role;
});

const minTier = computed(() => facts.value?.tier ?? null);

const { data: meta, isPending, error } = useRoleMeta(metaRole, minTier);

const champions = computed(() => meta.value?.champions ?? []);

const title = computed(() => {
  const role = metaRole.value ? ` ${formatRole(metaRole.value)}` : "";
  const patch = meta.value ? ` · Patch ${meta.value.patch}` : "";
  return `Méta${role}${patch}`;
});

const tierText = computed(() => (minTier.value ? `${formatTier(minTier.value)}+` : "Tous rangs"));
</script>

<template>
  <Panel :title="title" :aside="tierText">
    <!-- ===== Loading (also while the profile gives the role) ===== -->
    <div v-if="isPending && !error" class="meta__skeleton" aria-hidden="true">
      <span v-for="n in SKELETON_ROWS" :key="n" class="skeleton" style="height: 36px" />
    </div>

    <p v-else-if="champions.length === 0" class="meta__message">Méta indisponible pour le moment.</p>

    <div v-else class="meta__fill">
      <ol class="meta">
        <li v-for="(entry, index) in champions" :key="entry.championId" class="meta__row">
          <span class="meta__rank">{{ index + 1 }}</span>
          <ChampionLink :champion-id="entry.championId" :role="metaRole" :tier="statsTierFor(minTier)" class="meta__champion">
            <ChampionIcon :champion-id="entry.championId" :size="28" decorative />
            <span class="meta__name">{{ staticData.champion(entry.championId)?.name ?? "…" }}</span>
          </ChampionLink>
          <Tag :tone="metaTierTone(entry.tier)" class="meta__tier">{{ entry.tier }}</Tag>
          <span class="meta__winrate" :class="`tone-${statWinrateTone(entry.winrate)}`"> <span class="visually-hidden">winrate </span>{{ formatPercent(entry.winrate) }} </span>
        </li>
      </ol>
    </div>
  </Panel>
</template>

<style scoped>
.meta {
  display: flex;
  flex-direction: column;
  margin: 0;
}

.meta__row {
  display: grid;
  grid-template-columns: 1.5ch minmax(0, 1fr) auto 3.5em;
  align-items: center;
  gap: var(--space-3);
  min-height: 44px;
  padding-block: var(--space-1);
  border-bottom: 1px solid var(--line);
  font-variant-numeric: tabular-nums;
}

.meta__champion {
  gap: var(--space-2);
  min-width: 0;
}

.meta__row:nth-child(n + 11) {
  display: none;
}

.meta__row:last-child {
  border-bottom: none;
}

.meta__rank {
  color: var(--text-secondary);
}

.meta__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--weight-semibold);
}

.meta__tier {
  justify-content: center;
  min-width: 2.5em;
}

.meta__winrate {
  text-align: right;
}

.meta__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.meta__message {
  color: var(--text-secondary);
}

@container profile (min-width: 1000px) {
  .meta__fill {
    flex: 1;
    min-height: 0;
    contain: size;
    overflow: hidden;
    min-height: calc(5 * 44px);
  }

  .meta {
    display: grid;
    height: 100%;
    grid-template-rows: repeat(auto-fill, minmax(44px, 1fr));
    grid-auto-rows: 0;
  }

  .meta__row:nth-child(n + 11) {
    display: grid;
  }
}
</style>
