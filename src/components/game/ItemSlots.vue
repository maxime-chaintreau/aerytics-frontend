<script setup lang="ts">
import type { RoleQuest } from "@/types/riot";
import ItemIcon from "@/components/game/icon/ItemIcon.vue";
import SummonerSpellIcon from "@/components/game/icon/SummonerSpellIcon.vue";

defineProps<{
  items: number[];
  roleQuest?: RoleQuest | null;
  reserveQuestSlot?: boolean;
}>();
</script>

<template>
  <ul class="item-slots" aria-label="Objets">
    <li
      v-if="roleQuest"
      class="item-slots__quest"
      :class="{ 'item-slots__quest--pending': !roleQuest.completed }"
      :title="roleQuest.completed ? 'Quête de rôle terminée' : 'Quête de rôle non terminée'"
    >
      <ItemIcon v-if="roleQuest.reward.type === 'item'" :item-id="roleQuest.reward.itemId" />
      <SummonerSpellIcon v-else :spell-key="roleQuest.reward.spellKey" />
      <span class="visually-hidden">{{ roleQuest.completed ? "(quête de rôle terminée)" : "(quête de rôle non terminée)" }}</span>
    </li>
    <li v-else-if="reserveQuestSlot" class="item-slots__quest item-slots__quest--none" aria-hidden="true" />
    <li v-for="(itemId, slot) in items" :key="slot" class="item-slots__slot">
      <ItemIcon :item-id="itemId" />
    </li>
  </ul>
</template>

<style scoped>
.item-slots {
  display: flex;
  align-items: center;
  gap: var(--item-gap, 3px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item-slots__quest {
  --spell-size: var(--item-size, 24px);
  margin-right: var(--space-1);
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 1px var(--accent-gold);
}

.item-slots__quest--pending {
  box-shadow: 0 0 0 1px var(--line);
}

.item-slots__quest--pending > :first-child {
  filter: grayscale(1);
  opacity: 0.4;
}

.item-slots__quest--none {
  width: var(--item-size, 24px);
  height: var(--item-size, 24px);
  box-shadow: none;
}

.item-slots__slot:last-child {
  margin-left: var(--space-1);
}
</style>
