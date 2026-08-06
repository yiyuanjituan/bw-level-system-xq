export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ConnectorElement {
  getBoundingClientRect(): RectLike;
}

export interface ConnectorNode {
  id: string;
  element: ConnectorElement;
}

export type CoordinateValue = number | `${number}%`;

export interface AxisReference {
  nodeId: string;
  position: CoordinateValue;
  offset?: number;
}

export interface NodePathPoint {
  nodeId: string;
  x: CoordinateValue;
  y: CoordinateValue;
  offsetX?: number;
  offsetY?: number;
}

export interface MixedPathPoint {
  x: number | AxisReference;
  y: number | AxisReference;
}

export type ConnectionPathPoint = NodePathPoint | MixedPathPoint;
export type LineType = "solid" | "dashed" | "dotted";
export type ArrowType = "none" | "dot" | "triangle";

export interface ConnectorConnection {
  id: string;
  paths: ConnectionPathPoint[];
  color?: string;
  lineWidth?: number;
  type?: LineType;
  radius?: number;
  startArrowType?: ArrowType;
  endArrowType?: ArrowType;
  startArrowSize?: number;
  endArrowSize?: number;
}

export interface CanvasConnectorOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  nodes: ConnectorNode[];
  connections: ConnectorConnection[];
  autoResize?: boolean;
  autoResizePadding?: [number, number, number, number];
  isRem?: boolean;
  remBase?: number;
  warn?: (message: string) => void;
}

export interface CanvasConnector {
  draw(): void;
  resize(): void;
  setNodes(nodes: ConnectorNode[]): void;
  setConnections(connections: ConnectorConnection[]): void;
  destroy(): void;
}

export interface ResolvedPoint {
  x: number;
  y: number;
}

export interface ValidationIssue {
  connectionId: string;
  message: string;
}

interface ResolveContext {
  containerRect: RectLike;
  nodeMap: Map<string, ConnectorElement>;
  paddingLeft: number;
  paddingTop: number;
  scale: (value: number) => number;
}

const DEFAULT_COLOR = "#656565";
const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_RADIUS = 0;
const DEFAULT_ARROW_SIZE = 8;

function isNodePathPoint(point: ConnectionPathPoint): point is NodePathPoint {
  return "nodeId" in point;
}

function resolvePosition(value: CoordinateValue, size: number): number {
  if (typeof value === "number") {
    return value;
  }

  const percentage = Number.parseFloat(value);
  if (!Number.isFinite(percentage)) {
    throw new Error(`无法解析百分比坐标：${value}`);
  }

  return size * percentage / 100;
}

function requireNode(nodeMap: Map<string, ConnectorElement>, nodeId: string): ConnectorElement {
  const element = nodeMap.get(nodeId);
  if (!element) {
    throw new Error(`找不到节点：${nodeId}`);
  }
  return element;
}

function resolveAxis(
  axis: "x" | "y",
  reference: AxisReference,
  context: ResolveContext,
): number {
  const element = requireNode(context.nodeMap, reference.nodeId);
  const rect = element.getBoundingClientRect();
  const isXAxis = axis === "x";
  const start = isXAxis
    ? rect.left - context.containerRect.left + context.paddingLeft
    : rect.top - context.containerRect.top + context.paddingTop;
  const size = isXAxis ? rect.width : rect.height;

  return start
    + resolvePosition(reference.position, size)
    + context.scale(reference.offset ?? 0);
}

export function resolveConnectionPath(
  paths: ConnectionPathPoint[],
  nodes: ConnectorNode[],
  containerRect: RectLike,
  options: {
    paddingLeft?: number;
    paddingTop?: number;
    scale?: (value: number) => number;
  } = {},
): ResolvedPoint[] {
  const context: ResolveContext = {
    containerRect,
    nodeMap: new Map(nodes.map((node) => [node.id, node.element])),
    paddingLeft: options.paddingLeft ?? 0,
    paddingTop: options.paddingTop ?? 0,
    scale: options.scale ?? ((value) => value),
  };

  return paths.map((point) => {
    if (isNodePathPoint(point)) {
      const element = requireNode(context.nodeMap, point.nodeId);
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + context.paddingLeft
          + resolvePosition(point.x, rect.width)
          + context.scale(point.offsetX ?? 0),
        y: rect.top - containerRect.top + context.paddingTop
          + resolvePosition(point.y, rect.height)
          + context.scale(point.offsetY ?? 0),
      };
    }

    return {
      x: typeof point.x === "number" ? context.scale(point.x) : resolveAxis("x", point.x, context),
      y: typeof point.y === "number" ? context.scale(point.y) : resolveAxis("y", point.y, context),
    };
  });
}

export function validateConnectionDefinitions(
  nodes: ConnectorNode[],
  connections: ConnectorConnection[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const connectionIds = new Set<string>();

  for (const connection of connections) {
    if (connectionIds.has(connection.id)) {
      issues.push({
        connectionId: connection.id,
        message: `连线 ID 重复：${connection.id}`,
      });
    }
    connectionIds.add(connection.id);

    if (connection.paths.length < 2) {
      issues.push({
        connectionId: connection.id,
        message: `连线至少需要两个路径点：${connection.id}`,
      });
    }

    for (const point of connection.paths) {
      const referencedNodeIds = isNodePathPoint(point)
        ? [point.nodeId]
        : [
            typeof point.x === "number" ? null : point.x.nodeId,
            typeof point.y === "number" ? null : point.y.nodeId,
          ];

      for (const nodeId of referencedNodeIds) {
        if (nodeId && !nodeIds.has(nodeId)) {
          issues.push({
            connectionId: connection.id,
            message: `连线 ${connection.id} 引用了不存在的节点：${nodeId}`,
          });
        }
      }
    }
  }

  return issues;
}

function getLineDash(type: LineType, lineWidth: number): number[] {
  if (type === "dashed") {
    return [lineWidth * 4, lineWidth * 3];
  }
  if (type === "dotted") {
    return [lineWidth, lineWidth * 2];
  }
  return [];
}

function traceRoundedPath(
  context: CanvasRenderingContext2D,
  points: ResolvedPoint[],
  radius: number,
): void {
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  if (radius <= 0 || points.length === 2) {
    for (const point of points.slice(1)) {
      context.lineTo(point.x, point.y);
    }
    return;
  }

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    context.arcTo(current.x, current.y, next.x, next.y, radius);
  }

  const lastPoint = points[points.length - 1];
  context.lineTo(lastPoint.x, lastPoint.y);
}

function findDirectionPoint(
  points: ResolvedPoint[],
  fromStart: boolean,
): { tip: ResolvedPoint; direction: ResolvedPoint } | null {
  const orderedPoints = fromStart ? points : [...points].reverse();
  const tip = orderedPoints[0];

  for (const candidate of orderedPoints.slice(1)) {
    if (candidate.x !== tip.x || candidate.y !== tip.y) {
      return { tip, direction: candidate };
    }
  }

  return null;
}

function drawArrow(
  context: CanvasRenderingContext2D,
  points: ResolvedPoint[],
  type: ArrowType,
  size: number,
  color: string,
  fromStart: boolean,
): void {
  if (type === "none") {
    return;
  }

  const arrow = findDirectionPoint(points, fromStart);
  if (!arrow) {
    return;
  }

  context.save();
  context.fillStyle = color;

  if (type === "dot") {
    context.beginPath();
    context.arc(arrow.tip.x, arrow.tip.y, size / 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
    return;
  }

  const angle = Math.atan2(
    arrow.tip.y - arrow.direction.y,
    arrow.tip.x - arrow.direction.x,
  );
  context.translate(arrow.tip.x, arrow.tip.y);
  context.rotate(angle);
  context.beginPath();
  // 路径端点落在三角形中心，避免线端只对齐箭头尖端。
  const halfSize = size / 2;
  context.moveTo(halfSize, 0);
  context.lineTo(-halfSize, size * 0.55);
  context.lineTo(-halfSize, -size * 0.55);
  context.closePath();
  context.fill();
  context.restore();
}

function getSegmentKey(start: ResolvedPoint, end: ResolvedPoint): string {
  const startKey = `${start.x.toFixed(2)},${start.y.toFixed(2)}`;
  const endKey = `${end.x.toFixed(2)},${end.y.toFixed(2)}`;
  return startKey < endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`;
}

export function createCanvasConnector(options: CanvasConnectorOptions): CanvasConnector {
  let nodes = options.nodes;
  let connections = options.connections;
  let destroyed = false;
  let animationFrameId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  const warn = options.warn ?? ((message) => console.warn(message));
  const padding = options.autoResizePadding ?? [0, 0, 0, 0];
  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;
  const initialContainerPosition = options.container.style.position;
  const initialCanvasStyles = {
    position: options.canvas.style.position,
    left: options.canvas.style.left,
    top: options.canvas.style.top,
    width: options.canvas.style.width,
    height: options.canvas.style.height,
    transform: options.canvas.style.transform,
    pointerEvents: options.canvas.style.pointerEvents,
  };

  if (getComputedStyle(options.container).position === "static") {
    options.container.style.position = "relative";
  }
  Object.assign(options.canvas.style, {
    position: "absolute",
    left: "0",
    top: "0",
    pointerEvents: "none",
  });

  const scale = (value: number): number => {
    if (!options.isRem) {
      return value;
    }
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return value * rootFontSize / (options.remBase ?? 100);
  };

  const draw = (): void => {
    if (destroyed) {
      return;
    }

    const context = options.canvas.getContext("2d");
    if (!context) {
      warn("无法获取 Canvas 2D 绘图上下文");
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = options.canvas.width / devicePixelRatio;
    const canvasHeight = options.canvas.height / devicePixelRatio;
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    for (const issue of validateConnectionDefinitions(nodes, connections)) {
      warn(issue.message);
    }

    const containerRect = options.container.getBoundingClientRect();
    const occupiedSegments = new Map<string, string>();

    for (const connection of connections) {
      if (connection.paths.length < 2) {
        continue;
      }

      try {
        const points = resolveConnectionPath(connection.paths, nodes, containerRect, {
          paddingLeft,
          paddingTop,
          scale,
        });

        for (let index = 1; index < points.length; index += 1) {
          const previousPoint = points[index - 1];
          const currentPoint = points[index];
          if (previousPoint.x !== currentPoint.x && previousPoint.y !== currentPoint.y) {
            warn(`连线 ${connection.id} 的第 ${index} 段为斜线，请插入水平或垂直拐点`);
          }

          const segmentKey = getSegmentKey(previousPoint, currentPoint);
          const occupiedBy = occupiedSegments.get(segmentKey);
          if (occupiedBy) {
            warn(`连线 ${connection.id} 与 ${occupiedBy} 存在完全重叠的线段`);
          } else {
            occupiedSegments.set(segmentKey, connection.id);
          }
        }

        const color = connection.color ?? DEFAULT_COLOR;
        const lineWidth = scale(connection.lineWidth ?? DEFAULT_LINE_WIDTH);
        context.save();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.setLineDash(getLineDash(connection.type ?? "solid", lineWidth));
        traceRoundedPath(context, points, scale(connection.radius ?? DEFAULT_RADIUS));
        context.stroke();
        context.restore();

        drawArrow(
          context,
          points,
          connection.startArrowType ?? "none",
          scale(connection.startArrowSize ?? DEFAULT_ARROW_SIZE),
          color,
          true,
        );
        drawArrow(
          context,
          points,
          connection.endArrowType ?? "none",
          scale(connection.endArrowSize ?? DEFAULT_ARROW_SIZE),
          color,
          false,
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        warn(`绘制连线 ${connection.id} 失败：${reason}`);
      }
    }
  };

  const resize = (): void => {
    if (destroyed) {
      return;
    }

    const containerRect = options.container.getBoundingClientRect();
    const width = containerRect.width + paddingLeft + paddingRight;
    const height = containerRect.height + paddingTop + paddingBottom;
    const devicePixelRatio = window.devicePixelRatio || 1;

    options.canvas.width = Math.max(1, Math.round(width * devicePixelRatio));
    options.canvas.height = Math.max(1, Math.round(height * devicePixelRatio));
    options.canvas.style.width = `${width}px`;
    options.canvas.style.height = `${height}px`;
    options.canvas.style.transform = `translate(${-paddingLeft}px, ${-paddingTop}px)`;

    const context = options.canvas.getContext("2d");
    context?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    draw();
  };

  const scheduleResize = (): void => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(() => {
      animationFrameId = null;
      resize();
    });
  };

  const observeElements = (): void => {
    resizeObserver?.disconnect();
    if (options.autoResize === false || typeof ResizeObserver === "undefined") {
      return;
    }

    resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(options.container);
    for (const node of nodes) {
      if (node.element instanceof Element) {
        resizeObserver.observe(node.element);
      }
    }
  };

  const handleWindowResize = (): void => scheduleResize();
  if (options.autoResize !== false) {
    window.addEventListener("resize", handleWindowResize);
  }
  observeElements();
  resize();

  return {
    draw,
    resize,
    setNodes(nextNodes): void {
      nodes = nextNodes;
      observeElements();
      scheduleResize();
    },
    setConnections(nextConnections): void {
      connections = nextConnections;
      scheduleResize();
    },
    destroy(): void {
      if (destroyed) {
        return;
      }
      destroyed = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      options.container.style.position = initialContainerPosition;
      Object.assign(options.canvas.style, initialCanvasStyles);
    },
  };
}
