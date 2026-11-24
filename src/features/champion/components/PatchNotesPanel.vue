<script setup lang="ts">
import type { ChampionStats, PatchNote, PatchVerdict } from "@/types/champion";
import { useStaticDataStore } from "@/stores/staticData";
import Panel from "@/components/ui/Panel.vue";
import Tag from "@/components/ui/Tag.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";
import ItemIcon from "@/components/game/icon/ItemIcon.vue";
import RuneIcon from "@/components/game/icon/RuneIcon.vue";

defineProps<{ stats: ChampionStats }>();

const staticData = useStaticDataStore();

const VERDICTS: Record<PatchVerdict, { label: string; tone: "positive" | "negative" | "neutral" }> = {
  buff: { label: "Renforcement", tone: "positive" },
  nerf: { label: "Affaiblissement", tone: "negative" },
  adjust: { label: "Ajustement", tone: "neutral" },
};

function targetName(note: PatchNote): string {
  if (note.target === "champion") return staticData.champion(note.id)?.name ?? "Champion";
  if (note.target === "item") return staticData.item(note.id)?.name ?? "Objet";
  return staticData.rune(note.id)?.name ?? "Rune";
}
</script>

<template>
  <Panel :title="`Patch ${stats.patch}`">
    <ul v-if="stats.patchNotes.length" class="patch">
      <li v-for="note in stats.patchNotes" :key="`${note.target}-${note.id}`" class="patch__note">
        <ChampionIcon v-if="note.target === 'champion'" :champion-id="note.id" :size="32" decorative />
        <ItemIcon v-else-if="note.target === 'item'" :item-id="note.id" :size="32" />
        <RuneIcon v-else :rune-id="note.id" :size="32" decorative />
        <div class="patch__body">
          <p class="patch__title">
            {{ targetName(note) }}
            <Tag :tone="VERDICTS[note.verdict].tone">{{ VERDICTS[note.verdict].label }}</Tag>
          </p>
          <p class="patch__text">{{ note.text }}</p>
        </div>
      </li>
    </ul>
    <p v-else class="patch__empty">Aucun changement ce patch pour ce champion, ses objets ou ses runes.</p>
  </Panel>
</template>

<style scoped>
.patch {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.patch__note {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.patch__body {
  min-width: 0;
}

.patch__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--weight-semibold);
}

.patch__text {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--text-secondary);
}

.patch__empty {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
