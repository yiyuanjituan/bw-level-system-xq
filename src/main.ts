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
import useAppStore from "@/store/modules/app";
import { initThemePreviewBridge, isThemePreviewMode } from "@/utils/themePreview";
import { registerPwa } from "@/utils/pwa";

initializeStatusBarHeight();
registerPwa();

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

initThemePreviewBridge(store);
app.mount("#app");

const appStore = useAppStore(store);
initApp(({ progress, status }) => {
  appStore.updateAppLoadingState(progress, status);
}).then(async (initialization) => {
  if (!isThemePreviewMode()) {
    appStore.updateAppLoadingState(92, "正在加载首页内容");
    await useHomeDataStore(store).loadBanner();
  }
  // 远程配置和首页数据准备完成后，最后应用主题并关闭 loading。
  await appStore.completeAppInitialization(initialization);
}).catch(async () => {
  // 网络异常时使用项目内置样式继续启动，避免页面永久停留在 loading。
  await appStore.completeAppInitialization({});
});
