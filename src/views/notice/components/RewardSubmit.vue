<script setup lang="ts">
import { reactive, ref } from "vue";
import { service } from "@/api/service";
import { showCustomToast } from "@/hooks/useCommon";

const isLoading = ref(false);

type XFormExpose = {
  validate?: () => Promise<void>;
  clearValidate?: () => void;
};

const formRef = ref<XFormExpose | null>(null);

const formModel = reactive({
  questionType: "",
  content: "",
});

const questionTypeOptions = [
  { id: '游戏问题', label: "游戏问题" },
  { id: '登录注册', label: "登录注册" },
  { id: '活动问题', label: "活动问题" },
  { id: '代理问题', label: "代理问题" },
  { id: '充值问题', label: "充值问题" },
  { id: '提现问题', label: "提现问题" },
  { id: '优化建议', label: "优化建议" },
  { id: '其他建议', label: "其他建议" },
];

async function handleSubmit() {
  if (isLoading.value) return;

  try {
    await formRef.value?.validate?.();
  } catch {
    return;
  }

  isLoading.value = true;

  try {
    service.v1.notice.feedbackSubmit({ title: formModel.questionType, content: formModel.content }).then(res => {
      showCustomToast({ type: 'success', message: '提交成功' })
      formModel.questionType = ''
      formModel.content = ''
      formRef.value.clearValidate?.()
    })
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="reward-submit-container">
    <div class="flex-1">
      <div class="send-feedback">
        <x-form ref="formRef" :model="formModel">
          <label class="label">反馈类型 <span class="required">*</span></label>
          <x-form-item prop="questionType">
            <x-select
              v-model="formModel.questionType"
              :options="questionTypeOptions"
              placeholder="请选择反馈类型"
            />
          </x-form-item>

          <label class="label">反馈内容 <span class="required">*</span></label>
          <x-form-item prop="content">
            <x-input
              type="textarea"
              v-model="formModel.content"
              placeholder="您的任何意见对我们都很重要，凡是有价值意见都将被采纳，一旦采纳将视重要程度给予不同现金奖励，欢迎您畅所欲言！"
              clearable
              rows="6"
            />
          </x-form-item>

          <label class="label">奖励规则 <span class="required">*</span></label>
          <div class="content-text">我们已经设置巨额奖金，专门收集反馈意见，以便我们优化系统和功能，给您带来更好的体验！一旦被采纳，将根据重要程度给予奖励（未采纳除外）。</div>
        </x-form>
      </div>
    </div>

    <div class="footer-bottom">
      <x-button
        type="primary"
        size="normal"
        class="!w-[100%]"
        :loading="isLoading"
        @click="handleSubmit"
      >
        提交反馈
      </x-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.reward-submit-container {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;

  .footer-bottom {
    height: 65px;
    margin: 0 0px;
    padding: 10px 10px 20px;
    font-size: 12px;
    background-color: var(--skin__bg_2);
    box-shadow: 0 -1.5px 5px rgba(0, 0, 0, 0.1);
  }

  .send-feedback {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    background-color: var(--skin__bg_2);
    border-radius: 7px;
    margin-bottom: 5px;
    .label {
      display: inline-flex;
      margin-bottom: 10px;
      font-size: 12px;
      color: var(--skin__lead);
      .required {
        color: var(--skin__accent_2);
        display: inline-flex;
        height: 100%;
        align-items: center;
      }
    }
    .content-text {
      color: var(--skin__neutral_2);
      font-size: 12px;
      line-height: 1.56;
    }
  }
}
</style>
