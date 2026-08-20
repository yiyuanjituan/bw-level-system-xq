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
import { Dialog } from "vant";
import { Geetest } from "vue3-geetest";
import "vant/lib/index.css";
import { initApp } from "@/utils/site";
import { initializeStatusBarHeight } from "@/utils/yimenApp";
import useHomeDataStore from "@/store/modules/home";

initializeStatusBarHeight();

const app = createApp(App);
app.use(store);
app.use(router);
app.use(i18n);
app.use(Dialog);
app.use(Geetest, {
  // captchaId: '54088bb07d2df3c46b79f80300b0abbe11'
  // captchaId: '54088bb07d2df3c46b79f80300b0abbe'
  captchaId: "c7f7181c75483c121ad718b7a636f0d0"
});

initApp().finally(() => {
  // 先读取持久化缓存完成首屏渲染，再在应用启动时后台刷新轮播数据。
  void useHomeDataStore(store).loadBanner();
  app.mount("#app");
});
