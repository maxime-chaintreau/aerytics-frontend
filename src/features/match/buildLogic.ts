import type { MatchParticipant } from "@/types/match";
import type { ItemEvent, SkillEvent, SkillSlot } from "@/types/timeline";

export interface ShopVisit {
  time: number;
  items: ItemEvent[];
}

export function shopVisits(items: ItemEvent[], gap = 45): ShopVisit[] {
  const visits: ShopVisit[] = [];
  for (const item of items) {
    const current = visits.at(-1);
    const last = current?.items.at(-1);
    if (current && last && item.time - last.time <= gap) current.items.push(item);
    else visits.push({ time: item.time, items: [item] });
  }
  return visits;
}

export function skillGrid(skills: SkillEvent[]): Record<SkillSlot, boolean[]> {
  const grid: Record<SkillSlot, boolean[]> = { 1: [], 2: [], 3: [], 4: [] };
  skills.forEach(({ slot }, level) => {
    for (const row of [1, 2, 3, 4] as const) grid[row][level] = row === slot;
  });
  return grid;
}

export function skillPriority(skills: SkillEvent[]): SkillSlot[] {
  const points = new Map<SkillSlot, number>();
  const lastLevel = new Map<SkillSlot, number>();
  const maxedAt = new Map<SkillSlot, number>();
  skills.forEach(({ slot }, index) => {
    if (slot === 4) return;
    const count = (points.get(slot) ?? 0) + 1;
    points.set(slot, count);
    lastLevel.set(slot, index);
    if (count === 5) maxedAt.set(slot, index);
  });
  return ([1, 2, 3] as const)
    .filter((slot) => points.has(slot))
    .sort(
      (a, b) =>
        (maxedAt.get(a) ?? Infinity) - (maxedAt.get(b) ?? Infinity) ||
        points.get(b)! - points.get(a)! ||
        lastLevel.get(a)! - lastLevel.get(b)!,
    );
}

// ---------- Damage split ----------

export type DamageMode = "dealt" | "taken";

export interface DamageSplit {
  physical: number;
  magic: number;
  true: number;
  total: number;
}

export function damageSplit({ stats }: MatchParticipant, mode: DamageMode): DamageSplit {
  return mode === "dealt"
    ? {
        physical: stats.physicalDamageToChampions,
        magic: stats.magicDamageToChampions,
        true: stats.trueDamageToChampions,
        total: stats.damageToChampions,
      }
    : {
        physical: stats.physicalDamageTaken,
        magic: stats.magicDamageTaken,
        true: stats.trueDamageTaken,
        total: stats.damageTaken,
      };
}

export function teamDamageSplit(players: MatchParticipant[], mode: DamageMode): DamageSplit {
  return players.reduce<DamageSplit>(
    (sum, player) => {
      const split = damageSplit(player, mode);
      return { physical: sum.physical + split.physical, magic: sum.magic + split.magic, true: sum.true + split.true, total: sum.total + split.total };
    },
    { physical: 0, magic: 0, true: 0, total: 0 },
  );
}