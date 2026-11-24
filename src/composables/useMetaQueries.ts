import { toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@pinia/colada";
import type { Role, Tier } from "@/types/riot";
import { metaService } from "@/services/metaService";

const ONE_HOUR = 60 * 60_000;

export const metaKeys = {
  all: ["meta"] as const,
  role: (role: Role, minTier: Tier | null) => [...metaKeys.all, role, minTier ?? "ALL"] as const,
};

export function useRoleMeta(role: MaybeRefOrGetter<Role | null>, minTier: MaybeRefOrGetter<Tier | null>) {
  return useQuery({
    key: () => {
      const value = toValue(role);
      return value ? metaKeys.role(value, toValue(minTier)) : [...metaKeys.all, "none"];
    },
    query: ({ signal }) => {
      const value = toValue(role);
      if (!value) throw new Error("Meta query ran without a role");
      return metaService.getRoleMeta(value, toValue(minTier), signal);
    },
    enabled: () => toValue(role) !== null,
    staleTime: ONE_HOUR,
  });
}
