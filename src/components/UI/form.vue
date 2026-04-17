<script setup lang="ts">
import Schema from "async-validator";
import { computed, provide, ref } from "vue";
import {
  FORM_CONTEXT_KEY,
  type FormErrors,
  type FormModel,
  type FormRuleItem,
  type FormRules
} from "./form-context";

defineOptions({
  name: "ui-form"
});

interface Props {
  rule?: FormRules;
  model?: FormModel;
}

const props = withDefaults(defineProps<Props>(), {
  rule: () => ({}),
  model: () => ({})
});

const errors = ref<FormErrors>({});
const rulesRef = computed<FormRules>(() => props.rule ?? {});
const modelRef = computed<FormModel>(() => props.model ?? {});

function toFieldList(fields?: string | string[]) {
  if (!fields)
    return Object.keys(rulesRef.value);
  return Array.isArray(fields) ? fields : [fields];
}

function getFieldRules(field: string) {
  const rules = rulesRef.value[field];
  if (!rules)
    return [];
  return Array.isArray(rules) ? rules : [rules];
}

function matchTrigger(rule: FormRuleItem, trigger?: string) {
  if (!trigger)
    return true;
  if (!rule.trigger)
    return true;
  const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger];
  return triggers.includes(trigger);
}

function buildSchemaRules(field: string, trigger?: string) {
  return getFieldRules(field).filter(rule => matchTrigger(rule, trigger));
}

function clearValidate(fields?: string | string[]) {
  const targetFields = fields ? toFieldList(fields) : Object.keys(errors.value);
  targetFields.forEach((field) => {
    if (!field)
      return;
    errors.value[field] = "";
  });
}

async function validateField(field: string, trigger?: string) {
  if (!field)
    return;

  const schemaRules = buildSchemaRules(field, trigger);
  if (!schemaRules.length)
    return;

  errors.value[field] = "";

  const schema = new Schema({ [field]: schemaRules });
  try {
    await schema.validate({ [field]: modelRef.value?.[field] });
  }
  catch (error: any) {
    const message = error?.errors?.[0]?.message;
    if (message)
      errors.value[field] = message;
  }
}

async function validate(fields?: string | string[]) {
  const targetFields = toFieldList(fields).filter(field => getFieldRules(field).length);
  clearValidate(targetFields);

  if (!targetFields.length)
    return;

  const schemaRules = targetFields.reduce<FormRules>((result, field) => {
    result[field] = getFieldRules(field);
    return result;
  }, {});

  const schema = new Schema(schemaRules as any);
  const payload = targetFields.reduce<FormModel>((result, field) => {
    result[field] = modelRef.value?.[field];
    return result;
  }, {});

  try {
    await schema.validate(payload, { firstFields: true });
  }
  catch (error: any) {
    error?.errors?.forEach(({ field, message }: { field: string; message: string }) => {
      if (field)
        errors.value[field] = message;
    });
    throw error;
  }
}

const formContext = {
  rules: rulesRef,
  model: modelRef,
  errors,
  validateField,
  validate,
  clearValidate
};

provide(FORM_CONTEXT_KEY, formContext);

// Keep legacy injections for existing components that still use string keys.
provide("formRules", props.rule);
provide("form", props.model);
provide("errors", errors);
provide("validateField", validateField);

defineExpose({
  validateField,
  validate,
  clearValidate,
  errors
});
</script>

<template>
  <form autocomplete="off" method="post" @submit.prevent>
    <slot />
  </form>
</template>
