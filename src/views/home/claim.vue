<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SubNavbar from "@/components/SubNavbar.vue";
import UiEmpty from "@/components/UI/empty.vue";
import ClaimRuleText from "./claim/ClaimRuleText.vue";

type ClaimTab = 0 | 1 | 2;

const route = useRoute();
const router = useRouter();
const activeTab = ref<ClaimTab>(normalizeActiveTab(route.query.active));
const isRead = ref(false);

function normalizeActiveTab(value: unknown): ClaimTab {
  const activeValue = Array.isArray(value) ? value[0] : value;
  const numericValue = Number(activeValue);
  return numericValue === 1 || numericValue === 2 ? numericValue : 0;
}

function updateActiveTab(value: number | string) {
  activeTab.value = normalizeActiveTab(value);
}

function handleApply() {
  if (!isRead.value) {
    return;
  }

  router.push("/home/apply-claim");
}

watch(activeTab, value => {
  router.replace({ query: { ...route.query, active: String(value) } });
});

onMounted(() => {
  activeTab.value = normalizeActiveTab(route.query.active);
});
</script>

<template>
  <div class="claim-page">
    <SubNavbar title="担保与理赔" />

    <section class="claim-content">
      <van-tabs
        :active="activeTab"
        class="claim-tabs"
        shrink
        animated
        :swipeable="false"
        :duration="0.3"
        @update:active="updateActiveTab"
      >
        <van-tab :name="0" title="理赔申请">
          <div class="pre-application">
            <div class="rule-content">
              <div class="rule-rich-text">
                <p class="rule-title">全方位保障服务规则</p>
                <p>
                  <strong>1. 担保规则</strong><br />
                  <strong>（1）保障说明：</strong>本网站由第三方担保机构“NO钱包”进行<strong>全方位保障</strong>，已向NO钱包缴纳30,000,000.00 USDT（等值美元）保证金；<strong>网址是理赔的唯一依据！</strong>使用前请先验证网址的真实性，未来才能放心地使用或发起理赔；<strong>验证网址只能到NO钱包的官网 <a href="http://www.no.com/" target="_blank" rel="noreferrer">no.com</a> 上查验。</strong><br />
                  <strong>（2）请勿随意发起申请：</strong>理赔是最后一道保障措施，若您遇到纠纷时请先与平台客服协商解决，协商无果后才能申请理赔。<br />
                  <strong>（3）恶意申请处罚规则：</strong>若非正当理由或不符合条件，但仍恶意发起申请的，请自行主动操作取消，否则理赔失败将被视为恶意申请，首次失败将暂停理赔功能7天，连续两次失败将被永久禁用理赔功能。<br /><br />
                  <strong>2. 支持的理赔类型：</strong>全方位保障支持以下六种情形的理赔类型。<br />
                  <strong>（1）被判定违规，申请退还本金理赔：</strong>若您唯一的个人账号内有资产余额，且已完成投注任务，只要该账号累计充值大于累计提现（即充提差额＞0），无论是否盈利，被平台判定为非专业性的违规行为（含账号被冻结或被列入黑名单，提现被拒绝或提现不被受理等情形），则您才可以申请退还本金的理赔（即索赔充提差额部分）；<strong>若被风控系统识别为“一机多号、团伙性套利、恶意代码或专业刷客”等专业性违规，则该账号的理赔将不被受理。</strong>要求理赔金额≤充提差额且≤当前余额，且近30天有提现被拒绝或被强制取消记录、存在人工扣款记录、账号被冻结或列入黑名单、被禁止进入游戏、被禁止提现等其中的任意一项才能发起申请。理赔提交后将从该账户当前余额扣除相应的理赔金额，申请理赔成功后，将收取理赔金额0-25%的手续费作为第三方支付和第三方游戏成本。<br />
                  <strong>举例说明：</strong>假设A会员累计充值1000，已经累计提现300（充提差额=1000-300=700），若A当前账户余额500，则A可以申请理赔500，理赔成功后实际到账为500-500*15%=425；若A当前账户余额1500，则A最多只能申请理赔700，理赔成功后实际到账为700-700*15%=595。<br />
                  <strong>（2）虚假人工出款理赔：</strong>若您在近30天内提现记录中，有超过72小时未到账或被人工标记为强制出款的订单，且当前账号没有投注任务要求（即已完成所有投注任务），能证明当前的收款资料准确无误；您应先与平台客服友好协商，协商后仍被拒绝的才能提交理赔申请，且申请的理赔金额小于等于该笔提现金额。理赔成功后，账号正常使用；若理赔失败，判定为恶意理赔，首次暂停理赔功能7天，连续两次则永久暂停理赔功能。<br />
                  <strong>（3）被人工异常扣款理赔：</strong>若您在近30天内存在被人工异常扣款，且该账号未触发风控行为，您应先与平台客服友好协商，协商后仍被拒绝的才能申请此类型的理赔。理赔时必须选择关联人工扣款记录，要求理赔金额只能等于该笔人工扣款金额。<br />
                  <strong>（4）大额提现被拒理赔（仅限高级保障及全方位保障商户）：</strong>若您在近30天内存在提现被拒绝或强制取消，且该账号未触发风控行为，并且当前无投注任务、充值任务和提现任务，您应先与平台客服友好协商，协商后仍被拒绝的才能申请此类型的理赔。理赔时必须选择关联被拒绝的提现订单，要求理赔金额只能等于该笔提现订单的金额。<br />
                  <strong>（5）账号资金被盗理赔（仅限全方位保障商户，且不支持数字货币和三方电子钱包出款）：</strong>若您账号已经同时设置提现密码、开启提现两步验证（即绑定手机、邮箱或Google验证器）和绑定真实姓名，在近30天内存在非本人实名的提现订单，被判定为资金被盗情形的，您应先与平台客服友好协商，协商后仍被拒绝的才能申请此类型的理赔。理赔时必须选择关联非本人实名的提现订单，要求理赔金额只能等于该笔提现订单的金额。<br />
                  <strong>（6）网站永久性关闭退还本金理赔（仅限全方位保障商户）：</strong>若该网站因经营不善或主动申请永久性关闭，则该网站应当主动退还所有用户的本金；若该网站已经关闭，则您可以在网站关闭后的30天内到NO钱包官网申请此类型的理赔，要求理赔金额≤充提差额且≤当前余额，逾期不受理。<br /><br />
                  <strong>3. 理赔入口和有效期</strong><br />
                  <strong>（1）网站运营中：</strong>网站正常运营时，通过【我的】&gt;【第三方担保与理赔】入口申请，仅受理近30天内纠纷。<br />
                  <strong>（2）网站已关闭：</strong>网站永久关闭后，方可前往NO钱包官网（<a href="http://www.no.com/" target="_blank" rel="noreferrer">no.com</a>）申请理赔。<br />
                  <strong>（3）30天有效期：</strong>纠纷发生后的30天内，逾期不受理；且担保生效前的纠纷也在受理范围。<br /><br />
                  <strong>4. 理赔流程</strong><br />
                  <strong>（1）前提条件：</strong>发生纠纷时，您应先与平台客服友好协商，协商后仍被拒绝的，才能提交理赔申请，否则可能被判定为恶意理赔。<br />
                  <strong>（2）申请流程：</strong>用户提交申请后，由NO钱包理赔团队审查是否受理，因为理赔审核需要大量工作，所以一般需要1-15个工作日才能完成判定，实际时长将根据订单情况决定，期间您需积极配合提交申诉材料。<br /><br />
                  <strong>5. 验证方式</strong><br />
                  <strong>（1）如何验证：</strong><strong>因为“网址是唯一的理赔依据”</strong>，所以充值前可以先到NO钱包官网（<a href="http://www.no.com/" target="_blank" rel="noreferrer">no.com</a> 或 <a href="http://www.no.com/" target="_blank" rel="noreferrer">www.no.com</a>）查询当前网址是否在担保范围内。<br />
                  <strong>（2）验证步骤：</strong>请务必手动输入NO钱包官网 <a href="http://www.no.com/" target="_blank" rel="noreferrer">no.com</a>，然后复制当前平台完整网址进行查验；请勿相信或点击可疑链接，以免遇到假的NO钱包。
                </p>
              </div>
            </div>

            <div class="application-bar">
              <label class="read-agreement">
                <input v-model="isRead" type="checkbox" />
                <span class="checkbox-icon"><svg-icon v-if="isRead" name="comm_icon_gou" /></span>
                <span>已阅读并同意 <button type="button" @click="updateActiveTab(2)">《理赔规则》</button>，且不存在恶意申请。</span>
              </label>
              <x-button type="primary" size="normal" @click="handleApply">申请理赔</x-button>
            </div>
          </div>
        </van-tab>

        <van-tab :name="1" title="理赔订单">
          <div class="order-list">
            <UiEmpty text="暂无内容" />
          </div>
        </van-tab>

        <van-tab :name="2" title="担保与理赔规则">
          <div class="rule-box">
            <ClaimRuleText />
          </div>
        </van-tab>
      </van-tabs>
    </section>
  </div>
</template>

<style scoped lang="less">
.claim-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--skin__bg_1);
  color: var(--skin__lead);
}

.claim-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.claim-tabs {
  height: 100%;
  --van-tabs-line-height: 36px;
  --van-tab-text-color: var(--skin__lead);
  --van-tab-active-text-color: var(--skin__primary);
  --van-tabs-bottom-bar-color: var(--skin__primary);
  --van-tabs-bottom-bar-height: 1px;
  --van-tabs-bottom-bar-width: 24px;
  --van-tab-font-size: 12px;
  --van-tabs-nav-background: var(--skin__bg_2);
  --van-padding-xs: 0;
  --van-padding-sm: 0;

  :deep(.van-tabs__wrap) {
    height: 36px;
    margin-bottom: 7px;
    padding: 0 10px;
    border-bottom: 1px solid var(--skin__border);
  }

  :deep(.van-tabs__nav) {
    background: var(--skin__bg_2);
  }

  :deep(.van-tab) {
    flex: none;
    margin-right: 30px;
    padding: 0;
  }

  :deep(.van-tab:last-child) {
    margin-right: 0;
  }

  :deep(.van-tabs__content) {
    height: calc(100% - 43px);
    overflow: hidden;
  }

  :deep(.van-tabs__track) {
    height: 100%;
    will-change: transform;
    backface-visibility: hidden;
  }

  :deep(.van-tab__panel-wrapper),
  :deep(.van-tab__panel-wrapper--inactive) {
    height: 100%;
    overflow: hidden;
  }

  :deep(.van-tab__panel) {
    height: 100%;
    overflow: hidden;
    backface-visibility: hidden;
  }
}

.pre-application {
  position: relative;
  height: 100%;
}

.rule-content {
  height: calc(100% - 104px);
  overflow-y: auto;
  padding: 0 10px 12px;
  scrollbar-color: var(--skin__border) transparent;
  scrollbar-width: thin;
}

.rule-rich-text {
  padding-top: 8px;
  font-size: 13px;
  line-height: 1.6;

  p {
    margin: 0;
    color: var(--skin__neutral_1) !important;
    background: transparent !important;
  }

  .rule-title,
  strong {
    color: var(--skin__lead) !important;
  }

  .rule-title {
    text-align: center;
    margin-bottom: 8px;
    font-weight: 700;
  }

  a {
    color: var(--skin__primary) !important;
  }
}

.application-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 10px 12px;
  background: var(--skin__bg_2);
  box-shadow: 0 -3px 10px var(--skin__bg_1);
}

.read-agreement {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  color: var(--skin__lead);
  font-size: 11px;
  line-height: 1.45;

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .checkbox-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    border: 1px solid var(--skin__neutral_2);
    border-radius: 3px;
    color: var(--skin__bg_2);
  }

  input:checked + .checkbox-icon {
    border-color: var(--skin__primary);
    background: var(--skin__primary);
  }

  button {
    padding: 0;
    border: 0;
    color: var(--skin__primary);
    background: transparent;
    font-size: inherit;
  }
}

.application-bar :deep(.x-button) {
  width: 100%;
  height: 40px;
  margin-top: 10px;
  font-size: 12px;
}

.order-list {
  height: 100%;
  padding: 10px;
}

.rule-box {
  height: 100%;
  overflow-y: auto;
  padding: 0 10px;
  scrollbar-color: var(--skin__border) transparent;
  scrollbar-width: thin;
}
</style>
