import type { Role } from "@/types/riot";

export const ROLE_SLUGS: Record<Role | "ALL", string> = {
  ALL: "all",
  TOP: "top",
  JUNGLE: "jungle",
  MID: "mid",
  BOTTOM: "adc",
  SUPPORT: "support",
};

export const SLUG_TO_ROLE = new Map(Object.entries(ROLE_SLUGS).map(([role, slug]) => [slug, role as Role | "ALL"]));
