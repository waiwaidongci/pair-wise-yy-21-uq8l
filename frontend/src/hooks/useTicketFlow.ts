import { ref, computed, unref, type MaybeRef } from "vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useAuthStore } from "../stores/AuthStore";
import { genRequestId } from "../api/request";
import type { TicketAction, TransitionResult } from "../types/RepairTicket";
import { nextAction, TicketActionText } from "../constants/TicketStatus";

interface PendingOp {
  requestId: string;
  ticketId: number;
  action: TicketAction;
  siteSeq: number;
  note: string;
  status: "pending" | "done" | "failed";
  result?: TransitionResult;
}

// 处置链 hook：管理现场序号、离线队列、按原请求号恢复
// ticketId 为响应式引用，切换工单时自动跟随
export function useTicketFlow(ticketIdRef: MaybeRef<number | null>) {
  const store = useRepairTicketStore();
  const auth = useAuthStore();

  const pending = ref<PendingOp[]>([]);
  const lastResult = ref<TransitionResult | null>(null);
  const submitting = ref(false);

  const ticketId = computed(() => unref(ticketIdRef));
  const currentTicket = computed(() => (ticketId.value ? store.byId(ticketId.value) : undefined));
  const siteSeq = computed(() => currentTicket.value?.site_seq ?? 0);
  const suggestedAction = computed(() => (currentTicket.value ? nextAction(currentTicket.value.status) : undefined));
  const suggestedActionText = computed(() => (suggestedAction.value ? TicketActionText[suggestedAction.value] : ""));

  // 执行处置动作（自动带原请求号 + 现场序号）
  async function advance(action: TicketAction, note = ""): Promise<TransitionResult> {
    if (!ticketId.value) throw new Error("未选择工单");
    submitting.value = true;
    const requestId = genRequestId();
    const op: PendingOp = {
      requestId,
      ticketId: ticketId.value,
      action,
      siteSeq: siteSeq.value + 1,
      note,
      status: "pending"
    };
    pending.value.push(op);
    try {
      const result = await store.advance(ticketId.value, action, op.siteSeq, note);
      op.status = result.applied ? "done" : "failed";
      op.result = result;
      lastResult.value = result;
      return result;
    } catch (err) {
      op.status = "failed";
      lastResult.value = null;
      throw err;
    } finally {
      submitting.value = false;
    }
  }

  // 按原请求号重试（沿用第一次结果）
  async function retry(op: PendingOp): Promise<TransitionResult> {
    if (!ticketId.value) throw new Error("未选择工单");
    submitting.value = true;
    try {
      const result = await store.advance(ticketId.value, op.action, op.siteSeq, op.note);
      op.status = result.applied ? "done" : "failed";
      op.result = result;
      lastResult.value = result;
      return result;
    } finally {
      submitting.value = false;
    }
  }

  return {
    pending,
    lastResult,
    submitting,
    siteSeq,
    currentTicket,
    suggestedAction,
    suggestedActionText,
    advance,
    retry
  };
}
