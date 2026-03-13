<script setup lang="ts">
import { provide, ref } from "vue";
import Schema from 'async-validator'

defineOptions({
  name: 'ui-form'
})


interface Props {
  rule: object
  model: object
}

const props = withDefaults(defineProps<Props>(), {
  rule: () => ({}),
  model: () => ({}),
});

const errors = ref({})
const handleFieldBlur = async (field: string) => {
  errors.value[field] = ''

  const schema = new Schema({ [field]: props.rule[field] })

  try {
    await schema.validate({ [field]: props.model[field] })
  } catch (err) {
    errors.value[field] = err.errors[0].message
  }
}

// 5. 表单整体提交校验
const validateAll = async () => {
  return new Promise(async (resolve, reject) => {
    // 重置所有错误信息
    Object.keys(errors.value).forEach(key => {
      errors.value[key] = ''
    })
    // 实例化完整规则的 Schema
    const schema = new Schema(props.rule as any)

    try {
      await schema.validate(props.model, {})
      resolve(void 0)
    } catch (err) {
      // 校验失败：收集所有字段的错误信息
      err.errors.forEach(({ field, message }) => {
        errors.value[field] = message
      })
      reject(err.errors[0].message)
    }
  })
}

provide("formRules", props.rule);
provide("form", props.model);
provide("errors", errors);
provide("validateField", handleFieldBlur);


defineExpose({
  validateField: handleFieldBlur,
  validate: validateAll
})
</script>

<template>
  <form autocomplete="off">
    <slot />
  </form>
</template>

<style scoped lang="less">

</style>