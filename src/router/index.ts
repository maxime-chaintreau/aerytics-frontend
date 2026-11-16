import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView, meta: { title: "Accueil" } },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
      meta: { title: "Page introuvable" },
    },
  ],
});

router.afterEach((to) => {
  document.title = `${to.meta.title ?? "Page"} — Aerytics`;
  requestAnimationFrame(() => document.querySelector<HTMLElement>("main h1")?.focus());
});

export default router;
