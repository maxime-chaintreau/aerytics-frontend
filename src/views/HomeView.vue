<script setup lang="ts">
import PlayerSearch from "@/features/home/components/PlayerSearch.vue";
import TierListCard from "@/features/home/components/TierListCard.vue";
import RecentSearches from "@/features/home/components/RecentSearches.vue";
import LadderCard from "@/features/home/components/LadderCard.vue";
</script>

<template>
  <div class="home">
    <section class="home__hero" aria-labelledby="home-title">
      <h1 id="home-title" class="home__title" tabindex="-1">Aerytics</h1>
      <p class="home__tagline">Les stats de tes parties classées, analysées jusqu'au moindre ping.</p>
      <PlayerSearch class="home__search" />
    </section>

    <div class="home__grid">
      <TierListCard class="home__tier-list" />
      <div class="home__side">
        <RecentSearches />
        <LadderCard />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding-block: var(--space-8);
}

.home__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.home__title {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 6vw, 3.5rem);
  letter-spacing: 0.02em;
  color: var(--accent-gold);
}

.home__tagline {
  color: var(--text-secondary);
}

.home__search {
  max-width: 640px;
  margin-top: var(--space-3);
  text-align: left;
}

.home__grid {
  display: grid;
  gap: var(--space-4);
  align-items: start;
}

.home__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 960px) {
  .home__grid {
    grid-template-columns: minmax(0, 3fr) minmax(320px, 2fr);
  }
}
</style>
