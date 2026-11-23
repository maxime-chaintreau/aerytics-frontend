<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, shallowRef } from "vue";
import type { MatchDetail, MatchParticipant } from "@/types/match";
import type { Region } from "@/types/riot";
import { useMatchAnalysis } from "@/composables/useMatchQueries";
import { useStaticDataStore } from "@/stores/staticData";
import { teamOf } from "@/features/match/matchLogic";
import { SCOREBOARD_PRESETS, type ScoreboardPresetId } from "@/features/match/matchStats";
import { formatRole } from "@/utils/labels";
import Panel from "@/components/ui/Panel.vue";
import Dialog from "@/components/ui/Dialog.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ScoreboardTeam from "@/features/match/components/ScoreboardTeam.vue";

const RunePageDetail = defineAsyncComponent(() => import("@/components/game/RunePageDetail.vue"));

const props = defineProps<{ match: MatchDetail; region: Region }>();

const analysis = reactive(
  useMatchAnalysis(
    () => props.region,
    () => props.match.matchId,
  ),
);

const staticData = useStaticDataStore();

const presetId = ref<ScoreboardPresetId>("general");
const presetOptions = SCOREBOARD_PRESETS.map(({ id, label }) => ({ value: id, label }));
const columns = computed(() => SCOREBOARD_PRESETS.find(({ id }) => id === presetId.value)!.columns);

const teams = computed(() => (["BLUE", "RED"] as const).map((side) => teamOf(props.match, side)));

const minutes = computed(() => props.match.durationSeconds / 60);

// ---------- Rune popup ----------

const runesOf = shallowRef<MatchParticipant | null>(null);
const runesOpen = ref(false);

function openRunes(participant: MatchParticipant) {
  runesOf.value = participant;
  runesOpen.value = true;
}

const runesSubtitle = computed(() => {
  const player = runesOf.value;
  if (!player) return "";
  return `${staticData.champion(player.championId)?.name ?? "Champion"} · ${formatRole(player.role)}`;
});
</script>

<template>
  <Panel title="Tableau des scores">
    <div class="scoreboard__presets">
      <SegmentedControl v-model="presetId" label="Statistiques affichées" :options="presetOptions" />
    </div>

    <div class="scoreboard">
      <ScoreboardTeam
        v-for="{ team, players } in teams"
        :key="team.side"
        :team="team"
        :players="players"
        :all-players="match.participants"
        :columns="columns"
        :focus-puuid="match.focus.puuid"
        :region="region"
        :minutes="minutes"
        :remake="match.remake"
        :performance="analysis.data?.players"
        @open-runes="openRunes"
      />
    </div>

    <Dialog v-model:open="runesOpen" title="Page de runes" :subtitle="runesSubtitle">
      <RunePageDetail v-if="runesOf" :runes="runesOf.runes" />
    </Dialog>
  </Panel>
</template>

<style scoped>
.scoreboard__presets {
  overflow-x: auto;
  margin-bottom: var(--space-4);
  padding-bottom: 2px;
}

.scoreboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
