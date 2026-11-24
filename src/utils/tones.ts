import type { MetaTier } from "@/types/meta";

export type Tone = "positive" | "negative" | "gold" | "neutral";

export function winrateTone(winrate: number): Tone {
  if (winrate >= 0.55) return "positive";
  if (winrate <= 0.45) return "negative";
  return "neutral";
}

export function statWinrateTone(winrate: number): Tone {
  if (winrate >= 0.52) return "positive";
  if (winrate <= 0.48) return "negative";
  return "neutral";
}

export const metaTierTone = (tier: MetaTier): Tone => (tier === "S+" ? "gold" : tier === "S" ? "positive" : "neutral");

export const diffTone = (value: number): Tone => (value > 0 ? "positive" : value < 0 ? "negative" : "neutral");
