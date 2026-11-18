import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Role, RoleFilter } from "@/types/riot";

const ROLE_SLUGS: Record<Role | "ALL", string> = {
  ALL: "all",
  TOP: "top",
  JUNGLE: "jungle",
  MID: "mid",
  BOTTOM: "adc",
  SUPPORT: "support",
};

const SLUG_TO_ROLE = new Map(Object.entries(ROLE_SLUGS).map(([role, slug]) => [slug, role as Role | "ALL"]));

export function useRoleFilter() {
  const route = useRoute();
  const router = useRouter();

  return computed<RoleFilter>({
    get: () => {
      const slug = route.query.role;
      return (typeof slug === "string" && SLUG_TO_ROLE.get(slug)) || "MAIN";
    },
    set: (role) => {
      router.push({ query: { ...route.query, role: role === "MAIN" ? undefined : ROLE_SLUGS[role] } });
    },
  });
}
