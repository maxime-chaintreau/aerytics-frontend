<script setup lang="ts">
import type { RoleQuest } from "@/types/riot";
import ItemIcon from "@/components/game/icon/ItemIcon.vue";

defineProps<{
  items: number[];
  roleQuest: RoleQuest;
}>();
</script>

<template>
  <ul class="item-slots" aria-label="Objets">
    <li v-for="(itemId, slot) in items" :key="slot" class="item-slots__slot">
      <ItemIcon :item-id="itemId" />
    </li>
    <li class="item-slots__quest" :class="{ 'item-slots__quest--pending': !roleQuest.completed }" :title="roleQuest.completed ? 'Quête de rôle terminée' : 'Quête de rôle non terminée'">
      <span class="item-slots__quest-icon">
        <ItemIcon :item-id="roleQuest.itemId" />
      </span>
      <span class="visually-hidden">{{ roleQuest.completed ? "Quête de rôle terminée" : "Quête de rôle non terminée" }}</span>
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

.item-slots__slot:nth-child(7) {
  margin-left: var(--space-1);
}

.item-slots__quest {
  position: relative;
  margin-left: var(--space-1);
}

.item-slots__quest-icon {
  display: grid;
  place-items: center;
  width: var(--item-size, 24px);
  height: var(--item-size, 24px);
  overflow: hidden;
  border-radius: 50%;
  background: var(--fill-base);
  box-shadow: 0 0 0 1px var(--accent-gold);
}

.item-slots__quest--pending .item-slots__quest-icon {
  box-shadow: 0 0 0 1px var(--line);
}

.item-slots__quest--pending .item-slots__quest-icon > * {
  filter: grayscale(1);
  opacity: 0.5;
}
</style>
