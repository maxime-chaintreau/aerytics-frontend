import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { RoleFilter } from "@/types/riot";
import { ROLE_SLUGS, SLUG_TO_ROLE } from "@/utils/roleSlugs";

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
