import { computed, ref } from "vue";
import { ApiError } from "../api/client";
import { recoverFlow, submitFlow, type FlowSubmitPayload } from "../api/RepairTicket";
import type { FlowResult } from "../types/TicketFlowEvent";
import type { FlowAction } from "../constants/FlowAction";

// 离线队列：断网时把上报（含原请求号和现场序号）缓存在本地，恢复后按原请求号重试。
const QUEUE_KEY = "grid-repair.offline-queue";
const SEQ_KEY = "grid-repair.scene-seq";

export interface QueuedFlow extends FlowSubmitPayload {
  ticket_id: number;
  queued_at: string;
  last_error?: string;
}

const readQueue = (): QueuedFlow[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedFlow[];
  } catch {
    return [];
  }
};

const readSeqMap = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(SEQ_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
};

const queue = ref<QueuedFlow[]>(readQueue());
const lastResult = ref<FlowResult | null>(null);
const lastError = ref<{ code: string; message: string; details: unknown } | null>(null);

const persistQueue = () => localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.value));

// 现场序号：每个工单单调递增，离线期间也会占用序号，回所补传时保持现场顺序。
const nextSceneSeq = (ticketId: number): number => {
  const map = readSeqMap();
  const next = (map[String(ticketId)] ?? 0) + 1;
  map[String(ticketId)] = next;
  localStorage.setItem(SEQ_KEY, JSON.stringify(map));
  return next;
};

const newRequestId = (): string =>
  `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const isNetworkError = (err: unknown): boolean => err instanceof TypeError;

export function useTicketFlow() {
  const pendingCount = computed(() => queue.value.length);

  // 提交处置链动作。网络失败进入离线队列；业务错误（越权/对账拦截）直接抛出给页面。
  const submit = async (ticketId: number, action: FlowAction, note = ""): Promise<FlowResult | null> => {
    const payload: FlowSubmitPayload = {
      request_id: newRequestId(),
      scene_seq: nextSceneSeq(ticketId),
      action,
      note
    };
    try {
      const result = await submitFlow(ticketId, payload);
      lastResult.value = result;
      lastError.value = null;
      return result;
    } catch (err) {
      if (isNetworkError(err)) {
        queue.value = [...queue.value, { ...payload, ticket_id: ticketId, queued_at: new Date().toISOString() }];
        persistQueue();
        return null;
      }
      const apiErr = err as ApiError;
      lastError.value = { code: apiErr.code, message: apiErr.localizedMessage, details: apiErr.details };
      throw err;
    }
  };

  // 恢复重试：沿用离线时生成的原请求号，重复重试命中幂等，返回第一次结果。
  const flush = async (): Promise<{ done: number; failed: number }> => {
    let done = 0;
    let failed = 0;
    const remaining: QueuedFlow[] = [];
    for (const item of queue.value) {
      try {
        const result = await submitFlow(item.ticket_id, {
          request_id: item.request_id,
          scene_seq: item.scene_seq,
          action: item.action,
          note: item.note
        });
        lastResult.value = result;
        done += 1;
      } catch (err) {
        if (isNetworkError(err)) {
          remaining.push(item);
          continue;
        }
        // 业务错误（如已被更高状态覆盖为复核记录外的非法流转）不再重试，记录原因。
        failed += 1;
        lastError.value = {
          code: (err as ApiError).code,
          message: (err as ApiError).localizedMessage,
          details: (err as ApiError).details
        };
      }
    }
    queue.value = remaining;
    persistQueue();
    return { done, failed };
  };

  // 写失败后按原请求号恢复：直接查询服务端第一次落库的结果。
  const recover = async (requestId: string): Promise<FlowResult> => {
    const result = await recoverFlow(requestId);
    lastResult.value = result;
    return result;
  };

  const removeQueued = (requestId: string) => {
    queue.value = queue.value.filter((item) => item.request_id !== requestId);
    persistQueue();
  };

  return { queue, pendingCount, lastResult, lastError, submit, flush, recover, removeQueued };
}
