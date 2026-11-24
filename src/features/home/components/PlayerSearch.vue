<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { useRouter } from "vue-router";
import { REGIONS, type Region } from "@/types/riot";
import type { PlayerCard } from "@/types/search";
import { MIN_QUERY_LENGTH, useDebounced, usePlayerSearch } from "@/composables/useSearchQueries";
import { useRecentSearches } from "@/composables/useRecentSearches";
import { formatRiotId, parseRiotIdInput, toRiotIdSlug } from "@/utils/riotId";
import { formatRegion } from "@/utils/labels";
import PlayerIdentity from "@/components/game/PlayerIdentity.vue";

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const router = useRouter();
const { lastRegion, rememberRegion } = useRecentSearches();

const region = ref<Region>(lastRegion.value);
watch(region, rememberRegion);

const query = ref("");
const debouncedQuery = useDebounced(query, 200);
const search = usePlayerSearch(debouncedQuery, region);

const suggestions = computed(() => (query.value.trim().length >= MIN_QUERY_LENGTH ? (search.data.value ?? []) : []));

// ---------- combobox state ----------
const open = ref(false);
const active = ref(-1);
const error = ref<string | null>(null);

const listId = useId();
const optionId = (index: number) => `${listId}-${index}`;
const errorId = useId();

const expanded = computed(() => open.value && suggestions.value.length > 0);

watch(suggestions, () => (active.value = -1));
watch(query, () => {
  open.value = true;
  error.value = null;
});

function go(card: Pick<PlayerCard, "region" | "riotId">) {
  open.value = false;
  query.value = "";
  void router.push({ name: "profile", params: { region: card.region, riotId: toRiotIdSlug(card.riotId) } });
}

function submit() {
  const highlighted = suggestions.value[active.value];
  if (highlighted) return go(highlighted);

  const riotId = parseRiotIdInput(query.value);
  if (riotId) return go({ region: region.value, riotId });

  if (suggestions.value.length === 1) return go(suggestions.value[0]!);
  error.value = "Écris le Riot ID complet, avec le # : Kaori#EUW";
}

function onKeydown(event: KeyboardEvent) {
  const count = suggestions.value.length;
  if (event.key === "ArrowDown" && count > 0) {
    event.preventDefault();
    open.value = true;
    active.value = (active.value + 1) % count;
  } else if (event.key === "ArrowUp" && count > 0) {
    event.preventDefault();
    open.value = true;
    active.value = active.value <= 0 ? count - 1 : active.value - 1;
  } else if (event.key === "Escape") {
    if (expanded.value) open.value = false;
    else query.value = "";
  }
}

const status = computed(() => {
  if (!expanded.value) return "";
  const count = suggestions.value.length;
  return `${count} joueur${count > 1 ? "s" : ""} trouvé${count > 1 ? "s" : ""}, flèches haut et bas pour choisir.`;
});
</script>

<template>
  <form class="search" :class="{ 'search--compact': compact }" role="search" @submit.prevent="submit">
    <label class="visually-hidden" :for="`${listId}-region`">Région</label>
    <select :id="`${listId}-region`" v-model="region" class="search__region">
      <option v-for="option in REGIONS" :key="option" :value="option">{{ formatRegion(option) }}</option>
    </select>

    <div class="search__field">
      <label class="visually-hidden" :for="`${listId}-input`">Riot ID du joueur</label>
      <input
        :id="`${listId}-input`"
        v-model="query"
        class="search__input"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        :placeholder="compact ? 'Nom#TAG' : 'Nom#TAG — par exemple Kaori#EUW'"
        aria-autocomplete="list"
        :aria-expanded="expanded"
        :aria-controls="listId"
        :aria-activedescendant="active >= 0 ? optionId(active) : undefined"
        :aria-invalid="error !== null"
        :aria-describedby="error ? errorId : undefined"
        @keydown="onKeydown"
        @focus="open = true"
        @blur="open = false"
      />

      <ul v-show="expanded" :id="listId" class="search__list" role="listbox" :aria-label="`Joueurs trouvés en ${formatRegion(region)}`">
        <li
          v-for="(card, index) in suggestions"
          :id="optionId(index)"
          :key="`${card.region}/${formatRiotId(card.riotId)}`"
          class="search__option"
          :class="{ 'search__option--active': index === active }"
          role="option"
          :aria-selected="index === active"
          @mousedown.prevent
          @mousemove="active = index"
          @click="go(card)"
        >
          <PlayerIdentity :player="card" />
        </li>
      </ul>
    </div>

    <button type="submit" class="button button--primary search__submit">
      <span :class="{ 'visually-hidden': compact }">Rechercher</span>
      <span v-if="compact" aria-hidden="true">→</span>
    </button>

    <p v-if="error" :id="errorId" class="search__error" role="alert">{{ error }}</p>
    <p class="visually-hidden" aria-live="polite">{{ status }}</p>
  </form>
</template>

<style scoped>
.search {
  --search-height: 48px;
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-2);
  width: 100%;
}

.search--compact {
  --search-height: 36px;
  max-width: 420px;
}

.search__region,
.search__input {
  height: var(--search-height);
  padding: 0 var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--fill-panel-2);
  color: var(--text-primary);
  font: inherit;
}

.search__region {
  font-weight: var(--weight-semibold);
  cursor: pointer;
}

.search__input {
  width: 100%;
}

.search__input:focus-visible,
.search__region:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.search__input[aria-invalid="true"] {
  border-color: var(--state-negative);
}

.search__submit {
  height: var(--search-height);
}

.search__field {
  position: relative;
}

.search__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 360px;
  margin: 0;
  padding: var(--space-1);
  overflow-y: auto;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--fill-panel);
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.45);
}

.search__option {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.search__option--active {
  background: var(--fill-hover);
}

.search__error {
  grid-column: 1 / -1;
  font-size: var(--text-sm);
  color: var(--state-negative);
}

@media (max-width: 480px) {
  .search:not(.search--compact) {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .search:not(.search--compact) .search__submit {
    grid-column: 1 / -1;
  }
}

.search--compact .search__error {
  position: absolute;
  top: calc(100% + 4px);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--fill-panel);
}
</style>
