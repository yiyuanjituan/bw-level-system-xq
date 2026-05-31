import { nextTick, onMounted, onUnmounted, ref, unref, type Ref } from "vue";

type MaybeElementRef = Ref<HTMLElement | null | undefined> | HTMLElement | null | undefined | string;

type RedpackConfig = {
  speedMin: number;
  speedMax: number;
  imgUrl: string;
  width: number;
  height: number;
  sizeMin?: number;
  sizeMax?: number;
};

type BubbleConfig = {
  imgUrl: string;
  width: number;
  height: number;
  opacitySpeed?: number;
  speed?: number;
};

type RedpackClickPayload = {
  clientX: number;
  clientY: number;
  id: number;
};

export type UseRedpackBgOptions = {
  selector?: string | HTMLElement | null;
  interval?: number;
  eventType?: "click" | "touchstart";
  defaultCount?: number;
  redpack?: Partial<RedpackConfig>;
  bubble?: BubbleConfig | null;
  immediate?: boolean;
  onClick?: (payload: RedpackClickPayload | null) => void;
  onMonitor?: (payload: { fps: number }) => void;
};

type RuntimeOptions = {
  selector: string | HTMLElement | null;
  interval: number;
  eventType: "click" | "touchstart";
  defaultCount: number;
  redpack: RedpackConfig;
  bubble: BubbleConfig | null;
  onClick?: (payload: RedpackClickPayload | null) => void;
  onMonitor?: (payload: { fps: number }) => void;
};

type RainBubbleContext = {
  bubbleCtx: CanvasRenderingContext2D | null;
  bubble: BubbleConfig | null;
};

const DEFAULT_REDPACK_OPTIONS: RuntimeOptions = {
  selector: null,
  interval: 100,
  eventType: "click",
  defaultCount: 200,
  redpack: {
    speedMin: 3,
    speedMax: 5,
    imgUrl:
      "data:image/png;base64,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",
    width: 70,
    height: 94,
    sizeMin: 1,
    sizeMax: 1
  },
  bubble: null,
  onClick: () => {},
  onMonitor: undefined
};

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function mergeOptions(options?: UseRedpackBgOptions): RuntimeOptions {
  return {
    ...DEFAULT_REDPACK_OPTIONS,
    ...options,
    selector: options?.selector ?? DEFAULT_REDPACK_OPTIONS.selector,
    redpack: {
      ...DEFAULT_REDPACK_OPTIONS.redpack,
      ...options?.redpack
    },
    bubble: options?.bubble ?? DEFAULT_REDPACK_OPTIONS.bubble
  };
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function resolveElement(target: MaybeElementRef) {
  const value = typeof target === "object" && target && "value" in target ? unref(target) : target;

  if (typeof value === "string") {
    return document.querySelector<HTMLElement>(value);
  }

  return value instanceof HTMLElement ? value : null;
}

function createCanvas(className: string, zIndex: number, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.className = className;
  canvas.width = width;
  canvas.height = height;
  canvas.style.cssText = [
    "position:absolute",
    "top:0",
    "left:0",
    "width:100%",
    "height:100%",
    "pointer-events:none",
    `z-index:${zIndex}`
  ].join(";");
  return canvas;
}

function loadImage(src: string) {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`failed to load image: ${src}`));
        image.src = src;
      })
    );
  }

  return imageCache.get(src)!;
}

function fadeBubble(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  opacitySpeed: number,
  speed: number
) {
  let currentY = y;
  let alpha = 1;

  const animate = () => {
    ctx.clearRect(x - 10, currentY - 10, width + 20, height + 20);
    alpha -= opacitySpeed;
    currentY -= speed;

    if (alpha <= 0) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x, currentY, width, height);
    ctx.restore();
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

class RainRedpackItem {
  id: number;
  private ctx: CanvasRenderingContext2D;
  private bubbleCtx: CanvasRenderingContext2D | null;
  private image: HTMLImageElement;
  private bubble: BubbleConfig | null;
  private containerWidth: number;
  private containerHeight: number;
  width: number;
  height: number;
  x: number;
  y: number;
  private speedY: number;
  private speedX: number;
  private rotation: number;
  private rotationSpeed: number;
  private alpha: number;
  private entering: boolean;

  constructor(options: {
    id: number;
    ctx: CanvasRenderingContext2D;
    bubbleCtx: CanvasRenderingContext2D | null;
    image: HTMLImageElement;
    bubble: BubbleConfig | null;
    containerWidth: number;
    containerHeight: number;
    width: number;
    height: number;
    x: number;
    y: number;
    speedY: number;
    speedX: number;
    rotation: number;
    rotationSpeed: number;
  }) {
    this.id = options.id;
    this.ctx = options.ctx;
    this.bubbleCtx = options.bubbleCtx;
    this.image = options.image;
    this.bubble = options.bubble;
    this.containerWidth = options.containerWidth;
    this.containerHeight = options.containerHeight;
    this.width = options.width;
    this.height = options.height;
    this.x = options.x;
    this.y = options.y;
    this.speedY = options.speedY;
    this.speedX = options.speedX;
    this.rotation = options.rotation;
    this.rotationSpeed = options.rotationSpeed;
    this.alpha = this.y <= this.height ? 0 : 1;
    this.entering = this.y <= this.height;
  }

  updateBounds(width: number, height: number) {
    this.containerWidth = width;
    this.containerHeight = height;
  }

  containsPoint(x: number, y: number) {
    const padding = 14;
    return (
      x >= this.x - padding
      && x <= this.x + this.width + padding
      && y >= this.y - padding
      && y <= this.y + this.height + padding
    );
  }

  isOutside() {
    return (
      this.x < -this.width
      || this.x > this.containerWidth
      || this.y < -this.height
      || this.y > this.containerHeight
    );
  }

  draw() {
    this.step();
    this.ctx.save();
    this.ctx.globalAlpha = this.alpha;
    this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    this.ctx.rotate(this.rotation);
    this.ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    this.ctx.restore();
  }

  burst() {
    if (!this.bubble || !this.bubbleCtx) return;

    loadImage(this.bubble.imgUrl).then((bubbleImage) => {
      fadeBubble(
        this.bubbleCtx!,
        bubbleImage,
        this.x,
        this.y,
        this.bubble!.width,
        this.bubble!.height,
        this.bubble!.opacitySpeed ?? 0.05,
        this.bubble!.speed ?? 2
      );
    });
  }

  private step() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    if (this.entering) {
      this.alpha = Math.min(1, this.alpha + 0.04);
      if (this.alpha >= 1) {
        this.entering = false;
      }
      return;
    }

    if (
      this.y >= this.containerHeight - this.height
      || this.x <= 0
      || this.x >= this.containerWidth - this.width
    ) {
      this.alpha = Math.max(0.2, this.alpha - 0.02);
    }
  }
}

class RainRedpackRuntime {
  private target: MaybeElementRef;
  private options: RuntimeOptions;
  private container: HTMLElement | null;
  private wrapper: HTMLDivElement | null;
  private rainCanvas: HTMLCanvasElement | null;
  private bubbleCanvas: HTMLCanvasElement | null;
  private rainCtx: CanvasRenderingContext2D | null;
  private bubbleCtx: CanvasRenderingContext2D | null;
  private items: RainRedpackItem[];
  private timer: number | null;
  private frameId: number | null;
  private image: HTMLImageElement | null;
  private lastSpawnX: number;
  private lastFrameAt: number;
  private started: boolean;
  private handleResizeBound: () => void;
  private handleVisibilityBound: () => void;
  private handlePointerBound: (event: MouseEvent | TouchEvent) => void;

  constructor(target: MaybeElementRef, options?: UseRedpackBgOptions) {
    this.target = target;
    this.options = mergeOptions(options);
    this.container = null;
    this.wrapper = null;
    this.rainCanvas = null;
    this.bubbleCanvas = null;
    this.rainCtx = null;
    this.bubbleCtx = null;
    this.items = [];
    this.timer = null;
    this.frameId = null;
    this.image = null;
    this.lastSpawnX = 0;
    this.lastFrameAt = performance.now();
    this.started = false;
    this.handleResizeBound = this.handleResize.bind(this);
    this.handleVisibilityBound = this.handleVisibility.bind(this);
    this.handlePointerBound = this.handlePointer.bind(this);
  }

  async start() {
    if (this.started) return;

    this.container = resolveElement(this.options.selector || this.target);
    if (!this.container) {
      throw new Error("rain container not found");
    }

    this.image = await loadImage(this.options.redpack.imgUrl);
    this.mount();
    this.seedItems();
    this.bindEvents();
    this.startSpawnTimer();
    this.started = true;
    this.render();
  }

  stop() {
    this.started = false;

    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    window.removeEventListener("resize", this.handleResizeBound);
    document.removeEventListener("visibilitychange", this.handleVisibilityBound);
    this.container?.removeEventListener(this.options.eventType, this.handlePointerBound as EventListener);

    this.items = [];

    if (this.wrapper?.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    this.wrapper = null;
    this.rainCanvas = null;
    this.bubbleCanvas = null;
    this.rainCtx = null;
    this.bubbleCtx = null;
  }

  private mount() {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    const width = Math.max(rect.width, window.innerWidth);
    const height = Math.max(rect.height, window.innerHeight);
    const computedPosition = window.getComputedStyle(this.container).position;

    if (computedPosition === "static") {
      this.container.style.position = "relative";
    }

    this.wrapper = document.createElement("div");
    this.wrapper.className = "rain-redpack-runtime";
    this.wrapper.style.cssText = "position:absolute;inset:0;height:100%;overflow:hidden;pointer-events:none;";

    if (this.options.bubble) {
      this.bubbleCanvas = createCanvas("bubble-redpack-canvas", 1, width, height);
      this.wrapper.appendChild(this.bubbleCanvas);
      this.bubbleCtx = this.bubbleCanvas.getContext("2d");
    }

    this.rainCanvas = createCanvas("rain-redpack-canvas", 2, width, height);
    this.wrapper.appendChild(this.rainCanvas);
    this.rainCtx = this.rainCanvas.getContext("2d");
    this.container.appendChild(this.wrapper);
  }

  private bindEvents() {
    window.addEventListener("resize", this.handleResizeBound);
    document.addEventListener("visibilitychange", this.handleVisibilityBound);
    this.container?.addEventListener(this.options.eventType, this.handlePointerBound as EventListener, false);
  }

  private handleResize() {
    if (!this.container || !this.rainCanvas) return;

    const rect = this.container.getBoundingClientRect();
    const width = Math.max(rect.width, window.innerWidth);
    const height = Math.max(rect.height, window.innerHeight);

    this.rainCanvas.width = width;
    this.rainCanvas.height = height;

    if (this.bubbleCanvas) {
      this.bubbleCanvas.width = width;
      this.bubbleCanvas.height = height;
    }

    this.items.forEach((item) => item.updateBounds(width, height));
  }

  private handleVisibility() {
    if (document.visibilityState === "hidden") {
      if (this.timer) {
        window.clearInterval(this.timer);
        this.timer = null;
      }
      return;
    }

    if (!this.timer && this.started) {
      this.startSpawnTimer();
    }
  }

  private handlePointer(event: MouseEvent | TouchEvent) {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    const points = event.type === "touchstart"
      ? Array.from((event as TouchEvent).touches)
      : [event as MouseEvent];

    for (let itemIndex = this.items.length - 1; itemIndex >= 0; itemIndex -= 1) {
      const item = this.items[itemIndex];

      for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
        const point = points[pointIndex];
        const x = point.clientX - rect.left;
        const y = point.clientY - rect.top;

        if (!item.containsPoint(x, y)) continue;

        item.burst();
        this.items.splice(itemIndex, 1);
        this.options.onClick?.({
          clientX: x,
          clientY: y,
          id: item.id
        });
        break;
      }
    }
  }

  private seedItems() {
    if (this.options.defaultCount <= 0) {
      this.spawnItem(false);
      return;
    }

    for (let i = 0; i < this.options.defaultCount; i += 1) {
      this.spawnItem(true);
    }
  }

  private startSpawnTimer() {
    this.timer = window.setInterval(() => {
      this.spawnItem(false);
    }, this.options.interval);
  }

  private getSpawnX(itemWidth: number, containerWidth: number) {
    let x = 0;
    let retries = 0;

    do {
      x = Math.floor(randomBetween(0, Math.max(1, containerWidth - itemWidth)));
      retries += 1;
    } while (retries < 10 && Math.abs(this.lastSpawnX - x) <= itemWidth * 1.5);

    this.lastSpawnX = x;
    return x;
  }

  private spawnItem(randomStartY: boolean) {
    if (!this.rainCtx || !this.rainCanvas || !this.image) return;

    const { width: baseWidth, height: baseHeight, speedMin, speedMax, sizeMin = 1, sizeMax = 1 } = this.options.redpack;
    const scale = Number(randomBetween(sizeMin, sizeMax).toFixed(2));
    const width = baseWidth * scale;
    const height = baseHeight * scale;
    const x = this.getSpawnX(width, this.rainCanvas.width);
    const y = randomStartY
      ? Math.floor(randomBetween(0, Math.max(1, this.rainCanvas.height - height * 3)))
      : -height;
    const speedY = randomBetween(speedMin, speedMax);
    const speedX = randomBetween(-speedY / 2, speedY / 2);
    const rotation = randomBetween(-Math.PI / 10, Math.PI / 10);
    const rotationSpeed = randomBetween(-0.025, 0.025);

    this.items.push(
      new RainRedpackItem({
        id: Date.now() + Math.floor(Math.random() * 1000),
        ctx: this.rainCtx,
        bubbleCtx: this.bubbleCtx,
        image: this.image,
        bubble: this.options.bubble,
        containerWidth: this.rainCanvas.width,
        containerHeight: this.rainCanvas.height,
        width,
        height,
        x,
        y,
        speedY,
        speedX,
        rotation,
        rotationSpeed
      })
    );
  }

  private render() {
    if (!this.started || !this.rainCtx || !this.rainCanvas) return;

    this.frameId = requestAnimationFrame(() => {
      const now = performance.now();
      const fps = Math.round(1000 / Math.max(1, now - this.lastFrameAt));
      this.lastFrameAt = now;

      this.rainCtx!.clearRect(0, 0, this.rainCanvas!.width, this.rainCanvas!.height);
      this.items = this.items.filter((item) => {
        if (item.isOutside()) return false;
        item.draw();
        return true;
      });

      this.options.onMonitor?.({ fps });
      this.render();
    });
  }
}

export function useRedpackBg(target: MaybeElementRef, options?: UseRedpackBgOptions) {
  const runtime = new RainRedpackRuntime(target, options);
  const started = ref(false);

  const start = async () => {
    await nextTick();
    await runtime.start();
    started.value = true;
  };

  const stop = () => {
    runtime.stop();
    started.value = false;
  };

  onMounted(() => {
    if (options?.immediate === false) return;
    start();
  });

  onUnmounted(() => {
    stop();
  });

  return {
    started,
    start,
    stop
  };
}
