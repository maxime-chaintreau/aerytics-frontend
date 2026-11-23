import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
import HomeView from "@/views/HomeView.vue";

import { formatRiotId, parseRiotIdSlug } from "@/utils/riotId";
import { REGIONS } from "@/types/riot";

function riotIdOf(to: RouteLocationNormalized): string {
  const slug = to.params.riotId;
  const parsed = typeof slug === "string" ? parseRiotIdSlug(slug) : null;
  return parsed ? formatRiotId(parsed) : "Joueur";
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView, meta: { title: "Accueil" } },
    {
      path: `/:region(${REGIONS.join("|")})/:riotId`,
      name: "profile",
      component: () => import("@/views/ProfileView.vue"),
      meta: { title: (to) => `${riotIdOf(to)} — Profil` },
    },
    {
      path: `/:region(${REGIONS.join("|")})/:riotId/matches/:matchId`,
      name: "match",
      component: () => import("@/views/MatchView.vue"),
      meta: { title: (to) => `Partie de ${riotIdOf(to)}` },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
      meta: { title: "Page introuvable" },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.path === from.path) return false;
    return { top: 0 };
  },
});

router.afterEach((to, from) => {
  const { title } = to.meta;
  document.title = `${(typeof title === "function" ? title(to) : title) ?? "Page"} — Aerytics`;
  if (from.matched.length === 0) return;
  if (to.path === from.path) return;
  requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true }));
});

export default router;
