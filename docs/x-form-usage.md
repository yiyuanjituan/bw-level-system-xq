# X Form 使用文档

本文档对应组件：

- `src/components/X/x-form.vue`
- `src/components/X/x-form-item.vue`
- `src/components/X/x-input.vue`
- `src/components/X/x-select.vue`

---

## 1. 快速开始

```vue
<script setup lang="ts">
import { reactive, ref } from "vue";
import XForm from "@/components/X/x-form.vue";
import XFormItem from "@/components/X/x-form-item.vue";
import XInput from "@/components/X/x-input.vue";
import XSelect from "@/components/X/x-select.vue";

const formRef = ref();

const formModel = reactive({
  username: "",
  email: "",
  level: ""
});

const formRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名长度需在 3-20", trigger: "change" }
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "邮箱格式不正确", trigger: "blur" }
  ],
  level: [
    { required: true, message: "请选择等级", trigger: "change" }
  ]
};

const levelOptions = [
  { id: 1, label: "LV1" },
  { id: 2, label: "LV2" },
  { id: 3, label: "LV3" }
];

async function handleSubmit() {
  try {
    await formRef.value.validate();
    console.log("校验通过", formModel);
  } catch (e) {
    console.log("校验失败", e);
  }
}

function handleReset() {
  formModel.username = "";
  formModel.email = "";
  formModel.level = "";
  formRef.value.clearValidate();
}
</script>

<template>
  <x-form ref="formRef" :model="formModel" :rule="formRules">
    <x-form-item prop="username">
      <x-input v-model="formModel.username" placeholder="请输入用户名" clearable />
    </x-form-item>

    <x-form-item prop="email">
      <x-input v-model="formModel.email" placeholder="请输入邮箱" />
    </x-form-item>

    <x-form-item prop="level">
      <x-select
        v-model="formModel.level"
        :options="levelOptions"
        placeholder="请选择等级"
        clearable
      />
    </x-form-item>

    <div style="display:flex; gap:8px;">
      <x-button @click="handleSubmit">提交</x-button>
      <x-button plain @click="handleReset">重置</x-button>
    </div>
  </x-form>
</template>
```

---

## 2. 校验规则格式

规则基于 `async-validator`，支持单条或数组。

```ts
const rules = {
  fieldA: { required: true, message: "必填", trigger: "blur" },
  fieldB: [
    { required: true, message: "必填", trigger: "change" },
    { min: 2, max: 10, message: "长度 2-10", trigger: "change" },
    { pattern: /^\d+$/, message: "只能输入数字", trigger: "blur" },
    {
      trigger: "change",
      validator: (_rule, value, callback) => {
        if (value === "admin") callback(new Error("该值不可用"));
        else callback();
      }
    }
  ]
};
```

### 可用字段

- `required: boolean`
- `message: string`
- `trigger: 'input' | 'change' | 'blur' | string[]`
- `pattern: RegExp`
- `min: number`
- `max: number`
- `validator: (rule, value, callback) => void`

---

## 3. 组件 API

## 3.1 `x-form` Props

- `model: Record<string, any>` 表单数据对象
- `rule: Record<string, Rule | Rule[]>` 校验规则对象

## 3.2 `x-form` Expose

- `validate(fields?)`  
  全量或按字段校验，失败时抛错
- `validateField(field, trigger?)`  
  单字段校验
- `clearValidate(fields?)`  
  清除错误提示
- `errors`  
  当前错误对象

## 3.3 `x-form-item` Props

- `prop: string`  
  对应 `model` 和 `rule` 的字段名

## 3.4 `x-input` 校验相关

- 自动从最近的 `x-form-item` 读取 `prop`
- 自动触发：`input / change / blur`
- 受 `validateEvent` 控制（默认 `true`）

## 3.5 `x-select` 校验相关

- 自动从最近的 `x-form-item` 读取 `prop`
- 自动触发：`change / blur`
- 受 `validateEvent` 控制（默认 `true`）

---

## 4. 常见用法

## 4.1 仅校验部分字段

```ts
await formRef.value.validate(["username", "email"]);
```

## 4.2 仅清除某一项报错

```ts
formRef.value.clearValidate("email");
```

## 4.3 手动触发某个字段校验

```ts
await formRef.value.validateField("username", "blur");
```

---

## 5. 注意事项

1. `x-form-item` 的 `prop` 必须与 `model`、`rule` 的 key 一致，否则不会显示错误。
2. 使用 `x-select` 时，建议显式设置选项唯一值（如 `id`）。
3. 如果你不希望输入中实时校验，可将 `x-input` 的 `validateEvent` 设为 `false`，提交时统一调用 `validate()`。
