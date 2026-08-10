<script setup lang="ts">
import { reactive, ref } from "vue";
import PasswordPower from "@/components/Common/PasswordPower.vue";

defineOptions({
  name: "PromoteCreateSubordinate"
});

interface CreateSubordinatePayload {
  account: string;
  password: string;
}

interface FormInstance {
  validate: () => Promise<void>;
}

const emit = defineEmits<{
  create: [payload: CreateSubordinatePayload];
}>();

const createType = ref("single");
const formRef = ref<FormInstance>();
const formModel = reactive<CreateSubordinatePayload>({
  account: "",
  password: ""
});

const formRules = {
  account: {
    required: true,
    message: "请输入会员账号",
    trigger: ["blur", "change"]
  },
  password: {
    required: true,
    message: "请输入登录密码",
    trigger: ["blur", "change"]
  }
};

async function handleCreate() {
  try {
    await formRef.value?.validate();
  }
  catch {
    return;
  }

  emit("create", {
    account: formModel.account.trim(),
    password: formModel.password
  });
}
</script>

<template>
  <section class="create-subordinate">
    <div class="create-subordinate__type _created-type_9kid7_59">
      <x-tabs
        v-model="createType"
        type="card"
        shrink
        :show-nav-arrows="false"
      >
        <x-tab name="single" title="单一创建" />
      </x-tabs>
    </div>

    <div class="create-subordinate__body _prmote-base-layout_9exyk_60 _create-account_9exyk_64">
      <div class="create-subordinate__scroll lobby-scroll lobby-scroll--y lobby-scroll--system-scrollbar _register-form_9exyk_99">
        <x-form ref="formRef" :rule="formRules" :model="formModel" class="create-subordinate__form">
          <x-form-item prop="account" class="create-subordinate__form-item">
            <label class="create-subordinate__label" for="promote-subordinate-account">
              <span class="create-subordinate__required">*</span>
              <span>会员账号</span>
            </label>
            <x-input
              id="promote-subordinate-account"
              v-model="formModel.account"
              prefix="user"
              placeholder="请输入账号"
              autocomplete="username"
            />
          </x-form-item>

          <x-form-item prop="password" class="create-subordinate__form-item create-subordinate__password-item">
            <label class="create-subordinate__label" for="promote-subordinate-password">
              <span class="create-subordinate__required">*</span>
              <span>登录密码</span>
            </label>
            <x-input
              id="promote-subordinate-password"
              v-model="formModel.password"
              prefix="lock"
              placeholder="请输入密码"
              autocomplete="new-password"
              maxlength="16"
              show-eye
            />
          </x-form-item>

          <password-power :text="formModel.password" />
        </x-form>
      </div>

      <div class="create-subordinate__submit _submit-button_9exyk_113">
        <x-button type="primary" block @click="handleCreate">
          创建直属下级
        </x-button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
.create-subordinate {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--skin__bg_1);
}

.create-subordinate__type {
  flex-shrink: 0;

  :deep(.x-tabs__wrap) {
    min-height: 0;
    overflow: visible;
  }

  :deep(.x-tabs__nav) {
    min-height: 25px;
    border: 0;
    border-radius: 0;
  }

  :deep(.x-tab) {
    flex: none;
    min-width: 65px;
    min-height: 25px;
    margin-right: 10px;
    padding: 0 10px;
    color: var(--skin__neutral_1);
    font-size: 11px;
    font-weight: 400;
    text-align: center;
    background: var(--skin__text_bg_2);
    border: var(--lobby__px) solid var(--skin__border);
    border-radius: 12.5px;
  }

  :deep(.x-tab:first-child) {
    margin-left: 10px;
  }

  :deep(.x-tab--active) {
    color: var(--skin__text_primary);
    background: var(--skin__primary);
    border-color: var(--skin__primary);
  }

  :deep(.x-tabs__content) {
    display: none;
  }
}

.create-subordinate__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.create-subordinate__scroll {
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.create-subordinate__form-item {
  margin-bottom: 10px;
}

.create-subordinate__password-item {
  margin-bottom: 6px;
}

.create-subordinate__label {
  display: flex;
  align-items: center;
  min-height: 20px;
  margin-bottom: 5px;
  color: var(--skin__neutral_1);
  font-size: 12px;
  line-height: 1.2;
}

.create-subordinate__required {
  margin-right: 2px;
  color: var(--skin__accent_2);
}

.create-subordinate__form {
  :deep(.x-input) {
    height: 35px;
    color: var(--skin__lead);
    background: var(--skin__text_bg_2);
    border-color: var(--skin__border);
    border-radius: 5px;
  }

  :deep(.x-input:focus-within) {
    border-color: var(--skin__primary);
  }

  :deep(.x-input__input) {
    color: var(--skin__lead);
    font-size: 12px;
  }

  :deep(.x-input__input::placeholder) {
    color: var(--skin__neutral_2);
  }

  :deep(.x-input__prefix),
  :deep(.x-input__suffix) {
    color: var(--skin__neutral_2);
    font-size: 17px;
  }

  :deep(.x-form-item__explain) {
    margin-top: 4px;
    color: var(--skin__accent_2);
    font-size: 11px;
  }

  :deep(.password-power) {
    height: 15px;
    margin: 0;
    color: var(--skin__neutral_1);
    font-size: 11px;
  }

  :deep(.password-power .colorLump) {
    width: 40px;
    height: 6px;
    margin-right: 5px;
    border-radius: 6px;
  }
}

.create-subordinate__submit {
  flex-shrink: 0;
}

.create-subordinate__submit :deep(.x-button) {
  height: 35px;
  font-size: 12px;
  border-radius: 5px;
}

[dir="rtl"] .create-subordinate__type :deep(.x-tab) {
  margin-right: 0;
  margin-left: 10px;
}

[dir="rtl"] .create-subordinate__type :deep(.x-tab:first-child) {
  margin-right: 10px;
  margin-left: 0;
}

[dir="rtl"] .create-subordinate__required {
  margin-right: 0;
  margin-left: 2px;
}
</style>
