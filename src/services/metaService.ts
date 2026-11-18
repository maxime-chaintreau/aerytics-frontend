import type { RoleMeta } from "@/types/meta";
import type { Role, Tier } from "@/types/riot";
import { getJson } from "./http";

export const metaService = {
    /** best champions of a role, from 'minTier' and above (null = every tier) */
    getRoleMeta(role: Role, minTier: Tier | null, signal?: AbortSignal): Promise<RoleMeta> {
    const query = minTier ? `?tier=${minTier}` : "";
    return getJson(`/meta/${role}${query}`, signal);
  },
};