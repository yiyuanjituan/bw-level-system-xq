<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Status = 'idle' | 'loading' | 'success' | 'error'

type ClassName =
  | string
  | string[]
  | Record<string, boolean>

const props = withDefaults(defineProps<{
  src: string

  /**
   * 不推荐移动端项目使用 size，因为它会生成 inline style，PostCSS 不会转换。
   * 推荐使用 className，例如：icon-s、icon-m、icon-l。
   */
  size?: number | string

  /**
   * 不推荐移动端项目使用 color，因为它会生成 inline style。
   * 推荐使用 className，例如：color-accent1、color-primary。
   */
  color?: string

  /**
   * 推荐用这个控制尺寸和颜色。
   * 例如：class-name="icon-s color-accent1"
   */
  className?: ClassName
}>(), {
  size: undefined,
  color: undefined,
  className: '',
})

const localSvgMap = import.meta.glob('/src/assets/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const svgCache = new Map<string, string>()

const status = ref<Status>('idle')
const svgHtml = ref('')

const iconStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.size !== undefined) {
    style.fontSize = typeof props.size === 'number'
      ? `${props.size}px`
      : props.size
  }

  if (props.color) {
    style.color = props.color
  }

  return style
})

function getAssetKey(src: string) {
  if (src.startsWith('@/')) {
    return `/src/${src.slice(2)}`
  }

  if (src.startsWith('src/')) {
    return `/${src}`
  }

  return src
}

function formatSvg(svgText: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const svg = doc.querySelector('svg')

  if (!svg) return ''

  svg.setAttribute('width', '1em')
  svg.setAttribute('height', '1em')
  svg.setAttribute('fill', 'currentColor')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')

  svg.removeAttribute('style')
  svg.removeAttribute('class')

  svg.querySelectorAll('script, foreignObject').forEach(node => {
    node.remove()
  })

  svg.querySelectorAll('[fill]').forEach(node => {
    const fill = node.getAttribute('fill')

    if (!fill || fill === 'none' || fill.startsWith('url(')) return

    node.setAttribute('fill', 'currentColor')
  })

  svg.querySelectorAll('[stroke]').forEach(node => {
    const stroke = node.getAttribute('stroke')

    if (!stroke || stroke === 'none' || stroke.startsWith('url(')) return

    node.setAttribute('stroke', 'currentColor')
  })

  return svg.outerHTML
}

async function getSvgText(src: string) {
  const assetKey = getAssetKey(src)
  const localSvg = localSvgMap[assetKey]

  if (typeof localSvg === 'string') {
    return localSvg
  }

  const res = await fetch(src)

  if (!res.ok) {
    throw new Error(`SVG 加载失败：${res.status}`)
  }

  return await res.text()
}

async function loadSvg() {
  if (!props.src) {
    status.value = 'idle'
    svgHtml.value = ''
    return
  }

  try {
    status.value = 'loading'

    if (svgCache.has(props.src)) {
      svgHtml.value = svgCache.get(props.src) || ''
      status.value = 'success'
      return
    }

    const svgText = await getSvgText(props.src)
    const html = formatSvg(svgText)

    if (!html) {
      throw new Error(`SVG 内容无效：${props.src}`)
    }

    svgCache.set(props.src, html)

    svgHtml.value = html
    status.value = 'success'
  } catch (error) {
    console.error('[SvgIcon]', error)

    svgHtml.value = ''
    status.value = 'error'
  }
}

watch(
  () => props.src,
  () => {
    loadSvg()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <i
    class="svg-icon"
    :class="className"
    :data-src="src"
    :data-status="status"
    :style="iconStyle"
    v-html="svgHtml"
  />
</template>

<style scoped lang="less">
.svg-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 1em;
  height: 1em;
  line-height: 1;
  color: currentColor;
  font-size: 24px;
  flex-shrink: 0;
  vertical-align: -0.125em;
}

.svg-icon :deep(svg) {
  display: block;
  width: 1em;
  height: 1em;
  fill: currentColor;
}

/* 尺寸：这里的 px 会经过 PostCSS */
.icon-xs {
  font-size: 16px;
}

.icon-s {
  font-size: 24px;
}

.icon-m {
  font-size: 32px;
}

.icon-l {
  font-size: 40px;
}

.icon-xl {
  font-size: 48px;
}

/* 颜色：可以接你的主题变量 */
.color-primary {
  color: var(--skin__primary);
}

.color-accent1 {
  color: var(--skin__accent_1);
}

.color-accent2 {
  color: var(--skin__accent_2);
}

.color-accent3 {
  color: var(--skin__accent_3);
}

.color-white {
  color: #fff;
}

.color-blue {
  color: #007aff;
}
</style>