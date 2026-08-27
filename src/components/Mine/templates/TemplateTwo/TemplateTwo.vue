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
import ULanguageDialog from "@/components/Home/ULanguageDialog.vue";
import depositIcon from "@/assets/mine/template-two/deposit.webp";
import type {
  MineTemplateActionItem,
  MineTemplateMenuGroup,
  MineTemplateSelectPayload
} from "./types";

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

const currencyInfo = computed(() => {
  return app.appInfo.countryList.find(currency => currency.id == auth.user.currencyId);
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
  return props.quickActions?.length ? props.quickActions : defaultQuickActions.value;
});

const menuGroups = computed(() => {
  const groups = props.menuGroups?.length ? props.menuGroups : defaultMenuGroups.value;

  if (auth.token) return groups;

  return groups
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
  if (!auth.token) return;

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
  if (!auth.token) return;

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
  <section class="mine-template-two">
    <button
      v-if="showBack"
      type="button"
      class="mine-template-two__back"
      :aria-label="$t('返回上一级')"
      @click="handleBack"
    >
      <svg-icon name="arrow-back" />
    </button>

    <div class="mine-template-two__hero">
      <TemplateTwoTopCard
        :is-login="Boolean(auth.token)"
        :user="auth.user"
        :message-count="messageCount"
        :currency-prefix="currencyInfo?.numberPrefix"
        @header-action="handleTopAction"
        @profile-action="handleUserAction"
        @guest-action="handleGuestAction"
      />
      <TemplateTwoQuickNav :items="quickActions" @select="handleQuickSelect" />
    </div>

    <TemplateTwoVipCard v-if="auth.token" />
    <TemplateTwoMenu
      class="mine-template-two__menu"
      :class="{ 'mine-template-two__menu--guest': !auth.token }"
      :groups="menuGroups"
      @select="handleMenuSelect"
    />
    <ULanguageDialog v-model="languageDialogVisible" />
  </section>
</template>

<style scoped lang="less">
.mine-template-two {
  min-height: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  color: var(--skin__lead);
  background: var(--skin__bg_2);
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
  width: 16px;
  height: 16px;
  padding: 8px 7px;
  box-sizing: content-box;
  position: absolute;
  top: var(--status-bar-height);
  left: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--skin__neutral_1);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}

.mine-template-two__hero {
  min-height: 168px;
  padding-top: var(--status-bar-height);
  position: relative;
  background-color: var(--skin__bg_2);
  background-image: url("@/assets/mine/template-two/top_bg.avif");
  background-position: center top;
  background-size: 100% auto;
  background-repeat: no-repeat;
}

.mine-template-two__menu--guest {
  margin-top: 10px;
}

:global([dir="rtl"]) .mine-template-two__back {
  right: 0;
  left: auto;
}
</style>
