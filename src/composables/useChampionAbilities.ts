import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { SkillSlot } from "@/types/timeline";
import { useChampionDetails } from "@/composables/useChampionQueries";
import { ddragonImage } from "@/services/staticDataService";
import { useStaticDataStore } from "@/stores/staticData";

export interface AbilityInfo {
  name: string;
  src: string;
}

export function useChampionAbilities(championId: MaybeRefOrGetter<number | null>) {
  const staticData = useStaticDataStore();
  const details = useChampionDetails(() => toValue(championId));

  const abilities = computed<Record<SkillSlot, AbilityInfo> | undefined>(() => {
    const data = details.data.value;
    const version = staticData.version;
    if (!data || !version) return undefined;
    const [q, w, e, r] = data.spells.map((spell) => ({ name: spell.name, src: ddragonImage.championSpell(version, spell.image) }));
    return q && w && e && r ? { 1: q, 2: w, 3: e, 4: r } : undefined;
  });

  const passiveIcon = computed(() => {
    const data = details.data.value;
    return data && staticData.version ? ddragonImage.passive(staticData.version, data.passive.image) : undefined;
  });

  return { details: details.data, abilities, passiveIcon };
}
