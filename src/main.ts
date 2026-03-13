import { createApp } from "vue";
import { store } from "./store";
// normalize.css
import "normalize.css/normalize.css";
// 全局样式
import "./styles/index.less";
// tailwindcss
import "./styles/tailwind.css";
// svg icon
import "virtual:svg-icons-register";
// i18n
import i18n from "./locales";

import App from "./App.vue";
import router from "./router";
import { Dialog } from 'vant';
import {Geetest} from 'vue3-geetest'
import 'vant/lib/index.css';
import { initApp } from "@/utils/site";

const app = createApp(App);
app.use(store);
app.use(router);
app.use(i18n);
app.use(Dialog);
app.use(Geetest, {
  // captchaId: '54088bb07d2df3c46b79f80300b0abbe11'
  captchaId: '54088bb07d2df3c46b79f80300b0abbe'
  // captchaId: 'c7f7181c75483c121ad718b7a636f0d0'
})

initApp().finally(() => app.mount("#app"))
