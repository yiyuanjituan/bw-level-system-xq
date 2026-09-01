<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';
import { showCustomDialog, showCustomToast } from '@/hooks/useCommon';
import { bus } from '@/utils/mitt';
import router from '@/router';
import useAuthStore from '@/store/modules/user';

defineOptions({ name: 'MineGrid' });

interface MineGridItem {
  key: string;
  icon: string;
  activeIcon?: string;
  name: string;
  url?: string;
  iconMode?: 'normal' | 'claim';
  hiddenWhenLogout?: boolean;
  badge?: string;
}

const props = withDefaults(
  defineProps<{
    orderedKeys?: string[];
    showYuebao?: boolean;
    interestRateText?: string;
  }>(),
  {
    orderedKeys: () => [],
    showYuebao: false,
    interestRateText: ''
  }
);

const emit = defineEmits<{
  language: [];
}>();

const auth = useAuthStore();

const menuItems = computed<MineGridItem[]>(() => [
  {
    key: 'records',
    icon: 'template-one-style_7_icon_zdjl',
    activeIcon: 'template-one-style_7_icon_zdjl1',
    name: $t('我的记录'),
    url: '/home/report'
  },
  {
    key: 'balanceRecovery',
    icon: 'template-one-style_7_icon_zkq',
    activeIcon: 'template-one-style_7_icon_zkq1',
    name: $t('找回余额'),
    url: '/home/report?reportCurrent=4'
  },
  {
    key: 'accountDetails',
    icon: 'template-one-style_7_icon_zdjl',
    activeIcon: 'template-one-style_7_icon_zdjl1',
    name: $t('账户明细'),
    url: '/home/report?reportCurrent=3'
  },
  {
    key: 'betRecords',
    icon: 'template-one-style_7_icon_zdjl',
    activeIcon: 'template-one-style_7_icon_zdjl1',
    name: $t('投注记录'),
    url: '/home/report?reportCurrent=2'
  },
  {
    key: 'withdrawManage',
    icon: 'template-one-style_7_icon_txgl',
    activeIcon: 'template-one-style_7_icon_txgl1',
    name: $t('提现管理'),
    url: '/home/withdraw?active=10'
  },
  {
    key: 'personalReport',
    icon: 'template-one-style_7_icon_zdjl',
    activeIcon: 'template-one-style_7_icon_zdjl1',
    name: $t('个人报表'),
    url: '/home/report?reportCurrent=1'
  },
  {
    key: 'vip',
    icon: 'template-one-style_7_icon_vip',
    activeIcon: 'template-one-style_7_icon_vip1',
    name: $t('VIP中心'),
    url: '/home/vip'
  },
  {
    key: 'promote',
    icon: 'template-one-style_7_icon_fxzq',
    activeIcon: 'template-one-style_7_icon_fxzq1',
    name: $t('分享赚钱'),
    url: '/home/promote'
  },
  {
    key: 'claim',
    icon: 'comm_icon_dblp_1',
    activeIcon: 'comm_icon_dblp_2',
    iconMode: 'claim',
    name: $t('第三方平台担保'),
    url: '/home/claim'
  },
  {
    key: 'plazza',
    icon: 'template-one-style_7_icon_pyq',
    activeIcon: 'template-one-style_7_icon_pyq1',
    name: $t('发现'),
    url: '/home/plazza'
  },
  {
    key: 'profile',
    icon: 'template-one-style_7_icon_list_grzl',
    activeIcon: 'template-one-style_7_icon_list_grzl1',
    name: $t('个人资料'),
    url: '/home/setting'
  },
  {
    key: 'security',
    icon: 'template-one-style_7_icon_aqzx',
    name: $t('安全中心'),
    url: '/home/security'
  },
  {
    key: 'findUs',
    icon: 'template-one-style_7_icon_zdwm',
    activeIcon: 'template-one-style_7_icon_zdwm1',
    name: $t('找到我们')
  },
  // {
  //   key: 'language',
  //   icon: 'mine-template-two-list_xzyy',
  //   name: $t('选择语言')
  // },
  {
    key: 'faq',
    icon: 'template-one-style_7_icon_cjwt',
    activeIcon: 'template-one-style_7_icon_cjwt1',
    name: $t('常见问题'),
    url: '/home/notice?noticeType=4'
  },
  {
    key: 'feedback',
    icon: 'template-one-style_7_icon_yjfk',
    activeIcon: 'template-one-style_7_icon_yjfk1',
    name: $t('有奖反馈'),
    url: '/home/notice?noticeType=5'
  },
  {
    key: 'devices',
    icon: 'template-one-style_7_icon_dlsb',
    activeIcon: 'template-one-style_7_icon_dlsb1',
    name: $t('登录设备'),
    url: '/home/device'
  },
  {
    key: 'about',
    icon: 'template-one-style_7_icon_gywm',
    activeIcon: 'template-one-style_7_icon_gywm1',
    name: $t('关于我们'),
    url: '/home/about'
  },
  {
    key: 'logout',
    icon: 'template-one-style_7_icon_tc',
    activeIcon: 'template-one-style_7_icon_tc1',
    name: $t('安全退出'),
    hiddenWhenLogout: true
  }
]);

const displayList = computed<MineGridItem[]>(() => {
  const menuItemMap = new Map(menuItems.value.map(item => [item.key, item]));
  const orderedItems = props.orderedKeys.length
    ? props.orderedKeys.flatMap(key => {
        const menuItem = menuItemMap.get(key);
        return menuItem ? [menuItem] : [];
      })
    : menuItems.value;
  const visibleItems = orderedItems.filter(item => !item.hiddenWhenLogout || Boolean(auth.token));

  if (!props.showYuebao) return visibleItems;
  return [
    {
      key: 'yuebao',
      icon: 'template-one-style_7_icon_lxb',
      activeIcon: 'template-one-style_7_icon_lxb1',
      name: $t('利息宝'),
      url: '/home/yuebao',
      badge: props.interestRateText
    },
    ...visibleItems
  ];
});

function safeLogOut() {
  if (!auth.token) return;

  showCustomDialog({
    title: $t('温馨提示'),
    message: $t('是否退出当前账号?'),
    showCancelButton: true,
    confirmButtonText: $t('确认退出'),
    cancelButtonText: $t('我点错了'),
    width: 300
  }).then(result => {
    if (!result) return;

    auth.logout();
    showCustomToast({ type: 'success', message: $t('退出成功') });
    setTimeout(() => {
      void router.replace('/');
    }, 500);
  });
}

function handleSelect(menuItem: MineGridItem) {
  if (menuItem.key === 'logout') {
    safeLogOut();
    return;
  }
  if (menuItem.key === 'findUs') {
    bus.emit('findUs');
    return;
  }
  if (menuItem.key === 'language') {
    emit('language');
    return;
  }
  if (menuItem.url) {
    void router.push(menuItem.url);
  }
}
</script>

<template>
  <section v-if="displayList.length" class="mine-feature-card">
    <h2 class="mine-feature-card__title">{{ $t('快捷功能') }}</h2>
    <ul class="mine-feature-card__grid" dir="ltr">
      <li
        v-for="menuItem in displayList"
        :key="menuItem.key"
        class="mine-feature-card__item"
        role="button"
        tabindex="0"
        @click="handleSelect(menuItem)"
        @keydown.enter.space.prevent="handleSelect(menuItem)"
      >
        <span class="mine-feature-card__icon" :class="{ 'mine-feature-card__icon--claim': menuItem.iconMode === 'claim' }">
          <template v-if="menuItem.iconMode === 'claim'">
            <svg-icon :name="menuItem.icon" class="mine-feature-card__icon-layer mine-feature-card__claim-first" />
            <svg-icon :name="menuItem.activeIcon || ''" class="mine-feature-card__icon-layer mine-feature-card__claim-second" />
            <svg-icon name="comm_icon_gou" class="mine-feature-card__claim-check" />
          </template>
          <template v-else>
            <svg-icon :name="menuItem.icon" class="mine-feature-card__icon-layer mine-feature-card__icon-layer--base" />
            <svg-icon
              v-if="menuItem.activeIcon"
              :name="menuItem.activeIcon"
              class="mine-feature-card__icon-layer mine-feature-card__icon-layer--active"
            />
          </template>
          <span v-if="menuItem.badge" class="mine-feature-card__badge">{{ menuItem.badge }}</span>
        </span>
        <span class="mine-feature-card__label">{{ menuItem.name }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="less">
.mine-feature-card {
  margin: 10px 12.5px 0;
  padding: 10px;
  border-radius: 10px;
  background: var(--skin__bg_2);
  box-shadow: 0 1.5px 5px rgba(0, 0, 0, 0.06);
}

.mine-feature-card__title {
  margin: 0;
  color: var(--skin__lead);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.mine-feature-card__grid {
  margin: 0;
  padding: 10px 0 0;
  display: grid;
  grid-template-columns: repeat(4, 75px);
  justify-content: space-between;
  column-gap: 10px;
  row-gap: 15px;
  background: transparent;
  list-style: none;
}

.mine-feature-card__item {
  width: 75px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: var(--skin__neutral_1);
  text-align: center;
  cursor: pointer;
}

.mine-feature-card__icon {
  width: 24px;
  height: 24px;
  flex: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-feature-card__icon-layer {
  position: absolute;
  inset: 0;
  font-size: 24px;
}

.mine-feature-card__icon-layer--base {
  color: var(--skin__lead);
}

.mine-feature-card__icon-layer--active {
  color: var(--skin__primary);
}

.mine-feature-card__icon--claim {
  color: var(--skin__accent_1);
}

.mine-feature-card__claim-first {
  color: var(--skin__accent_1);
}

.mine-feature-card__claim-second {
  color: var(--skin__neutral_2);
}

.mine-feature-card__claim-check {
  position: absolute;
  top: 6px;
  left: 0;
  right: 0;
  margin: auto;
  color: #fff;
  font-size: 6px;
}

.mine-feature-card__badge {
  max-width: 44px;
  height: 16px;
  padding: 0 5px;
  position: absolute;
  top: -9px;
  left: 50%;
  overflow: hidden;
  border-radius: 8px;
  color: #fff;
  background: var(--skin__accent_1);
  font-size: 10px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: translateX(-50%);
}

.mine-feature-card__label {
  width: 100%;
  max-height: 33px;
  margin-top: 5px;
  display: -webkit-box;
  overflow: hidden;
  color: var(--skin__neutral_1);
  font-size: 12px;
  line-height: 16.5px;
  text-overflow: ellipsis;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 360px) {
  .mine-feature-card__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: 7px;
  }

  .mine-feature-card__item {
    width: auto;
  }
}
</style>
