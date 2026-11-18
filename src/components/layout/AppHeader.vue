<template>
  <header class="topbar">
    <div class="container topbar__inner">
      <RouterLink to="/" class="brand">Aerytics</RouterLink>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--fill-panel);
  border-bottom: 1px solid var(--line);
  margin-bottom: var(--space-8);
}

.topbar__inner {
  height: var(--header-height);
  display: flex;
  align-items: center;
}

.brand {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}
</style>
