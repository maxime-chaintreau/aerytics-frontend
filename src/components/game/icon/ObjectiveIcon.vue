<script setup lang="ts">
import { computed } from "vue";
import type { ObjectiveName, TeamSide } from "@/types/match";

type TeamObjective = Exclude<ObjectiveName, "champion">;

const SHAPES: Record<TeamObjective, { d: string; evenodd?: boolean }> = {
  tower: {
    d: "m12 8-2 8H6L4 8l4 4zM8 0l4 4-1.003 1.002L11 5h3l-6 6-6-6h2.999L4 4zm0 2.4L6.4 4 8 5.6 9.6 4z",
  },
  inhibitor: {
    d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12m0-10 4 4-4 4-4-4z",
    evenodd: true,
  },
  dragon: {
    d: "M8 0 6 4 3 1v4H0l3 3v3l4 5h2l4-5V8l3-3h-3V1l-3 3zm1 11 1-2 2-1-1 2zM4 8l1 2 2 1-1-2z",
    evenodd: true,
  },
  voidGrubs: {
    d: "M8 1 6.333 2.42s-.87.798-1.151.798H3.928c-.928 0-2.261.978-2.557 2.68-.074.429-.098 1.282.56 2.168L1 8.812s1.333.71 1.667 2.131C3 12.363 5.088 13.704 6.9 14.088l1.08.881V15L8 14.985l.019.015v-.031l1.08-.881c1.813-.384 3.901-1.724 4.234-3.145.334-1.42 1.667-2.13 1.667-2.13l-.931-.747c.658-.886.637-1.726.56-2.169-.296-1.701-1.629-2.68-2.557-2.68h-1.254c-.28 0-1.151-.797-1.151-.797zm.149 3.245a.2.2 0 0 0-.298 0L5.434 6.93a.2.2 0 0 0 .021.29c.275.228.818.687 1.007.914.21.255-1.316 1.405-1.862 1.804a.202.202 0 0 0-.026.304l1.84 1.88a.2.2 0 0 0 .285 0l1.158-1.183a.2.2 0 0 1 .286 0L9.3 12.122a.2.2 0 0 0 .286 0l1.84-1.88a.202.202 0 0 0-.026-.304c-.546-.399-2.073-1.549-1.862-1.804.189-.227.732-.686 1.007-.913a.2.2 0 0 0 .021-.29z",
    evenodd: true,
  },
  riftHerald: {
    d: "M14.286 11.387c1.219.552 1.714 1.599 1.714 1.599-1.155 2.232-2.581 2.351-2.755 2.357h-.018c.345-.39 1.059-3.956 1.059-3.956m-12.572 0s.713 3.565 1.058 3.956c0 0-1.541.023-2.772-2.357 0 0 .494-1.047 1.714-1.6M11.238 1s4.44 2.576 3.75 7.845c0 0-2.048.345-2.163 1.886 0 0-.85 3.382-4.762 3.52H7.930c-3.91-.138-4.762-3.52-4.762-3.52-.115-1.541-2.163-1.886-2.163-1.886C.314 3.576 4.754 1 4.754 1c-1.157 3.41.03 4.182.152 4.25l.01.006c1.09-.805 2.125-1.095 3.032-1.12q.024-.004.048-.002l.048-.002c.907.029 1.942.319 3.033 1.124 0 0 1.38-.667.16-4.256m-.127 7.638c.023-2.83-3.04-2.588-3.163-2.578-.123-.01-3.186-.252-3.163 2.578 0 0 .023 3.393 3.094 3.68h.138c3.07-.287 3.094-3.68 3.094-3.68M7.993 7.073c.571 0 1.034.94 1.034 2.102 0 1.16-.463 2.1-1.034 2.1-.57 0-1.034-.94-1.034-2.1s.463-2.102 1.034-2.102",
  },
  baron: {
    d: "M9 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7 8a1 1 0 1 1 2 0 1 1 0 0 1-2 0m0 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0m-2-2a1 1 0 1 1 2 0 1 1 0 0 1-2 0m5-10 2 4-1 1H9L8 4 7 5H5L4 4l2-4-6 4 2 4 3 8 1-1h4l1 1 3-8 2-4z",
  },
};

const props = defineProps<{
  objective: TeamObjective;
  side: TeamSide;
  size?: number;
}>();

const shape = computed(() => SHAPES[props.objective]);
const sizeStyle = computed(() => (props.size ? { "--objective-size": `${props.size}px` } : undefined));
</script>

<template>
  <svg class="objective-icon" :class="`objective-icon--${side.toLowerCase()}`" :style="sizeStyle" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path fill="currentColor" :fill-rule="shape.evenodd ? 'evenodd' : undefined" :d="shape.d" />
  </svg>
</template>

<style scoped>
.objective-icon {
  display: block;
  flex-shrink: 0;
  width: var(--objective-size, 18px);
  height: var(--objective-size, 18px);
}

.objective-icon--blue {
  color: var(--team-blue);
}

.objective-icon--red {
  color: var(--team-red);
}
</style>
