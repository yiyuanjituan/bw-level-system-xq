<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import SubNavbar from "@/components/SubNavbar.vue";
import Copy from "@/components/Common/Copy.vue";
import EmailBinding from "@/views/home/security/EmailBinding.vue";
import LoginPassword from "@/views/home/security/LoginPassword.vue";
import PayPassword from "@/views/home/security/PayPassword.vue";
import PhoneBinding from "@/views/home/security/PhoneBinding.vue";
import useAuthStore from "@/store/modules/user";
import { showCustomToast } from "@/hooks/useCommon";
import router from "@/router";

interface SecurityMenuItem {
  key: string;
  label: string;
  icon: string;
  iconClass: string;
  value?: string;
  status?: string;
  statusNote?: string;
  disabled?: boolean;
  showCopy?: boolean;
  hideArrow?: boolean;
  active?: string;
}

const route = useRoute();
const auth = useAuthStore();

const isPhoneBindingView = computed(() => String(route.query.active ?? "") === "0");
const isEmailBindingView = computed(() => String(route.query.active ?? "") === "2");
const isLoginPasswordView = computed(() => String(route.query.active ?? "") === "4");
const isPayPasswordView = computed(() => String(route.query.active ?? "") === "5");
const account = computed(() => String(auth.user.account || auth.user.unionid || "--"));

const securityMenuGroups = computed<SecurityMenuItem[][]>(() => [
  [
    {
      key: "account",
      label: "会员账号",
      icon: "input_icon_zh",
      iconClass: "security-menu__icon--gray",
      value: account.value,
      disabled: true,
      showCopy: account.value !== "--"
    },
    {
      key: "phone",
      label: "手机",
      icon: "input_icon_sj",
      iconClass: "security-menu__icon--blue",
      status: auth.user.phone ? "已验证绑定" : "未添加",
      hideArrow: Boolean(auth.user.phone),
      active: "0"
    },
    {
      key: "email",
      label: "邮箱",
      icon: "security_email",
      iconClass: "security-menu__icon--gray",
      status: auth.user.email
        ? auth.user.emailVerified
          ? "已验证绑定"
          : "已添加"
        : "未添加",
      statusNote: auth.user.email && !auth.user.emailVerified ? "(未验证)" : undefined,
      active: "2"
    },
    {
      key: "googleAuthenticator",
      label: "Google验证器",
      icon: "security_google",
      iconClass: "security-menu__icon--google",
      status: auth.user.hasGoogleAuthenticator || auth.user.googleBind ? "已绑定" : "未绑定"
    }
  ],
  [
    {
      key: "loginPassword",
      label: "登录密码",
      icon: "security_password",
      iconClass: "security-menu__icon--green",
      active: "4"
    },
    {
      key: "payPassword",
      label: "提现密码",
      icon: "input_icon_card",
      iconClass: "security-menu__icon--red",
      status: auth.user.hasPayPassword ? "已设置" : "未设置",
      active: "5"
    },
    {
      key: "securityQuestion",
      label: "密保问题",
      icon: "security_question",
      iconClass: "security-menu__icon--green",
      status: auth.user.hasSecurityQuestion ? "已设置" : "未设置"
    }
  ]
]);

function handleMenuItem(menuItem: SecurityMenuItem) {
  if (menuItem.disabled || menuItem.hideArrow) return;

  if (menuItem.active) {
    router.push({ path: "/home/security", query: { active: menuItem.active } });
    return;
  }

  showCustomToast({ type: "warning", message: `${menuItem.label}功能暂未开放` });
}
</script>

<template>
  <phone-binding v-if="isPhoneBindingView" />
  <email-binding v-else-if="isEmailBindingView" />
  <login-password v-else-if="isLoginPasswordView" />
  <pay-password v-else-if="isPayPasswordView" />

  <div v-else class="security-page">
    <sub-navbar :title="$t('安全中心')" />

    <main class="security-page__content">
      <ul v-for="(menuGroup, groupIndex) in securityMenuGroups" :key="groupIndex" class="security-menu">
        <li
          v-for="menuItem in menuGroup"
          :key="menuItem.key"
          class="security-menu__item"
          :class="{ 'security-menu__item--disabled': menuItem.disabled }"
          @click="handleMenuItem(menuItem)"
        >
          <svg-icon
            :name="menuItem.icon"
            class-name="security-menu__icon"
            :class="menuItem.iconClass"
          />

          <span
            class="security-menu__label"
            :class="{ 'security-menu__label--required': menuItem.status?.startsWith('未') }"
          >
            {{ menuItem.label }}
          </span>

          <span class="security-menu__suffix">
            <span v-if="menuItem.value" class="security-menu__value">{{ menuItem.value }}</span>
            <span
              v-else-if="menuItem.status"
              class="security-menu__status"
              :class="{
                'security-menu__status--bound': menuItem.status?.startsWith('已'),
                'security-menu__status--verified': menuItem.status === '已验证绑定',
                'security-menu__status--unverified': Boolean(menuItem.statusNote)
              }"
            >
              {{ menuItem.status }}
              <span v-if="menuItem.statusNote" class="security-menu__status-note">
                {{ menuItem.statusNote }}
              </span>
            </span>
            <copy
              v-if="menuItem.showCopy"
              :text="menuItem.value"
              class="security-menu__copy"
            />
            <svg-icon
              v-if="!menuItem.disabled && !menuItem.hideArrow"
              name="comm_icon_fh"
              class-name="security-menu__arrow"
            />
          </span>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped lang="less">
.security-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--skin__lead, #fff);
  background: var(--skin__bg_1);
}

.security-page__content {
  flex: 1;
  min-height: 0;
  padding: 10px;
  overflow-y: auto;
  font-size: 12px;
}

.security-menu {
  padding: 0 10px;
  margin: 0 0 10px;
  overflow: hidden;
  list-style: none;
  background: var(--skin__bg_2, #191919);
  border-radius: 7px;
  box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.06);

  &:last-child {
    margin-bottom: 0;
  }
}

.security-menu__item {
  position: relative;
  display: flex;
  align-items: center;
  height: 35px;
  padding-left: 2px;
  border-bottom: 1px solid var(--skin__border, #242424);
  cursor: pointer;

  &:last-child {
    border-bottom: 0;
  }
}

.security-menu__item--disabled {
  cursor: no-drop;
}

.security-menu__icon {
  flex: 0 0 auto;
  width: 15px;
  height: 15px;
  margin-right: 7px;
  font-size: 15px;
}

.security-menu__icon--gray {
  color: var(--skin__neutral_2, #8d929b);
}

.security-menu__icon--blue {
  color: var(--skin__primary, #dfbe5b);
}

.security-menu__icon--google {
  color: #ffac12;
}

.security-menu__icon--green {
  color: #04be02;
}

.security-menu__icon--red {
  color: #e94d3c;
}

.security-menu__label {
  position: relative;
  display: -webkit-box;
  max-width: 175px;
  overflow: hidden;
  color: var(--skin__lead, #fff);
  text-align: left;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.security-menu__label--required::after {
  position: absolute;
  top: -2.5px;
  right: -10px;
  width: 10px;
  height: 10px;
  content: "";
  background: var(--skin__accent_2, #f84673);
  border-radius: 50%;
}

.security-menu__suffix {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  color: var(--skin__neutral_2, #8d929b);
}

.security-menu__value,
.security-menu__status {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.security-menu__status--bound {
  color: var(--skin__primary, #dfbe5b);
}

.security-menu__status--verified {
  color: var(--skin__accent_1, #04be02);
}

.security-menu__status--unverified {
  color: var(--skin__neutral_2, #8d929b);
}

.security-menu__status-note {
  color: var(--skin__primary, #dfbe5b);
}

.security-menu__copy {
  margin-left: 5px;
  font-size: 15px;
  vertical-align: middle;
}

.security-menu__arrow {
  width: 13px;
  height: 13px;
  margin-left: 5px;
  color: var(--skin__border, #242424);
  font-size: 13px;
  transform: rotate(180deg);
}
</style>
