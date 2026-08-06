<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  createCanvasConnector,
  type CanvasConnector,
  type ConnectorConnection,
  type ConnectorNode
} from "./canvasConnector";

const props = defineProps<{
  connections: ConnectorConnection[];
}>();

const containerRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();
const contentRef = ref<HTMLElement>();
let connector: CanvasConnector | undefined;

const collectNodes = (): ConnectorNode[] => {
  if (!contentRef.value) {
    return [];
  }

  return Array.from(contentRef.value.querySelectorAll<HTMLElement>("[data-connector-id]"))
    .map((element) => ({
      id: element.dataset.connectorId ?? "",
      element
    }))
    .filter((node) => node.id);
};

onMounted(async () => {
  await nextTick();
  if (!canvasRef.value || !containerRef.value) {
    return;
  }

  connector = createCanvasConnector({
    canvas: canvasRef.value,
    container: containerRef.value,
    nodes: collectNodes(),
    connections: props.connections,
    autoResizePadding: [0, 24, 0, 10],
    isRem: true
  });
});

onBeforeUnmount(() => {
  connector?.destroy();
  connector = undefined;
});
</script>

<template>
  <div ref="containerRef" class="canvas-connector">
    <canvas ref="canvasRef" class="canvas-connector__canvas" />
    <div ref="contentRef" class="canvas-connector__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.canvas-connector {
  position: relative;
}

.canvas-connector__canvas {
  z-index: 0;
}

.canvas-connector__content {
  position: relative;
  z-index: 1;
}
</style>
