import { watch, type MaybeRefOrGetter, toValue } from "vue";

export function usePageTitle(title: MaybeRefOrGetter<string | null>) {
  watch(
    () => toValue(title),
    (value) => {
      if (value) document.title = `${value} — Aerytics`;
    },
    { immediate: true, flush: "post" },
  );
}
