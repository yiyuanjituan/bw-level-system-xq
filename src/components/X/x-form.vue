<script setup lang="ts">
import Schema from "async-validator";
import { computed, provide, ref } from "vue";
import {
  X_FORM_CONTEXT_KEY,
  type XFormErrors,
  type XFormModel,
  type XFormRuleItem,
  type XFormRules
} from "./x-form-context";

defineOptions({
  name: "x-form"
});

interface Props {
  rule?: XFormRules;
  model?: XFormModel;
}

const props = withDefaults(defineProps<Props>(), {
  rule: () => ({}),
  model: () => ({})
});

const errors = ref<XFormErrors>({});
const rulesRef = computed<XFormRules>(() => props.rule ?? {});
const modelRef = computed<XFormModel>(() => props.model ?? {});

function toFieldList(fields?: string | string[]) {
  if (!fields) return Object.keys(rulesRef.value);
  return Array.isArray(fields) ? fields : [fields];
}

function getFieldRules(field: string) {
  const rules = rulesRef.value[field];
  if (!rules) return [];
  return Array.isArray(rules) ? rules : [rules];
}

function matchTrigger(rule: XFormRuleItem, trigger?: string) {
  if (!trigger || !rule.trigger) return true;
  const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger];
  return triggers.includes(trigger);
}

function toSchemaRule(rule: XFormRuleItem) {
  const schemaRule = { ...rule };
  delete schemaRule.trigger;
  return schemaRule;
}

function buildSchemaRules(field: string, trigger?: string) {
  return getFieldRules(field)
    .filter(rule => matchTrigger(rule, trigger))
    .map(rule => toSchemaRule(rule));
}

function clearValidate(fields?: string | string[]) {
  const targetFields = fields ? toFieldList(fields) : Object.keys(errors.value);
  targetFields.forEach((field) => {
    if (!field) return;
    errors.value[field] = "";
  });
}

async function validateField(field: string, trigger?: string, value?: unknown) {
  if (!field) return;

  const schemaRules = buildSchemaRules(field, trigger);
  if (!schemaRules.length) return;

  errors.value[field] = "";

  const schema = new Schema({ [field]: schemaRules });
  const fieldValue = arguments.length >= 3 ? value : modelRef.value?.[field];
  try {
    await schema.validate({ [field]: fieldValue });
  }
  catch (error: any) {
    const message = error?.errors?.[0]?.message;
    if (message) errors.value[field] = message;
  }
}

async function validate(fields?: string | string[]) {
  const targetFields = toFieldList(fields).filter(field => getFieldRules(field).length);
  clearValidate(targetFields);
  if (!targetFields.length) return;

  const schemaRules = targetFields.reduce<XFormRules>((result, field) => {
    result[field] = buildSchemaRules(field);
    return result;
  }, {});

  const schema = new Schema(schemaRules as any);
  const payload = targetFields.reduce<XFormModel>((result, field) => {
    result[field] = modelRef.value?.[field];
    return result;
  }, {});

  try {
    await schema.validate(payload, { firstFields: true });
  }
  catch (error: any) {
    error?.errors?.forEach(({ field, message }: { field: string; message: string }) => {
      if (field) errors.value[field] = message;
    });
    throw error;
  }
}

provide(X_FORM_CONTEXT_KEY, {
  rules: rulesRef,
  model: modelRef,
  errors,
  validateField,
  validate,
  clearValidate
});

defineExpose({
  validateField,
  validate,
  clearValidate,
  errors
});
</script>

<template>
  <form class="x-form" autocomplete="off" method="post" @submit.prevent>
    <slot />
  </form>
</template>

<style scoped lang="less">
.x-form {
  width: 100%;
}
</style>
