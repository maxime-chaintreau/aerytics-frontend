<script setup lang="ts">
import { computed } from "vue";
import type { PlayerKey, Role, RoleFilter } from "@/types/riot";
import type { MetaTier } from "@/types/meta";
import { useProfileSummary } from "@/composables/useProfileQueries";
import { useRoleMeta } from "@/composables/useMetaQueries";
import { useStaticDataStore } from "@/stores/staticData";
import { winrateTone } from "@/features/profile/profileLogic";
import { formatRole, formatTier } from "@/utils/labels";
import { formatPercent } from "@/utils/format";
import Panel from "@/components/ui/Panel.vue";
import Tag from "@/components/ui/Tag.vue";
import ChampionIcon from "@/components/game/ChampionIcon.vue";

const props = defineProps<{ player: PlayerKey; role: RoleFilter }>();

const SKELETON_ROWS = 5;

const { data: summary } = useProfileSummary(
  () => props.player,
  () => props.role,
);
const staticData = useStaticDataStore();

const metaRole = computed<Role | null>(() => {
  if (!summary.value) return null;
  return props.role === "ALL" || props.role === "MAIN" ? summary.value.mainRole : props.role;
});

const minTier = computed(() => summary.value?.rank?.tier ?? null);

const { data: meta, isPending, error } = useRoleMeta(metaRole, minTier);

const champions = computed(() => meta.value?.champions ?? []);

const title = computed(() => {
  const role = metaRole.value ? ` ${formatRole(metaRole.value)}` : "";
  const patch = meta.value ? ` · Patch ${meta.value.patch}` : "";
  return `Méta${role}${patch}`;
});

const tierText = computed(() => (minTier.value ? `${formatTier(minTier.value)}+` : "Tous rangs"));

const tierTone = (tier: MetaTier) => (tier === "S+" ? "gold" : "neutral");
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
          <ChampionIcon :champion-id="entry.championId" :size="28" decorative />
          <span class="meta__name">{{ staticData.champion(entry.championId)?.name ?? "…" }}</span>
          <Tag :tone="tierTone(entry.tier)" class="meta__tier">{{ entry.tier }}</Tag>
          <span class="meta__winrate" :class="`meta__winrate--${winrateTone(entry.winrate)}`"> <span class="visually-hidden">winrate </span>{{ formatPercent(entry.winrate) }} </span>
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
  grid-template-columns: 1.5ch auto minmax(0, 1fr) auto 3.5em;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-2);
  border-bottom: 1px solid var(--line);
  font-size: var(--text-sm);
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

.meta__winrate--positive {
  color: var(--state-positive);
}

.meta__winrate--negative {
  color: var(--state-negative);
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
