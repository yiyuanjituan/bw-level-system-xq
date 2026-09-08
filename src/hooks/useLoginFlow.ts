import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import { $t } from "@/locales";
import { clearStoredInviteCode, getStoredInviteCode } from "@/utils/inviteCode";
import { showCustomToast } from "@/hooks/useCommon";
import {
  userLogin,
  userPhoneLogin,
  userRegister,
  userTelegramLoginComplete,
  userTelegramLoginStart
} from "@/api/common";
import useAppStore from "@/store/modules/app";
import useAuthStore from "@/store/modules/user";
import type { loginProps, registerProps } from "@/enums/props";
import telegramLoginIcon from "@/assets/common/quick-login/telegram.avif";

export type LoginFlowTab = 0 | 1;
export type LoginSuccessType = "login" | "register";

export interface LoginFlowOptions {
  initialTab?: LoginFlowTab;
  syncRoute?: boolean;
  onSuccess?: (type: LoginSuccessType) => void | Promise<void>;
  onNavigate?: () => void;
}

type FormRef = {
  form?: {
    validate?: () => Promise<void>;
  };
};

function getTabByPath(path: string): LoginFlowTab {
  return path.includes("/home/login") ? 1 : 0;
}

function getPathByTab(tab: LoginFlowTab) {
  return tab === 1 ? "/home/login" : "/home/register";
}

function normalizeTab(value: unknown): LoginFlowTab {
  return Number(value) === 0 ? 0 : 1;
}

function getRouteInviteCode(route: ReturnType<typeof useRoute>) {
  const inviteCode = Array.isArray(route.query.dl) ? route.query.dl[0] : route.query.dl;
  return typeof inviteCode === "string" ? inviteCode.trim() : "";
}

/**
 * 页面与弹窗共用认证流程，避免验证码、短信登录和第三方回调出现两套行为。
 */
export function useLoginFlow(options: LoginFlowOptions = {}) {
  const route = useRoute();
  const app = useAppStore();
  const auth = useAuthStore();
  const registerInviteCode = () => getRouteInviteCode(route) || getStoredInviteCode();
  const activeTabs = ref<LoginFlowTab>(
    options.initialTab === undefined ? getTabByPath(route.path) : normalizeTab(options.initialTab)
  );
  const showLoading = ref(false);
  const telegramLoginLoading = ref(false);
  const isAgreeAccept = ref(true);
  const loginForm = ref<loginProps>({
    type: "password",
    accountType: "account",
    account: "",
    password: "",
    sms_code: ""
  });
  const registerForm = ref<registerProps>({
    type: "password",
    account: "",
    password: "",
    invite_code: registerInviteCode(),
    sms_code: "",
    currency: ""
  });
  const loginFormRef = ref<FormRef>();
  const registerFormRef = ref<FormRef>();
  const policyRef = ref<{ open?: () => void }>();
  const geeTestRef = ref<{ showCaptcha?: () => void }>();

  const quickLoginOptions = computed(() => [
    ...(app.appInfo?.telegramLogin?.enabled
      ? [{ name: "Telegram", icon: telegramLoginIcon }]
      : [])
  ]);

  function replaceCurrentPath(path: string) {
    void router.replace({ path, query: { ...route.query } });
  }

  function setTab(tab: number | string) {
    activeTabs.value = normalizeTab(tab);
  }

  function reset(initialTab: LoginFlowTab = 1) {
    activeTabs.value = normalizeTab(initialTab);
    showLoading.value = false;
    isAgreeAccept.value = true;
    loginForm.value = {
      type: "password",
      accountType: "account",
      account: "",
      password: "",
      sms_code: ""
    };
    registerForm.value = {
      type: "password",
      account: "",
      password: "",
      invite_code: registerInviteCode(),
      sms_code: "",
      currency: ""
    };
  }

  function handleTabChange(tab: number | string) {
    showLoading.value = false;
    const nextTab = normalizeTab(tab);
    activeTabs.value = nextTab;

    if (options.syncRoute) {
      const nextPath = getPathByTab(nextTab);
      if (window.location.hash !== `#${nextPath}`) {
        replaceCurrentPath(nextPath);
      }
    }
  }

  function openAccept() {
    policyRef.value?.open?.();
  }

  function jumpToService() {
    options.onNavigate?.();
    void router.push("/home/notice");
  }

  function freeTrialGame() {
    options.onNavigate?.();
    void router.push({ path: "/home/subGame", query: { type: "20", platformId: 0 } });
  }

  function handleQuickLogin(name: string) {
    if (name === "Telegram") {
      void openTelegramLogin().catch(() => undefined);
      return;
    }

    showCustomToast({
      type: "warning",
      message: `${name}快捷登录暂未开放`
    });
  }

  async function openTelegramLogin() {
    const telegramConfig = app.appInfo?.telegramLogin;
    if (!telegramConfig?.enabled) {
      showCustomToast({ type: "warning", message: $t("当前站点未开启Telegram快捷登录") });
      return;
    }

    let loginDomain: URL;
    try {
      loginDomain = new URL(String(telegramConfig.domain || ""));
    } catch {
      showCustomToast({ type: "fail", message: $t("Telegram登录Domain配置无效") });
      return;
    }
    if (!["http:", "https:"].includes(loginDomain.protocol)) {
      showCustomToast({ type: "fail", message: $t("Telegram登录Domain只支持HTTP或HTTPS") });
      return;
    }

    if (telegramLoginLoading.value) return;

    telegramLoginLoading.value = true;
    try {
      const returnUrl = new URL(window.location.href);
      returnUrl.searchParams.delete("telegramTicket");
      returnUrl.searchParams.delete("telegramError");
      returnUrl.searchParams.delete("telegramAutoStart");
      returnUrl.searchParams.delete("telegramAuthorizationUrl");
      const result = await userTelegramLoginStart({
        returnUrl: returnUrl.toString()
      });
      const authorizationUrl = new URL(result?.authorizationUrl || "");
      if (authorizationUrl.origin !== "https://oauth.telegram.org") {
        throw new Error($t("Telegram授权地址无效"));
      }

      if (loginDomain.origin.toLowerCase() !== window.location.origin.toLowerCase()) {
        // 原始回跳地址由 API 保存在 state 中，跨域时只传递 Telegram 授权地址。
        const gatewayUrl = new URL(
          `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`,
          loginDomain.origin
        );
        gatewayUrl.searchParams.set("telegramAutoStart", "1");
        gatewayUrl.searchParams.set("telegramAuthorizationUrl", authorizationUrl.toString());
        window.location.assign(gatewayUrl.toString());
        return;
      }

      window.location.assign(authorizationUrl.toString());
    } finally {
      telegramLoginLoading.value = false;
    }
  }

  async function handleTelegramGateway() {
    const currentUrl = new URL(window.location.href);
    const shouldAutoStart = currentUrl.searchParams.get("telegramAutoStart") === "1";
    const authorizationUrlText = currentUrl.searchParams.get("telegramAuthorizationUrl");
    if (!shouldAutoStart || !authorizationUrlText) return;

    let telegramOrigin = "";
    try {
      telegramOrigin = new URL(String(app.appInfo?.telegramLogin?.domain || "")).origin.toLowerCase();
    } catch {
      showCustomToast({ type: "fail", message: $t("Telegram登录Domain配置无效") });
      return;
    }
    if (telegramOrigin !== currentUrl.origin.toLowerCase()) {
      showCustomToast({ type: "fail", message: $t("当前页面不是Telegram统一登录Domain") });
      return;
    }

    let authorizationUrl: URL;
    try {
      authorizationUrl = new URL(authorizationUrlText);
    } catch {
      showCustomToast({ type: "fail", message: $t("Telegram授权地址无效") });
      return;
    }
    if (authorizationUrl.origin !== "https://oauth.telegram.org") {
      showCustomToast({ type: "fail", message: $t("Telegram授权地址无效") });
      return;
    }

    // 先清理网关参数，避免页面模式与弹窗模式同时挂载时重复发起跳转。
    currentUrl.searchParams.delete("telegramAutoStart");
    currentUrl.searchParams.delete("telegramAuthorizationUrl");
    window.history.replaceState(
      window.history.state,
      "",
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
    );
    window.location.replace(authorizationUrl.toString());
  }

  async function completeLogin(result: any, type: LoginSuccessType) {
    auth.setToken(result?.token);
    await auth.updateInfo().catch(() => undefined);
    await options.onSuccess?.(type);
  }

  async function handleTelegramCallback() {
    const currentUrl = new URL(window.location.href);
    const loginTicket = currentUrl.searchParams.get("telegramTicket");
    const loginError = currentUrl.searchParams.get("telegramError");
    if (!loginTicket && !loginError) return;

    currentUrl.searchParams.delete("telegramTicket");
    currentUrl.searchParams.delete("telegramError");
    window.history.replaceState(
      window.history.state,
      "",
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
    );

    if (loginError) {
      showCustomToast({
        type: "fail",
        message: loginError === "authorization_denied" ? "已取消Telegram授权" : "Telegram授权失败，请重试"
      });
      return;
    }

    telegramLoginLoading.value = true;
    try {
      const result = await userTelegramLoginComplete({
        loginTicket: String(loginTicket),
        deviceInfo: { loginType: "H5" }
      });
      await completeLogin(result, "login");
    } finally {
      telegramLoginLoading.value = false;
    }
  }

  async function handleQuery() {
    if (showLoading.value) return false;

    if (!isAgreeAccept.value && activeTabs.value === 0) {
      showCustomToast({ type: "warning", message: $t("请先阅读并同意用户协议") });
      return false;
    }

    const formRef = activeTabs.value === 0 ? registerFormRef.value : loginFormRef.value;
    const validate = formRef?.form?.validate;
    if (!validate) return false;

    try {
      await validate();
    } catch (error: any) {
      const firstError = error?.errors?.[0];
      const fieldErrors = error?.fields && typeof error.fields === "object"
        ? Object.values(error.fields).flat()
        : [];
      const firstFieldError = fieldErrors[0] as { message?: unknown } | string | undefined;
      const message = typeof firstError?.message === "string"
        ? firstError.message
        : typeof firstFieldError === "string"
          ? firstFieldError
          : firstFieldError && typeof firstFieldError === "object" && typeof firstFieldError.message === "string"
            ? firstFieldError.message
            : "请检查输入内容后重试";
      showCustomToast({ type: "warning", message });
      return false;
    }

    geeTestRef.value?.showCaptcha?.();
    return true;
  }

  async function handleRegister() {
    try {
      const result = await userRegister(registerForm.value);
      clearStoredInviteCode();
      await completeLogin(result, "register");
    } finally {
      showLoading.value = false;
    }
  }

  async function handleLogin() {
    try {
      const loginRequest = loginForm.value.type === "sms" ? userPhoneLogin : userLogin;
      const result = await loginRequest(loginForm.value);
      await completeLogin(result, "login");
    } finally {
      showLoading.value = false;
    }
  }

  function handleExec() {
    if (showLoading.value) return;
    showLoading.value = true;
    void (activeTabs.value === 0 ? handleRegister() : handleLogin()).catch(() => undefined);
  }

  if (options.syncRoute) {
    watch(
      () => route.path,
      path => {
        const nextTab = getTabByPath(path);
        if (activeTabs.value !== nextTab) activeTabs.value = nextTab;
      },
      { immediate: true }
    );
  }

  onMounted(async () => {
    try {
      await handleTelegramCallback();
      await handleTelegramGateway();
    } catch {
      // API 拦截器负责展示请求错误，这里只阻止回调异常冒泡为未处理 Promise。
    }
  });

  return {
    activeTabs,
    showLoading,
    telegramLoginLoading,
    isAgreeAccept,
    loginForm,
    registerForm,
    loginFormRef,
    registerFormRef,
    policyRef,
    geeTestRef,
    quickLoginOptions,
    setTab,
    reset,
    handleTabChange,
    openAccept,
    jumpToService,
    freeTrialGame,
    handleQuickLogin,
    handleQuery,
    handleExec,
    handleTelegramCallback,
    handleTelegramGateway
  };
}
