# Button.vue 使用教程

本文档对应组件：`src/components/Common/Button.vue`（组件名：`ui-button`）。

## 1. 快速开始

### 1.1 引入并注册

```vue
<script setup lang="ts">
import UiButton from "@/components/Common/Button.vue";

function handleSubmit() {
  console.log("submit");
}
</script>

<template>
  <ui-button @click="handleSubmit">提交</ui-button>
</template>
```

### 1.2 最小可用示例

```vue
<ui-button>默认按钮</ui-button>
<ui-button type="primary">主要按钮</ui-button>
<ui-button type="danger">危险操作</ui-button>
```

## 2. Props 参数总览

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'default'` | `'default'` | 按钮类型 |
| `size` | `'large' \| 'default' \| 'small' \| 'mini'` | `'default'` | 按钮尺寸 |
| `nativeType` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生 button 类型 |
| `loading` | `boolean` | `false` | 加载状态（不可点击） |
| `plain` | `boolean` | `false` | 朴素按钮 |
| `round` | `boolean` | `false` | 圆角按钮 |
| `circle` | `boolean` | `false` | 圆形按钮（通常配合图标） |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `block` | `boolean` | `false` | 块级按钮（宽度 100%） |
| `text` | `boolean` | `false` | 文字按钮 |
| `ghost` | `boolean` | `false` | 幽灵按钮（透明背景） |
| `color` | `string` | `''` | 自定义主色（背景/边框） |
| `textColor` | `string` | `''` | 自定义文字颜色 |
| `loadingSize` | `string` | `'16px'` | loading 图标尺寸 |
| `icon` | `string` | `''` | 图标名称，`svg:xxx` 或 class 名 |
| `iconPosition` | `'left' \| 'right'` | `'left'` | 图标位置 |
| `autofocus` | `boolean` | `false` | 自动获取焦点 |
| `customClass` | `string` | `''` | 额外 class |

## 3. 事件与插槽

### 3.1 事件

`click`：`(event: MouseEvent) => void`

说明：
- `disabled` 或 `loading` 状态下，内部会阻止点击事件继续触发。

### 3.2 插槽

- 默认插槽：按钮文案/内容。

```vue
<ui-button>
  <span>立即充值</span>
</ui-button>
```

## 4. 常见用法示例

### 4.1 尺寸

```vue
<ui-button size="large">Large</ui-button>
<ui-button size="default">Default</ui-button>
<ui-button size="small">Small</ui-button>
<ui-button size="mini">Mini</ui-button>
```

### 4.2 形态

```vue
<ui-button plain>朴素</ui-button>
<ui-button ghost>幽灵</ui-button>
<ui-button text>文字按钮</ui-button>
<ui-button round>圆角</ui-button>
<ui-button circle icon="svg:comm_icon_ss" />
<ui-button block>整行宽度</ui-button>
```

### 4.3 状态控制

```vue
<script setup lang="ts">
import { ref } from "vue";
import UiButton from "@/components/Common/Button.vue";

const loading = ref(false);

async function handleSave() {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1200));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ui-button :loading="loading" @click="handleSave">保存</ui-button>
  <ui-button disabled>已禁用</ui-button>
</template>
```

### 4.4 自定义颜色

```vue
<ui-button color="#3b82f6" text-color="#ffffff">蓝色按钮</ui-button>
<ui-button plain color="#22c55e" text-color="#22c55e">绿色朴素</ui-button>
```

### 4.5 图标

```vue
<!-- 使用 svg-icon 名称 -->
<ui-button icon="svg:comm_icon_ss">搜索</ui-button>

<!-- 使用 icon class -->
<ui-button icon="iconfont icon-home">首页</ui-button>
```

## 5. 在表单中使用

```vue
<form @submit.prevent="onSubmit">
  <ui-button native-type="submit" type="primary">提交</ui-button>
  <ui-button native-type="reset" plain>重置</ui-button>
</form>
```

说明：`nativeType` 是透传到原生 `<button type="...">`。

## 6. 样式覆盖建议

优先级从低到高建议如下：
1. 使用 props（`type`、`size`、`plain` 等）；
2. 使用 `customClass`；
3. 在使用处加工具类（如 Tailwind 的 `!w-[80px]`）；
4. 最后才做全局样式重写。

示例：

```vue
<ui-button
  custom-class="my-recharge-btn"
  class="!w-[120px] !h-[32px] !rounded-[6px]"
>
  立即充值
</ui-button>
```

## 7. 注意事项（基于当前实现）

1. `iconPosition="right"` 在“有默认插槽文本”时不会显示右侧图标。  
   原因是模板结构中右图标分支使用了 `v-else-if`，会被文本分支拦截。  
   临时方案：把右图标手动写进插槽内容里。

2. `adjustColor()` 目前直接返回原色。  
   也就是 `color` / `textColor` 的 hover、active 颜色没有真正做亮度变化。

3. `loading` 状态下按钮不可点击，且原生 `disabled` 也会为 `true`。

## 8. 推荐组合

1. 提交类：`type="primary"` + `:loading`  
2. 次级操作：`plain` 或 `ghost`  
3. 高风险动作：`type="danger"` + 二次确认  
4. 窄容器：`size="small"` 或 `size="mini"`  
5. 纯图标动作：`circle` + `icon`

---

如果你希望，我可以下一步直接给这个组件补两个增强：
- 修复 `iconPosition="right"` 与文本共存的问题；
- 完整实现 `adjustColor()`（支持 hex/rgb 调整 hover/active 颜色）。
