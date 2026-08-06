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
  max-width: 3.05rem;
  padding-top: 0.4rem;
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
    right: -0.04rem;
    bottom: 0;
    min-width: 0.34rem;
    height: 0.28rem;
    padding: 0 0.06rem;
    border: var(--lobby__px, 0.01rem) solid var(--skin__bg_2);
    border-radius: 50%;
    font-size: 0.16rem;
    line-height: 0.26rem;
    transform: none;
  }

  :deep(.x-badge::before) {
    display: none;
  }
}

.commission-member__avatar {
  display: block;
  width: 0.8rem;
  height: 0.8rem;
  padding: 0.03rem;
  border: 0.03rem solid var(--member-color);
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
  min-height: 1.2rem;
  padding: 0.55rem 0.1rem 0.2rem;
  border-radius: 0.16rem;
  background-color: var(--member-background);
  font-size: 0.18rem;
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
    margin-top: 0.06rem;
  }

  p:last-child span:first-child {
    margin-right: 0.01rem;
  }

  em {
    color: var(--skin__accent_3);
    font-style: normal;
  }
}

[dir="rtl"] .commission-member__content p:last-child span:first-child {
  margin-right: 0;
  margin-left: 0.01rem;
}
</style>
