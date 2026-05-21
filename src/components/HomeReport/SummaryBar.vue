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
        {{ formatMoney(item.value) }}USDT
      </div>
    </div>
  </footer>
</template>

<style scoped lang="less">
.summary-bar {
  height: 58px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid #ececf1;
  box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.04);
  flex-shrink: 0;

  .summary-bar__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }

  .summary-bar__label {
    color: #8d93a3;
    font-size: 12px;
    line-height: 1;
  }

  .summary-bar__value {
    font-size: 13px;
    font-weight: 700;
    line-height: 1;

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
