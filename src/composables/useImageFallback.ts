import { computed, ref, toValue, type MaybeRefOrGetter } from "vue";

export function useImageFallback(src: MaybeRefOrGetter<string | undefined>) {
  const failedSrc = ref<string>();
  const failed = computed(() => {
    const value = toValue(src);
    return value !== undefined && value === failedSrc.value;
  });
  const shown = computed(() => (failed.value ? undefined : toValue(src)));
  const onError = () => (failedSrc.value = toValue(src));
  return { shown, failed, onError };
}
