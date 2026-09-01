<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { $locale, $t } from "@/locales";
import { handleBack } from "@/utils/common";
import { showCustomDialog, showCustomToast } from "@/hooks/useCommon";
import { bus } from "@/utils/mitt";
import { service } from "@/api/service";
import useAppStore from "@/store/modules/app";
import useAuthStore from "@/store/modules/user";
import TemplateTwoMenu from "./TemplateTwoMenu.vue";
import TemplateTwoQuickNav from "./TemplateTwoQuickNav.vue";
import TemplateTwoTopCard from "./TemplateTwoTopCard.vue";
import TemplateTwoVipCard from "./TemplateTwoVipCard.vue";
import MineBanner from "../TemplateOne/MineBanner.vue";
import ULanguageDialog from "@/components/Home/ULanguageDialog.vue";
import depositIcon from "@/assets/mine/template-two/deposit.webp";
import type {
  MineTemplateActionItem,
  MineTemplateMenuGroup,
  MineTemplateSelectPayload
} from "./types";
import { isThemePreviewMode } from "@/utils/themePreview";

defineOptions({
  name: "TemplateTwo"
});

const props = withDefaults(defineProps<{
  showBack?: boolean;
  quickActions?: MineTemplateActionItem[];
  menuGroups?: MineTemplateMenuGroup[];
}>(), {
  showBack: true
});

const emit = defineEmits<{
  select: [payload: MineTemplateSelectPayload];
}>();

const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();
const messageCount = ref(0);
const interestRateText = ref("");
const languageDialogVisible = ref(false);
const previewMode = isThemePreviewMode();
const loginState = computed(() => !previewMode && Boolean(auth.token));
const currencyInfo = computed(() => {
  return app.appInfo.countryList.find(currency => currency.id == auth.user?.currencyId);
});

// 列表菜单 key 到装修配置菜单项 key 的映射，未配置的项保持展示。
const MENU_KEY_TO_CANONICAL: Record<string, string> = {
  records: "records",
  "withdraw-manage": "withdrawManage",
  promote: "promote",
  claim: "claim",
  profile: "profile",
  security: "security",
  "find-us": "findUs",
  language: "language",
  faq: "faq",
  feedback: "feedback",
  devices: "devices",
  about: "about",
  logout: "logout",
};

const visibleSections = computed(() => app.minePageSections.filter(section => section.visible !== false));

// 自定义顶部背景使用上传/填写的图片地址，其余情况使用内置样式类。
const mineBgClass = computed(() => app.mineHeroStyle === "custom"
  ? ""
  : `mine-template-two__mine-bg--${app.mineHeroStyle}`);
const mineBgStyle = computed(() => {
  if (app.mineHeroStyle === "custom" && app.mineHeroImage) {
    return { backgroundImage: `url("${app.mineHeroImage}")` };
  }
  return {};
});

const currentLanguageName = computed(() => {
  return $locale.value === "en" ? "English" : $t("简体中文");
});

const defaultQuickActions = computed<MineTemplateActionItem[]>(() => [
  {
    key: "withdraw",
    label: $t("提现"),
    icon: "mine-template-two-mid_tx"
  },
  {
    key: "deposit",
    label: $t("存款"),
    image: depositIcon,
    badge: $t("送3%"),
    badgeTone: "danger"
  },
  {
    key: "yuebao",
    label: $t("利息宝"),
    icon: "mine-template-two-mid_lxb",
    badge: interestRateText.value,
    badgeTone: "success"
  }
]);

const defaultMenuGroups = computed<MineTemplateMenuGroup[]>(() => [
  {
    key: "finance",
    items: [
      {
        key: "records",
        label: $t("我的记录"),
        icon: "mine-template-two-list_zhmx",
        extra: $t("明细、记录、报表、找回余额"),
        extraTone: "primary",
        route: "/home/report"
      },
      {
        key: "withdraw-manage",
        label: $t("提现管理"),
        icon: "mine-template-two-list_txgl",
        route: "/home/withdraw?active=10"
      }
    ]
  },
  {
    key: "service",
    items: [
      {
        key: "promote",
        label: $t("分享赚钱"),
        icon: "mine-template-two-list_fxzq",
        extra: $t("佣金55%"),
        extraTone: "primary",
        route: "/home/promote"
      },
      {
        key: "claim",
        label: $t("第三方平台担保"),
        iconMode: "claim",
        extra: $t("已缴纳高额保证金"),
        extraTone: "success",
        route: "/home/claim"
      },
      {
        key: "profile",
        label: $t("个人资料"),
        icon: "mine-template-two-list_grzl",
        route: "/home/setting"
      },
      {
        key: "security",
        label: $t("安全中心"),
        icon: "mine-template-two-list_aqzx",
        route: "/home/security"
      },
      {
        key: "find-us",
        label: $t("找到我们"),
        icon: "mine-template-two-list_zdwm",
        extra: $t("防止打不开"),
        extraTone: "muted"
      },
      {
        key: "language",
        label: $t("选择语言"),
        icon: "mine-template-two-list_xzyy",
        extra: currentLanguageName.value,
        extraTone: "muted"
      },
      {
        key: "faq",
        label: $t("常见问题"),
        icon: "mine-template-two-list_cjwt",
        route: "/home/notice?noticeType=4"
      },
      {
        key: "feedback",
        label: $t("有奖反馈"),
        icon: "mine-template-two-list_yjfk",
        route: "/home/notice?noticeType=5"
      },
      {
        key: "devices",
        label: $t("登录设备"),
        icon: "mine-template-two-list_dlsb",
        route: "/home/device"
      },
      {
        key: "about",
        label: $t("关于我们"),
        icon: "mine-template-two-list_gywm",
        route: "/about"
      },
      {
        key: "logout",
        label: $t("安全退出"),
        icon: "mine-template-two-list_aqtc",
        hiddenWhenLogout: true
      }
    ]
  }
]);

const quickActions = computed(() => {
  if (props.quickActions?.length) return props.quickActions;

  const itemMap = new Map(defaultQuickActions.value.map(item => [item.key, item]));
  return app.mineQuickActions.flatMap(configItem => {
    const actionItem = itemMap.get(configItem.key);
    return configItem.visible !== false && actionItem ? [actionItem] : [];
  });
});

const menuGroups = computed(() => {
  let visibleGroups: MineTemplateMenuGroup[];
  if (props.menuGroups?.length) {
    visibleGroups = props.menuGroups;
  } else {
    const menuItemMap = new Map(
      defaultMenuGroups.value.flatMap(group => group.items).map(item => [MENU_KEY_TO_CANONICAL[item.key], item])
    );
    const orderedItems = app.mineMenuItems.flatMap(configItem => {
      const menuItem = menuItemMap.get(configItem.key);
      return configItem.visible !== false && menuItem ? [menuItem] : [];
    });
    visibleGroups = orderedItems.length ? [{ key: "configured", items: orderedItems }] : [];
  }

  if (loginState.value) return visibleGroups;

  return visibleGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.hiddenWhenLogout)
    }))
    .filter(group => group.items.length);
});

function emitSelect(source: MineTemplateSelectPayload["source"], action: string, item?: MineTemplateActionItem) {
  emit("select", { source, action, item });
}

async function loadMessageCount() {
  if (!loginState.value) return;

  try {
    const response = await service.v1.notice.notifyList({ limit: 9999 });
    const total = Number(response?.total);
    const messageList = Array.isArray(response?.list) ? response.list : [];

    messageCount.value = Number.isFinite(total) ? total : messageList.length;
  } catch (error) {
    messageCount.value = 0;
    console.error("获取个人中心消息数量失败，失败原因：", error);
  }
}

async function loadInterestRate() {
  if (!loginState.value) return;

  try {
    const response = await service.v1.activity.interestInfo();
    const yearRateText = response?.display?.year_rate_text;
    const yearScale = Number(response?.config?.year_scale);

    interestRateText.value = yearRateText || (Number.isFinite(yearScale) ? `${yearScale}%` : "");
  } catch (error) {
    interestRateText.value = "";
    console.error("获取个人中心利息宝年利率失败，失败原因：", error);
  }
}

function handleWithdraw() {
  if (!auth.token || !auth.user?.id) {
    void router.push("/home/login");
    return;
  }

  if (!auth.user.hasPayPassword) {
    void router.push("/home/security?active=5");
    showCustomToast({
      type: "warning",
      message: $t("为了资金安全，需先设置提现密码哦！")
    });
    return;
  }

  void router.push("/home/withdraw");
}

function safeLogOut() {
  if (!auth.token) return;

  showCustomDialog({
    title: $t("温馨提示"),
    message: $t("是否退出当前账号?"),
    showCancelButton: true,
    confirmButtonText: $t("确认退出"),
    cancelButtonText: $t("我点错了"),
    width: 300
  }).then(result => {
    if (!result) return;

    auth.logout();
    showCustomToast({ type: "success", message: $t("退出成功") });
    setTimeout(() => {
      void router.replace("/");
    }, 500);
  });
}

function handleBuiltinAction(action: string, item?: MineTemplateActionItem) {
  if (action === "withdraw") {
    handleWithdraw();
    return;
  }

  if (action === "deposit") {
    bus.emit("showRecharge");
    return;
  }

  if (action === "yuebao") {
    void router.push("/home/yuebao");
    return;
  }

  if (action === "profile") {
    void router.push("/home/setting");
    return;
  }

  if (action === "login") {
    void router.push("/home/login");
    return;
  }

  if (action === "register") {
    void router.push("/home/register");
    return;
  }

  if (action === "service") {
    void router.push({ path: "/home/notice", query: { noticeType: 4 } });
    return;
  }

  if (action === "message") {
    void router.push({ path: "/home/notice", query: { noticeType: 1 } });
    return;
  }

  if (action === "find-us") {
    bus.emit("findUs");
    return;
  }

  if (action === "language") {
    languageDialogVisible.value = true;
    return;
  }

  if (action === "logout") {
    safeLogOut();
    return;
  }

  if (item?.route) {
    void router.push(item.route);
  }
}

function handleTopAction(action: MineTemplateSelectPayload["action"]) {
  emitSelect("header", action);
  handleBuiltinAction(action);
}

function handleUserAction(action: "profile") {
  emitSelect("user", action);
  handleBuiltinAction(action);
}

function handleGuestAction(action: "login" | "register") {
  emitSelect("guest", action);
  handleBuiltinAction(action);
}

function handleQuickSelect(item: MineTemplateActionItem) {
  emitSelect("quick", item.key, item);
  handleBuiltinAction(item.key, item);
}

function handleMenuSelect(item: MineTemplateActionItem) {
  emitSelect("menu", item.key, item);
  handleBuiltinAction(item.key, item);
}

onMounted(() => {
  void loadMessageCount();
  void loadInterestRate();
});
</script>

<template>
  <div class="mine-template-two-layout" data-show-big-icon="0">
    <section
      data-route-for-scroll="mine"
      class="mine-template-two lobby-scroll lobby-scroll--y lobby-scroll--system-scrollbar"
    >
      <div
        v-if="showBack"
        class="mine-template-two__back"
        role="button"
        tabindex="0"
        :aria-label="$t('返回上一级')"
        @click="handleBack"
        @keydown.enter.space.prevent="handleBack"
      >
        <i class="ui-arrow ui-arrow--left">
          <svg-icon name="arrow-back" />
        </i>
      </div>

      <div
        class="mine-template-two__mine-bg lobby-image lobby-image--use-bg mine-box"
        :class="mineBgClass"
        :style="mineBgStyle"
      >
        <template v-for="section in visibleSections" :key="`${app.minePageLayoutVersion}-${section.key}`">
          <TemplateTwoTopCard
            v-if="section.key === 'profile'"
            :is-login="loginState"
            :user="auth.user"
            :message-count="messageCount"
            :currency-prefix="currencyInfo?.numberPrefix"
            :currency-icon="currencyInfo?.icon"
            @header-action="handleTopAction"
            @profile-action="handleUserAction"
            @guest-action="handleGuestAction"
          />
          <TemplateTwoQuickNav
            v-else-if="section.key === 'quick' && quickActions.length"
            :items="quickActions"
            @select="handleQuickSelect"
          />
          <TemplateTwoVipCard v-else-if="section.key === 'vip' && loginState" />
          <MineBanner v-else-if="section.key === 'banner'" class="mine-template-two__banner" />
          <TemplateTwoMenu
            v-else-if="section.key === 'menu' && menuGroups.length"
            class="mine-template-two__menu"
            :class="{ 'mine-template-two__menu--guest': !loginState }"
            :groups="menuGroups"
            @select="handleMenuSelect"
          />
        </template>
      </div>

      <ULanguageDialog v-model="languageDialogVisible" />
    </section>
  </div>
</template>

<style scoped lang="less">
.mine-template-two-layout,
.mine-template-two {
  width: 100%;
  height: 100%;
}

.mine-template-two-layout {
  position: relative;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.mine-template-two {
  min-height: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  color: var(--skin__lead);
  background: var(--skin__bg_1);
  scrollbar-width: thin;
  scrollbar-color: var(--skin__border) transparent;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: var(--skin__border);
  }
}

.mine-template-two__back {
  width: 30px;
  height: 32px;
  position: absolute;
  top: var(--status-bar-height);
  left: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--skin__neutral_1);
  font-size: 12px;
  cursor: pointer;
}

.mine-template-two__back .ui-arrow {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mine-template-two__mine-bg {
  width: 100%;
  min-height: 100%;
  padding-top: var(--status-bar-height);
  box-sizing: border-box;
  position: relative;
  background-color: var(--skin__bg_2);
  background-image: none;
  background-position: center top;
  background-size: 100% auto;
  background-repeat: no-repeat;
}

.mine-template-two__mine-bg--blue {
  background-image: url("@/assets/mine/template-two/top_bg.avif");
}

.mine-template-two__mine-bg--common {
  background-image: url("/siteadmin/skin/lobby_asset/common/common/profile/style_1_topbg_yd.avif");
}

.mine-template-two__mine-bg--common82 {
  background-image: url("/siteadmin/skin/lobby_asset/82-0-common/common/profile/img_topbg.avif");
}

.mine-template-two__menu--guest {
  margin-top: 10px;
}

.mine-template-two__banner {
  margin-top: 10px;
}

:global([dir="rtl"]) .mine-template-two__back {
  right: 0;
  left: auto;
}
</style>
