<script setup lang="ts">
interface SummaryItem {
  label: string;
  value: number;
  color: "success" | "danger" | "warn";
}

defineProps<{
  items: SummaryItem[];
}>();

function formatMoney(value: number) {
  return value.toFixed(2);
}
</script>

<template>
  <footer class="summary-bar">
    <div v-for="item in items" :key="item.label" class="summary-bar__item">
      <div class="summary-bar__label">{{ item.label }}</div>
      <div class="summary-bar__value" :class="`summary-bar__value--${item.color}`">
        ￥{{ formatMoney(item.value) }}
      </div>
    </div>
  </footer>
</template>

<style scoped lang="less">
.summary-bar {
  background-color: var(--skin__bg_2);
  border-top: thin solid var(--skin__border);
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  align-content: space-evenly;
  width: var(--lobby__max-width);
  height: 60px;
  padding: 2.5px 10px 5px;
  font-size: 11px;
  color: var(--skin__neutral_2);

  .summary-bar__item {
    display: flex;
    align-items: baseline;
    width: 50%;
    margin: 0;
  }

  .summary-bar__label {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 50%;
    margin: 0;
    overflow-wrap: break-word;
    &:last-child {
      padding-left: 2.5px;
      padding-right: 10px;
    }
  }

  .summary-bar__value {
    &.summary-bar__value--success {
      color: #1fb72b;
    }

    &.summary-bar__value--danger {
      color: #ff4d6d;
    }

    &.summary-bar__value--warn {
      color: #f3a14c;
    }
  }
}
</style>
