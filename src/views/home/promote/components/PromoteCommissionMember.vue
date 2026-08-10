<script setup lang="ts">
type MemberLevel = "B" | "C" | "D";

withDefaults(
  defineProps<{
    connectorId: string;
    avatarConnectorId?: string;
    name: string;
    level: MemberLevel;
    avatar: string;
    netProfit: string;
    formula: string;
    commission: string;
    recipient?: string;
  }>(),
  {
    recipient: "A"
  }
);
</script>

<template>
  <article
    class="commission-member"
    :class="`commission-member--${level.toLowerCase()}`"
  >
    <x-badge
      :content="name"
      position="bottom-right"
      bg-color="var(--member-color)"
      class="commission-member__avatar-badge"
    >
      <span
        class="commission-member__avatar"
        :data-connector-id="avatarConnectorId || undefined"
      >
        <img :src="avatar" :alt="`${name}代理头像`" loading="lazy" />
      </span>
    </x-badge>

    <div class="commission-member__content" :data-connector-id="connectorId">
      <p>净盈利 {{ netProfit }}</p>
      <p>
        <span>给{{ recipient }}佣金</span>
        <span>{{ formula }}=<em>{{ commission }}</em></span>
      </p>
    </div>
  </article>
</template>

<style scoped lang="less">
.commission-member {
  --member-color: var(--skin__accent_3);
  --member-background: rgba(var(--skin__tg_accent_3__toRgbString), 0.9);

  position: relative;
  flex: 1;
  max-width: 152.5px;
  padding-top: 20px;
  color: var(--skin__neutral_1);
  text-align: center;
}

.commission-member--c {
  --member-color: var(--skin__primary);
  --member-background: rgba(var(--skin__tg_primary__toRgbString), 0.9);
}

.commission-member--d {
  --member-color: var(--skin__accent_1);
  --member-background: rgba(var(--skin__tg_accent_1__toRgbString), 0.9);
}

.commission-member__avatar-badge {
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);

  :deep(.x-badge) {
    right: -2px;
    bottom: 0;
    min-width: 17px;
    height: 14px;
    padding: 0 3px;
    border: var(--lobby__px, 0.5px) solid var(--skin__bg_2);
    border-radius: 50%;
    font-size: 8px;
    line-height: 13px;
    transform: none;
  }

  :deep(.x-badge::before) {
    display: none;
  }
}

.commission-member__avatar {
  display: block;
  width: 40px;
  height: 40px;
  padding: 1.5px;
  border: 1.5px solid var(--member-color);
  border-radius: 50%;
  background: var(--skin__bg_2);

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.commission-member__content {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 60px;
  padding: 27.5px 5px 10px;
  border-radius: 8px;
  background-color: var(--member-background);
  font-size: 9px;
  line-height: 1.55;

  p {
    margin: 0;
  }

  p:first-child {
    color: #333;
    font-family: "Microsoft YaHei Lobby Bold", "Microsoft YaHei", sans-serif;
    font-weight: 600;
    line-height: normal;
  }

  p:last-child {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    width: fit-content;
    color: #666;
    font-family: "Microsoft YaHei Lobby", "Microsoft YaHei", sans-serif;
    font-weight: 400;
    line-height: normal;
  }

  p + p {
    margin-top: 3px;
  }

  p:last-child span:first-child {
    margin-right: 0.5px;
  }

  em {
    color: var(--skin__accent_3);
    font-style: normal;
  }
}

[dir="rtl"] .commission-member__content p:last-child span:first-child {
  margin-right: 0;
  margin-left: 0.5px;
}
</style>
