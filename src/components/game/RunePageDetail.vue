<script setup lang="ts">
import { computed } from "vue";
import type { RunePage } from "@/types/match";
import { useStaticDataStore } from "@/stores/staticData";
import RuneIcon from "@/components/game/icon/RuneIcon.vue";

const props = defineProps<{ runes: RunePage }>();

const staticData = useStaticDataStore();

const STYLE_COLORS: Record<number, string> = {
  8000: "#c8aa6e", // Precision
  8100: "#d44242", // Domination
  8200: "#9faafc", // Sorcery
  8300: "#49aab9", // Inspiration
  8400: "#a1d586", // Resolve
};

const primaryStyle = computed(() => staticData.runeStyle(props.runes.primaryStyle));
const subStyle = computed(() => staticData.runeStyle(props.runes.subStyle));

/** the secondary tree has no keystone row */
const subRows = computed(() => subStyle.value?.slots.slice(1) ?? []);

const chosen = computed(() => new Set([...props.runes.primary, ...props.runes.secondary]));

/** the same shard can be in two rows (5008): what is chosen is the row's own value */
const shardRows = computed(() => staticData.runes.shards.rows);

const styleColor = (styleId: number) => ({ "--style-color": STYLE_COLORS[styleId] ?? "var(--accent-gold)" });

const withInfo = (ids: number[]) => ids.map((id) => ({ id, info: staticData.rune(id) }));
const primaryDetails = computed(() => withInfo(props.runes.primary));
const secondaryDetails = computed(() => withInfo(props.runes.secondary));
</script>

<template>
  <div class="rune-page">
    <div class="rune-page__grid">
      <!-- ===== Primary tree ===== -->
      <div class="rune-page__tree rune-page__tree--primary" :style="styleColor(runes.primaryStyle)" aria-hidden="true">
        <p class="rune-page__tree-name">
          <RuneIcon :rune-id="runes.primaryStyle" :size="24" decorative />
          {{ primaryStyle?.name }}
        </p>
        <div v-for="(row, index) in primaryStyle?.slots ?? []" :key="index" class="rune-page__row" :class="{ 'rune-page__row--keystones': index === 0 }">
          <span v-for="id in row" :key="id" class="rune-page__rune" :class="{ 'rune-page__rune--chosen': chosen.has(id) }">
            <RuneIcon :rune-id="id" decorative />
          </span>
        </div>
      </div>

      <ul class="rune-page__details rune-page__details--primary">
        <li v-for="{ id, info } in primaryDetails" :key="id" class="rune-page__detail">
          <RuneIcon :rune-id="id" :size="32" decorative />
          <div>
            <p class="rune-page__detail-name">{{ info?.name ?? "Rune inconnue" }}</p>
            <p v-if="info?.shortDesc" class="rune-page__detail-text">{{ info.shortDesc }}</p>
          </div>
        </li>
      </ul>

      <!-- ===== Secondary tree + shards ===== -->
      <div class="rune-page__tree rune-page__tree--secondary" :style="styleColor(runes.subStyle)" aria-hidden="true">
        <p class="rune-page__tree-name">
          <RuneIcon :rune-id="runes.subStyle" :size="24" decorative />
          {{ subStyle?.name }}
        </p>
        <div v-for="(row, index) in subRows" :key="index" class="rune-page__row">
          <span v-for="id in row" :key="id" class="rune-page__rune" :class="{ 'rune-page__rune--chosen': chosen.has(id) }">
            <RuneIcon :rune-id="id" decorative />
          </span>
        </div>

        <div class="rune-page__shards">
          <div v-for="(row, index) in shardRows" :key="index" class="rune-page__row rune-page__row--shards">
            <span v-for="(id, column) in row" :key="column" class="rune-page__rune" :class="{ 'rune-page__rune--chosen': runes.shards[index] === id }">
              <RuneIcon :rune-id="id" decorative />
            </span>
          </div>
        </div>
      </div>

      <div class="rune-page__details rune-page__details--secondary">
        <ul class="rune-page__list">
          <li v-for="{ id, info } in secondaryDetails" :key="id" class="rune-page__detail">
            <RuneIcon :rune-id="id" :size="32" decorative />
            <div>
              <p class="rune-page__detail-name">{{ info?.name ?? "Rune inconnue" }}</p>
              <p v-if="info?.shortDesc" class="rune-page__detail-text">{{ info.shortDesc }}</p>
            </div>
          </li>
        </ul>

        <h3 class="rune-page__subtitle">Fragments</h3>
        <ul class="rune-page__list rune-page__list--shards">
          <li v-for="(id, index) in runes.shards" :key="index" class="rune-page__shard">
            <RuneIcon :rune-id="id" :size="28" decorative />
            {{ staticData.shardName(id) ?? "Fragment inconnu" }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rune-page {
  container: rune-page / inline-size;
}

.rune-page__grid {
  display: grid;
  gap: var(--space-6);
}

@container rune-page (min-width: 520px) {
  .rune-page__grid {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "primary-tree   secondary-tree"
      "primary-list   secondary-list";
    column-gap: var(--space-8);
  }

  .rune-page__tree--primary {
    grid-area: primary-tree;
  }

  .rune-page__tree--secondary {
    grid-area: secondary-tree;
  }

  .rune-page__details--primary {
    grid-area: primary-list;
  }

  .rune-page__details--secondary {
    grid-area: secondary-list;
  }
}

.rune-page__tree {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.rune-page__tree-name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  color: var(--style-color);
}

.rune-page__row {
  --rune-size: 36px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-block: var(--space-1);
}

.rune-page__row--keystones {
  --rune-size: 52px;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--line);
}

.rune-page__shards {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--line);
}

.rune-page__row--shards {
  --rune-size: 30px;
}

.rune-page__rune {
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--line);
}

/* not chosen: grey and faded */
.rune-page__rune > * {
  filter: grayscale(1);
  opacity: 0.35;
}

.rune-page__rune--chosen {
  box-shadow: 0 0 0 2px var(--style-color);
}

.rune-page__rune--chosen > * {
  filter: none;
  opacity: 1;
}

.rune-page__details {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: var(--space-4) 0 0;
  border-top: 1px solid var(--line);
  list-style: none;
}

.rune-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.rune-page__detail {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.rune-page__detail-name {
  font-weight: var(--weight-semibold);
}

.rune-page__detail-text {
  margin-top: 2px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: pre-line;
}

.rune-page__subtitle {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.rune-page__list--shards {
  gap: var(--space-2);
}

.rune-page__shard {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
</style>
