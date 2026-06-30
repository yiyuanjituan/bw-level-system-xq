import { bus } from "@/utils/mitt";
import { showCustomToast } from "@/hooks/useCommon";
import useFinanceStore from "@/store/modules/finance";
import { formatMoney } from "@/utils/common";

export interface SseMessage<T = any> {
  type: string;
  data: T;
}

export type SseMessageHandler<T = any> = (message: SseMessage<T>) => void;

const SSE_PATH = "/app/v1/sse/connect";
const RECONNECT_DELAY = 4000;

const messageHandlers = new Map<string, Set<SseMessageHandler>>();
const financeMessageConfig: Record<string, { type: "success" | "fail" | "warning"; title: string }> = {
  recharge_success: { type: "success", title: "充值成功" },
  recharge_failed: { type: "fail", title: "充值失败" },
  withdraw_success: { type: "success", title: "提现成功" },
  withdraw_failed: { type: "fail", title: "提现失败" },
  withdraw_cancelled: { type: "warning", title: "提现已取消" }
};

let source: EventSource | null = null;
let currentToken = "";
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectEnabled = false;

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function closeSource() {
  if (source) {
    source.close();
    source = null;
  }
}

function buildSseUrl(token: string) {
  const baseUrl = (import.meta.env.VITE_BASE_API || "").replace(/\/$/, "");
  return `${baseUrl}${SSE_PATH}?token=${encodeURIComponent(token)}`;
}

function pickFirstValue(data: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = data?.[key];

    if (value !== void 0 && value !== null && value !== "") {
      return value;
    }
  }

  return "";
}

function getOrderSummary(data: Record<string, any>) {
  const amount = pickFirstValue(data, ["money", "amount", "realMoney", "real_money", "pay_money", "withdrawMoney"]);
  const orderNo = pickFirstValue(data, ["order_sn", "orderNo", "order_no", "orderId", "id", "sn"]);
  const parts: string[] = [];

  if (amount !== "") {
    parts.push(`金额：${formatMoney(amount)}`);
  }

  if (orderNo !== "") {
    parts.push(`订单号：${orderNo}`);
  }

  return parts.length ? `\n${parts.join("\n")}` : "";
}

function handleFinanceMessage(message: SseMessage) {
  const config = financeMessageConfig[message.type];

  if (!config) {
    return;
  }

  useFinanceStore().setLastFinanceNotification(message);
  // showCustomToast({
  //   type: config.type,
  //   message: `${config.title}${getOrderSummary(message.data ?? {})}`,
  //   duration: 3000
  // });

  if (message.type === "withdraw_success") {
    bus.emit("showWithdrawSuccess", message.data ?? {});
  }
}

function dispatchSseMessage(message: SseMessage) {
  bus.emit("sseMessage", message);
  handleFinanceMessage(message);

  const handlers = messageHandlers.get(message.type);

  if (!handlers?.size) {
    return;
  }

  handlers.forEach(handler => {
    try {
      handler(message);
    } catch {
      return;
    }
  });
}

function handleMessageEvent(event: MessageEvent<string>) {
  try {
    const message = JSON.parse(event.data) as SseMessage;

    if (!message?.type) {
      return;
    }

    dispatchSseMessage(message);
  } catch {
    return;
  }
}

export function reconnectSse() {
  if (!reconnectEnabled || !currentToken || reconnectTimer) {
    return;
  }

  closeSource();
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;

    if (reconnectEnabled && currentToken) {
      connectSse(currentToken);
    }
  }, RECONNECT_DELAY);
}

export function connectSse(token: string) {
  const nextToken = token?.trim();

  clearReconnectTimer();
  closeSource();

  if (!nextToken) {
    currentToken = "";
    reconnectEnabled = false;
    return;
  }

  if (typeof EventSource === "undefined") {
    return;
  }

  currentToken = nextToken;
  reconnectEnabled = true;
  source = new EventSource(buildSseUrl(nextToken));
  source.addEventListener("message", handleMessageEvent as EventListener);
  source.addEventListener("error", reconnectSse);
}

export function disconnectSse() {
  reconnectEnabled = false;
  currentToken = "";
  clearReconnectTimer();
  closeSource();
}

export function subscribeSseMessage<T = any>(type: string, handler: SseMessageHandler<T>) {
  if (!messageHandlers.has(type)) {
    messageHandlers.set(type, new Set());
  }

  messageHandlers.get(type)?.add(handler as SseMessageHandler);
}

export function unsubscribeSseMessage<T = any>(type: string, handler: SseMessageHandler<T>) {
  const handlers = messageHandlers.get(type);

  if (!handlers) {
    return;
  }

  handlers.delete(handler as SseMessageHandler);

  if (!handlers.size) {
    messageHandlers.delete(type);
  }
}
