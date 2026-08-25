<template>
  <div class="rule-rich-text">
    <p class="rule-title">{{ $t("全方位保障服务规则") }}</p>
    <p>
      <strong>{{ $t("1. 担保规则") }}</strong><br />
      <strong>{{ $t("（1）保障说明：") }}</strong>{{ $t("本网站由第三方担保机构“NO钱包”进行") }}<strong>{{ $t("全方位保障") }}</strong>{{ $t("，已向NO钱包缴纳30,000,000.00 USDT（等值美元）保证金；") }}<strong>{{ $t("网址是理赔的唯一依据！") }}</strong>{{ $t("使用前请先验证网址的真实性，未来才能放心地使用或发起理赔；") }}<strong>{{ $t("验证网址只能到NO钱包的官网") }} <a href="http://www.no.com/" target="_blank" rel="noreferrer">no.com</a> {{ $t("上查验。") }}</strong><br />
      <strong>{{ $t("（2）请勿随意发起申请：") }}</strong>{{ $t("理赔是最后一道保障措施，若您遇到纠纷时请先与平台客服协商解决，协商无果后才能申请理赔。") }}<br />
      <strong>{{ $t("（3）恶意申请处罚规则：") }}</strong>{{ $t("若非正当理由或不符合条件，但仍恶意发起申请的，请自行主动操作取消，否则理赔失败将被视为恶意申请，首次失败将暂停理赔功能7天，连续两次失败将被永久禁用理赔功能。") }}<br /><br />
      <strong>{{ $t("2. 支持的理赔类型：") }}</strong>{{ $t("全方位保障支持以下六种情形的理赔类型。") }}<br />
      <strong>{{ $t("（1）被判定违规，申请退还本金理赔：") }}</strong>{{ $t("若您唯一的个人账号内有资产余额，且已完成投注任务，只要该账号累计充值大于累计提现（即充提差额＞0），无论是否盈利，被平台判定为非专业性的违规行为，则您才可以申请退还本金的理赔；") }}<strong>{{ $t("若被风控系统识别为“一机多号、团伙性套利、恶意代码或专业刷客”等专业性违规，则该账号的理赔将不被受理。") }}</strong>{{ $t("要求理赔金额≤充提差额且≤当前余额，且近30天有相关纠纷记录才能发起申请。") }}<br />
      <strong>{{ $t("（2）虚假人工出款理赔：") }}</strong>{{ $t("若近30天内提现记录中有超过72小时未到账或被人工标记为强制出款的订单，且当前账号没有投注任务要求，能证明当前收款资料准确无误，并已与平台客服协商无果的，才可提交申请。") }}<br />
      <strong>{{ $t("（3）被人工异常扣款理赔：") }}</strong>{{ $t("若近30天内存在人工异常扣款，且账号未触发风控行为，协商无果后才能申请，理赔金额只能等于该笔人工扣款金额。") }}<br />
      <strong>{{ $t("（4）大额提现被拒理赔：") }}</strong>{{ $t("若近30天内存在提现被拒绝或强制取消，且当前无投注、充值和提现任务，协商无果后才能申请，理赔金额只能等于该笔提现订单金额。") }}<br />
      <strong>{{ $t("（5）账号资金被盗理赔：") }}</strong>{{ $t("需要设置提现密码、开启提现两步验证并绑定真实姓名，仅支持符合条件的法定货币提现订单。") }}<br />
      <strong>{{ $t("（6）网站永久性关闭退还本金理赔：") }}</strong>{{ $t("网站永久关闭后30天内可申请，要求理赔金额≤充提差额且≤当前余额，逾期不受理。") }}<br /><br />
      <strong>{{ $t("3. 理赔入口和有效期") }}</strong><br />
      <strong>{{ $t("（1）网站运营中：") }}</strong>通过【我的】&gt;【第三方担保与理赔】入口申请，仅受理近30天内纠纷。<br />
      <strong>{{ $t("（2）网站已关闭：") }}</strong>{{ $t("网站永久关闭后，方可前往NO钱包官网（") }}<a href="http://www.no.com/" target="_blank" rel="noreferrer">no.com</a>{{ $t("）申请理赔。") }}<br />
      <strong>{{ $t("（3）30天有效期：") }}</strong>{{ $t("纠纷发生后的30天内，逾期不受理；且担保生效前的纠纷也在受理范围。") }}<br /><br />
      <strong>{{ $t("4. 理赔流程") }}</strong><br />
      <strong>{{ $t("（1）前提条件：") }}</strong>{{ $t("发生纠纷时，应先与平台客服友好协商，协商后仍被拒绝的，才能提交理赔申请。") }}<br />
      <strong>{{ $t("（2）申请流程：") }}</strong>{{ $t("提交申请后由NO钱包理赔团队审查，通常需要1-15个工作日完成判定，期间需积极配合提交申诉材料。") }}<br /><br />
      <strong>{{ $t("5. 验证方式") }}</strong><br />
      <strong>{{ $t("（1）如何验证：") }}</strong>{{ $t("因为“网址是唯一的理赔依据”，充值前请到NO钱包官网（") }}<a href="http://www.no.com/" target="_blank" rel="noreferrer">no.com</a> {{ $t("或") }} <a href="http://www.no.com/" target="_blank" rel="noreferrer">www.no.com</a>{{ $t("）查询当前网址是否在担保范围内。") }}<br />
      <strong>{{ $t("（2）验证步骤：") }}</strong>{{ $t("请手动输入NO钱包官网 no.com，再复制当前平台完整网址进行查验；请勿相信或点击可疑链接。") }}
    </p>
  </div>
</template>

<style scoped lang="less">
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
    margin-bottom: 8px;
    text-align: center;
    font-weight: 700;
  }

  a {
    color: var(--skin__primary) !important;
  }
}
</style>
