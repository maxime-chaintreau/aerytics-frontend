<script setup lang="ts">
import { computed, ref } from "vue";
import { useStaticDataStore } from "@/stores/staticData";
import placeholderUrl from "@/assets/riot/summoner-none.jpg";

const props = defineProps<{ iconId: number; size?: number }>();

const staticData = useStaticDataStore();
const src = computed(() => staticData.profileIconUrl(props.iconId));
const failedSrc = ref<string>();
const shown = computed(() => (src.value && src.value !== failedSrc.value ? src.value : placeholderUrl));
const sizeStyle = computed(() => (props.size ? { "--profile-icon-size": `${props.size}px` } : undefined));
</script>

<template>
  <img class="profile-icon" :src="shown" :style="sizeStyle" alt="" loading="lazy" @error="failedSrc = src" />
</template>

<style scoped>
.profile-icon {
  display: block;
  flex-shrink: 0;
  width: var(--profile-icon-size, 32px);
  height: var(--profile-icon-size, 32px);
  border-radius: 50%;
  object-fit: cover;
}
</style>
