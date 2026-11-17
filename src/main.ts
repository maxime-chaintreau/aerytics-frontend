import { createApp } from "vue";
import { createPinia } from "pinia";
import { PiniaColada } from "@pinia/colada";

import "@fontsource-variable/inter/wght.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow/latin-700.css";
import "./styles/main.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(PiniaColada, {
  queryOptions: {
    staleTime: 60_000, // fresh for 1 min: no request when coming back to a profile
    gcTime: 5 * 60_000, // unused data deleted after 5 min
    refetchOnWindowFocus: true, // reload stale data when the user comes back to the tab
  },
});
app.use(router);

app.mount("#app");
