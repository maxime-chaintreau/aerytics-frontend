import { createApp } from "vue";
import { createPinia } from "pinia";

import "@fontsource-variable/inter/wght.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow/latin-700.css";
import "./styles/main.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
