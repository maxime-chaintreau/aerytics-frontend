<script setup lang="ts">
import { computed } from "vue";
import type { Role } from "@/types/riot";
import { formatRole } from "@/utils/labels";

const files = import.meta.glob<string>("@/assets/riot/roles/*", { eager: true, query: "?url", import: "default" });
const ICONS: Partial<Record<Role | "ALL", string>> = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split("/").pop()!.split(".")[0]!.toUpperCase();
  ICONS[name as Role | "ALL"] = url;
}

const props = withDefaults(
  defineProps<{
    role: Role | "ALL";
    size?: number;
    decorative?: boolean;
  }>(),
  { decorative: false },
);

const style = computed(() => ({
  "--role-icon": `url("${ICONS[props.role] ?? ""}")`,
  ...(props.size ? { "--role-size": `${props.size}px` } : {}),
}));
const label = computed(() => (props.role === "ALL" ? "Tous les rôles" : formatRole(props.role)));
</script>

<template>
  <span
    class="role-icon"
    :style="style"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : label"
    :aria-hidden="decorative ? 'true' : undefined"
    :title="decorative ? undefined : label"
  />
</template>

<style scoped>
.role-icon {
  display: block;
  flex-shrink: 0;
  width: var(--role-size, 16px);
  height: var(--role-size, 16px);
  background-color: currentColor;
  mask: var(--role-icon) center / contain no-repeat;
}
</style>
