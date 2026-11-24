import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { StatsTier } from "@/types/champion";
import type { Role } from "@/types/riot";
import { ROLE_SLUGS, SLUG_TO_ROLE } from "@/utils/roleSlugs";
import { tierFromSlug, tierToSlug } from "@/utils/statsTier";

export function useChampionFilters() {
  const route = useRoute();
  const router = useRouter();

  const role = computed<Role | null>({
    get: () => {
      const role = typeof route.query.role === "string" ? SLUG_TO_ROLE.get(route.query.role) : undefined;
      return role && role !== "ALL" ? role : null; // "all" means nothing for one champion
    },
    set: (value) => router.push({ query: { ...route.query, role: value ? ROLE_SLUGS[value] : undefined } }),
  });

  const tier = computed<StatsTier | null>({
    get: () => tierFromSlug(route.query.tier),
    set: (value) => router.push({ query: { ...route.query, tier: tierToSlug(value) } }),
  });

  return { role, tier };
}
