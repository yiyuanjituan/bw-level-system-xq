<script setup lang="ts">
import { computed, inject, onBeforeUnmount, useSlots } from "vue";
import { X_TABS_CONTEXT_KEY, createXTabPaneUid, type XTabPane, type XTabName } from "./x-tabs-context";

defineOptions({
  name: "x-tab"
});

interface Props {
  title?: string;
  name?: XTabName;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  name: undefined,
  disabled: false
});

const tabsContext = inject(X_TABS_CONTEXT_KEY, null);
const slots = useSlots();
const uid = createXTabPaneUid();

const pane: XTabPane = {
  uid,
  title: computed(() => props.title),
  name: computed(() => props.name ?? uid),
  disabled: computed(() => props.disabled),
  slots
};

tabsContext?.registerPane(pane);

onBeforeUnmount(() => {
  tabsContext?.unregisterPane(uid);
});
</script>
