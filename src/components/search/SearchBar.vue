<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { useRouter } from "vue-router";
import { REGIONS, type Region } from "@/types/riot";
import type { PlayerCard } from "@/types/search";
import type { ChampionInfo } from "@/types/staticData";
import { useStaticDataStore } from "@/stores/staticData";
import { championSearchIndex, normalizeChampionName, searchChampions } from "@/utils/champion";
import { championRoute, profileRoute } from "@/router/links";
import { formatRiotId, parseRiotIdInput } from "@/utils/riotId";
import { MIN_QUERY_LENGTH, useDebounced, usePlayerSearch } from "@/composables/useSearchQueries";
import { useRecentSearches } from "@/composables/useRecentSearches";
import { formatRegion } from "@/utils/labels";
import PlayerIdentity from "@/components/game/PlayerIdentity.vue";
import ChampionIcon from "@/components/game/icon/ChampionIcon.vue";

const props = withDefaults(defineProps<{ compact?: boolean; initialQuery?: string; initialRegion?: Region }>(), { compact: false, initialQuery: "" });

const router = useRouter();
const { lastRegion, rememberRegion } = useRecentSearches();

const region = ref<Region>(props.initialRegion ?? lastRegion.value);
watch(region, rememberRegion);

const query = ref(props.initialQuery);
const debouncedQuery = useDebounced(query, 200);
const search = usePlayerSearch(debouncedQuery, region);

const longEnough = computed(() => query.value.trim().length >= MIN_QUERY_LENGTH);
const suggestions = computed(() => (longEnough.value ? (search.data.value ?? []) : []));

const staticData = useStaticDataStore();
const championIndex = computed(() => championSearchIndex(staticData.champions));
const championResults = computed(() => (longEnough.value && !query.value.includes("#") ? searchChampions(championIndex.value, query.value) : []));

type SearchOption = { kind: "player"; card: PlayerCard } | { kind: "champion"; champion: ChampionInfo };
const options = computed<SearchOption[]>(() => [
  ...suggestions.value.map((card) => ({ kind: "player" as const, card })),
  ...championResults.value.map((champion) => ({ kind: "champion" as const, champion })),
]);

// ---------- combobox state ----------
const open = ref(false);
const active = ref(-1);
const error = ref<string | null>(null);

const listId = useId();
const optionId = (index: number) => `${listId}-${index}`;
const errorId = useId();

const expanded = computed(() => open.value && options.value.length > 0);

watch(options, () => (active.value = -1));
watch(query, () => {
  open.value = true;
  error.value = null;
});

function go(card: Pick<PlayerCard, "region" | "riotId">) {
  open.value = false;
  query.value = "";
  void router.push(profileRoute(card));
}

function goChampion(champion: ChampionInfo) {
  open.value = false;
  query.value = "";
  void router.push(championRoute(champion));
}

function choose(option: SearchOption) {
  if (option.kind === "player") go(option.card);
  else goChampion(option.champion);
}

function submit() {
  const highlighted = options.value[active.value];
  if (highlighted) return choose(highlighted);

  const riotId = parseRiotIdInput(query.value);
  if (riotId) return go({ region: region.value, riotId });

  const wanted = normalizeChampionName(query.value);
  const exactChampion = championResults.value.find((champion) => normalizeChampionName(champion.name) === wanted);
  if (exactChampion) return goChampion(exactChampion);
  if (options.value.length === 1) return choose(options.value[0]!);
  error.value = "Écris le Riot ID complet avec le # (Kaori#EUW) ou le nom d'un champion";
}

function onKeydown(event: KeyboardEvent) {
  const count = options.value.length;
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
  const count = (value: number, word: string) => `${value} ${word}${value > 1 ? "s" : ""}`;
  const parts = [suggestions.value.length && count(suggestions.value.length, "joueur"), championResults.value.length && count(championResults.value.length, "champion")].filter(Boolean);
  return `${parts.join(" et ")} trouvé${options.value.length > 1 ? "s" : ""}, flèches haut et bas pour choisir.`;
});

const championIndexOf = (index: number) => suggestions.value.length + index;
</script>

<template>
  <form class="search" :class="{ 'search--compact': compact }" role="search" @submit.prevent="submit">
    <label class="visually-hidden" :for="`${listId}-region`">Région</label>
    <select :id="`${listId}-region`" v-model="region" class="search__region">
      <option v-for="option in REGIONS" :key="option" :value="option">{{ formatRegion(option) }}</option>
    </select>

    <div class="search__field">
      <label class="visually-hidden" :for="`${listId}-input`">Riot ID du joueur ou nom du champion</label>
      <input
        :id="`${listId}-input`"
        v-model="query"
        class="search__input"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        :placeholder="compact ? 'Joueur#TAG ou champion' : 'Nom#TAG ou champion — par exemple Kaori#EUW, Ahri'"
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

      <div v-show="expanded" :id="listId" class="search__list" role="listbox" aria-label="Résultats de la recherche" @mousedown.prevent>
        <ul v-if="suggestions.length" class="search__group" role="group" :aria-label="`Joueurs en ${formatRegion(region)}`">
          <li class="search__group-label" aria-hidden="true">Joueurs</li>
          <li
            v-for="(card, index) in suggestions"
            :id="optionId(index)"
            :key="`${card.region}/${formatRiotId(card.riotId)}`"
            class="search__option"
            :class="{ 'search__option--active': index === active }"
            role="option"
            :aria-selected="index === active"
            @mousemove="active = index"
            @click="go(card)"
          >
            <PlayerIdentity :player="card" />
          </li>
        </ul>

        <ul v-if="championResults.length" class="search__group" role="group" aria-label="Champions">
          <li class="search__group-label" aria-hidden="true">Champions</li>
          <li
            v-for="(champion, index) in championResults"
            :id="optionId(championIndexOf(index))"
            :key="champion.key"
            class="search__option search__option--champion"
            :class="{ 'search__option--active': championIndexOf(index) === active }"
            role="option"
            :aria-selected="championIndexOf(index) === active"
            @mousemove="active = championIndexOf(index)"
            @click="goChampion(champion)"
          >
            <ChampionIcon :champion-id="champion.key" :size="32" decorative />
            {{ champion.name }}
          </li>
        </ul>
      </div>
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

.search__group {
  margin: 0;
  padding: 0;
  list-style: none;
}

.search__group + .search__group {
  margin-top: var(--space-1);
  padding-top: var(--space-1);
  border-top: 1px solid var(--line);
}

.search__group-label {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.search__option--champion {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: var(--weight-semibold);
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
