<script setup lang="ts">
import dayjs from "dayjs";
import { computed, ref, watch } from "vue";
import { getPromoteSubordinates, type SpecialInviteData } from "@/api/common";
import Copy from "@/components/Common/Copy.vue";
import UiLoading from "@/components/UI/loading.vue";
import PromoteMemberDetailDialog from "@/views/home/promote/components/PromoteMemberDetailDialog.vue";
import type { PromoteSubordinate } from "@/views/home/promote/types";

type ValidityFilter = "" | "valid" | "invalid";

interface InviteMember extends PromoteSubordinate {
  isValid?: boolean | number;
  isPass?: boolean | number;
  rechargeDays?: number;
}

interface Props {
  show?: boolean;
  config: SpecialInviteData["config"];
}

const props = withDefaults(defineProps<Props>(), {
  show: false
});

const emit = defineEmits<{
  (event: "update:show", value: boolean): void;
}>();

const PAGE_SIZE = 100;
const validityOptions = [
  { label: "是否有效", value: "" },
  { label: "是", value: "valid" },
  { label: "否", value: "invalid" }
];

const validityFilter = ref<ValidityFilter>("");
const memberId = ref<string | number>("");
const members = ref<InviteMember[]>([]);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const requestFailed = ref(false);
const detailVisible = ref(false);
const selectedUserIdx = ref(0);
let latestRequestId = 0;

const filteredMembers = computed(() => {
  if (!validityFilter.value) return members.value;
  const expectedValidity = validityFilter.value === "valid";
  return members.value.filter(member => isMemberValid(member) === expectedValidity);
});

function normalizeBoolean(value: unknown) {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return null;
}

function isMemberValid(member: InviteMember) {
  const serverValidity = normalizeBoolean(member.isValid ?? member.isPass);
  if (serverValidity !== null) return serverValidity;

  const rechargeAmountReached = Number(member.deposit || 0) >= Number(props.config.rechargeAmount || 0);
  const validBetReached = Number(member.validBet || 0) >= Number(props.config.validBetAmount || 0);
  const rechargeDays = Number(member.rechargeDays);
  const rechargeDaysReached = Number.isFinite(rechargeDays)
    ? rechargeDays >= Number(props.config.rechargeDays || 0)
    : true;
  return rechargeAmountReached && validBetReached && rechargeDaysReached;
}

function formatRegisterTime(timestamp: number) {
  if (!timestamp) return "-";
  return dayjs(timestamp * 1000).format("YYYY/MM/DD");
}

function createQueryParams() {
  const normalizedMemberId = String(memberId.value || "").trim().replace(/\D/g, "");
  const startTime = props.config.startDate
    ? dayjs(props.config.startDate).startOf("day").unix()
    : undefined;
  const endTime = props.config.endDate
    ? dayjs(props.config.endDate).endOf("day").unix()
    : undefined;

  return {
    page: page.value,
    size: PAGE_SIZE,
    sortField: "lastLoginTime",
    sortOrder: 2,
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    ...(normalizedMemberId ? { userIdx: Number(normalizedMemberId) } : {})
  };
}

async function loadMembers(reset = false) {
  if (loading.value) return;

  if (reset) {
    page.value = 1;
    members.value = [];
    finished.value = false;
    requestFailed.value = false;
  }

  const requestId = ++latestRequestId;
  loading.value = true;
  try {
    const response = await getPromoteSubordinates(createQueryParams());
    if (requestId !== latestRequestId) return;

    const source = response?.data ?? response ?? {};
    const currentMembers = Array.isArray(source.list) ? source.list as InviteMember[] : [];
    const directMembers = currentMembers.filter(member => Number(member.direct) === 1);
    members.value = reset ? directMembers : [...members.value, ...directMembers];
    requestFailed.value = false;
    finished.value = !Boolean(source.more);
    if (!finished.value) page.value += 1;
  } catch {
    if (requestId !== latestRequestId) return;
    requestFailed.value = true;
    finished.value = true;
  } finally {
    if (requestId === latestRequestId) loading.value = false;
  }
}

async function loadUntilVisible() {
  if (loading.value) return;
  while (
    props.show
    && !finished.value
    && !requestFailed.value
    && filteredMembers.value.length === 0
  ) {
    await loadMembers(false);
  }
}

async function handleSearch() {
  memberId.value = String(memberId.value || "").trim().replace(/\D/g, "");
  await loadMembers(true);
  await loadUntilVisible();
}

async function handleRetry() {
  finished.value = false;
  await loadMembers(members.value.length === 0);
  await loadUntilVisible();
}

function openMemberDetail(userIdx: number) {
  selectedUserIdx.value = userIdx;
  detailVisible.value = true;
}

function closeDialog() {
  emit("update:show", false);
}

watch(
  () => props.show,
  async show => {
    if (!show) return;
    await loadMembers(true);
    await loadUntilVisible();
  }
);

watch(validityFilter, () => {
  void loadUntilVisible();
});
</script>

<template>
  <van-dialog
    :show="show"
    :title="$t('我的推广')"
    :width="355"
    :z-index="2006"
    :show-confirm-button="false"
    :show-cancel-button="false"
    close-on-click-overlay
    destroy-on-close
    class-name="special-invite-member-dialog"
    teleport="body"
    @update:show="emit('update:show', $event)"
  >
    <div class="invite-member-dialog__content">
      <div class="invite-member-dialog__filters">
        <span class="invite-member-dialog__select">
          <x-select
            v-model="validityFilter"
            :options="validityOptions"
            value-key="value"
            label-key="label"
            :placeholder="$t('是否有效')"
            placement="bottom"
          />
        </span>
        <x-input
          v-model="memberId"
          class="invite-member-dialog__search"
          type="number"
          size="mini"
          :maxlength="16"
          :placeholder="$t('会员ID')"
          @keydown.enter.prevent="handleSearch"
        >
          <template #suffix>
            <button type="button" class="invite-member-dialog__search-button" :aria-label="$t('搜索会员')" @click.stop="handleSearch">
              <svg-icon name="comm_icon_ss" class-name="invite-member-dialog__search-icon" />
            </button>
          </template>
        </x-input>
      </div>

      <div class="invite-member-dialog__list">
        <div v-if="loading && !members.length" class="invite-member-dialog__state">
          <ui-loading />
        </div>
        <div v-else-if="!filteredMembers.length && finished" class="invite-member-dialog__state">
          <span>{{ requestFailed ? "加载失败，请重试" : "暂无内容" }}</span>
          <button v-if="requestFailed" type="button" class="invite-member-dialog__retry" @click="handleRetry">重新加载</button>
        </div>
        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          :immediate-check="false"
          @load="loadMembers(false)"
        >
          <article v-for="member in filteredMembers" :key="member.userIdx" class="invite-member-dialog__item">
            <div class="invite-member-dialog__item-left">
              <div class="invite-member-dialog__account-row">
                <span class="invite-member-dialog__account">{{ member.userIdx }}</span>
                <copy class="invite-member-dialog__copy" :text="String(member.userIdx)" />
                <span class="invite-member-dialog__validity-label">是否有效</span>
                <span
                  class="invite-member-dialog__validity"
                  :class="isMemberValid(member) ? 'invite-member-dialog__validity--yes' : 'invite-member-dialog__validity--no'"
                >{{ isMemberValid(member) ? "是" : "否" }}</span>
              </div>
              <div class="invite-member-dialog__register-time">
                <span>注册时间：</span>
                <span>{{ formatRegisterTime(member.regTime) }}</span>
              </div>
            </div>
            <button type="button" class="invite-member-dialog__detail" @click="openMemberDetail(member.userIdx)">
              <span>{{ $t("详情") }}</span>
              <svg-icon name="img_scroll_jt" class-name="invite-member-dialog__detail-icon" />
            </button>
          </article>

          <div v-if="requestFailed && members.length" class="invite-member-dialog__load-error" @click="handleRetry">
            {{ $t("加载失败，点击重试") }}
          </div>
        </van-list>
      </div>
    </div>

    <template #footer>
      <div class="invite-member-dialog__footer">
        <button type="button" class="invite-member-dialog__close" :aria-label="$t('关闭')" @click="closeDialog">
          <svg-icon name="close" class-name="invite-member-dialog__close-icon" />
        </button>
      </div>
    </template>
  </van-dialog>

  <promote-member-detail-dialog
    v-model:show="detailVisible"
    :user-idx="selectedUserIdx"
    :z-index="2010"
  />
</template>

<style scoped lang="less">
.invite-member-dialog__content {
  box-sizing: border-box;
  padding: 0 10px 10px;
  color: var(--skin__lead);
}

.invite-member-dialog__filters {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.invite-member-dialog__select,
.invite-member-dialog__search {
  width: calc(50% - 5px);
  min-width: 0;
}

:deep(.invite-member-dialog__select .x-select) {
  height: 25px;
  border-radius: 25px;
  font-size: 10px;
}

:deep(.invite-member-dialog__select .x-select__label),
:deep(.invite-member-dialog__select .x-select__placeholder) {
  color: var(--skin__lead);
  font-size: 10px;
}

:deep(.invite-member-dialog__search.x-input-wrapper) {
  height: 25px;
  border-color: var(--skin__border);
  border-radius: 25px;
  background: var(--skin__bg_2);
}

:deep(.invite-member-dialog__search .x-input__field) {
  color: var(--skin__lead);
  font-size: 10px;
}

.invite-member-dialog__search-button {
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--skin__neutral_2);
  cursor: pointer;
}

:deep(.invite-member-dialog__search-icon) {
  width: 14px;
  height: 14px;
}

.invite-member-dialog__list {
  min-height: 61px;
  max-height: min(390px, calc(100vh - 190px));
  overflow-y: auto;
}

.invite-member-dialog__state {
  display: flex;
  min-height: 120px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--skin__neutral_2);
  font-size: 11px;
}

.invite-member-dialog__retry {
  padding: 5px 10px;
  border: var(--lobby__px) solid var(--skin__primary);
  border-radius: 5px;
  background: transparent;
  color: var(--skin__primary);
}

.invite-member-dialog__item {
  display: flex;
  min-height: 61px;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: var(--lobby__px) solid var(--skin__border);
  color: var(--skin__lead);
  font-size: 10px;
}

.invite-member-dialog__item-left {
  min-width: 0;
  flex: 1;
}

.invite-member-dialog__account-row,
.invite-member-dialog__register-time {
  display: flex;
  min-width: 0;
  align-items: center;
}

.invite-member-dialog__account-row {
  margin-bottom: 10px;
}

.invite-member-dialog__account {
  overflow: hidden;
  color: var(--skin__lead);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invite-member-dialog__copy {
  flex: none;
  margin: 0 15px 0 7.5px;
  font-size: 14px;
}

.invite-member-dialog__validity-label {
  flex: none;
  margin-right: 5px;
  color: var(--skin__neutral_2);
}

.invite-member-dialog__validity {
  flex: none;
}

.invite-member-dialog__validity--yes {
  color: var(--skin__accent_1);
}

.invite-member-dialog__validity--no {
  color: var(--skin__accent_2);
}

.invite-member-dialog__register-time {
  color: var(--skin__neutral_2);
}

.invite-member-dialog__detail {
  display: flex;
  height: 36px;
  flex: none;
  align-items: center;
  padding: 0 0 0 15px;
  border: 0;
  background: transparent;
  color: var(--skin__primary);
  font-size: 10px;
  cursor: pointer;
  gap: 7.5px;
}

:deep(.invite-member-dialog__detail-icon) {
  width: 6.5px;
  height: 11.5px;
  color: var(--skin__neutral_3);
}

.invite-member-dialog__load-error {
  padding: 10px;
  color: var(--skin__accent_2);
  font-size: 11px;
  text-align: center;
  cursor: pointer;
}

.invite-member-dialog__footer {
  position: relative;
  display: flex;
  width: 100%;
  height: 45px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
}

.invite-member-dialog__close {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

:deep(.invite-member-dialog__close-icon) {
  width: 29px;
  height: 29px;
}

:global(.special-invite-member-dialog) {
  max-width: calc(100vw - 16px);
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

:global(.special-invite-member-dialog .van-dialog__header) {
  padding: 10px 10px 15px;
  border: var(--lobby__px) solid var(--skin__border);
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
  background: var(--skin__bg_2);
  color: var(--skin__lead);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
}

:global(.special-invite-member-dialog .van-dialog__content) {
  border: var(--lobby__px) solid var(--skin__border);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  background: var(--skin__bg_2);
}

:global(.special-invite-member-dialog .van-dialog__footer) {
  overflow: visible;
  background: transparent;
}

[dir="rtl"] .invite-member-dialog__copy {
  margin-right: 7.5px;
  margin-left: 15px;
}

[dir="rtl"] .invite-member-dialog__validity-label {
  margin-right: 0;
  margin-left: 5px;
}

[dir="rtl"] .invite-member-dialog__detail {
  padding-right: 15px;
  padding-left: 0;
}

[dir="rtl"] :deep(.invite-member-dialog__detail-icon) {
  transform: scaleX(-1);
}
</style>
