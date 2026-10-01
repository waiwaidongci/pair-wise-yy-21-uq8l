import { computed, ref } from "vue";
import type { Crew } from "../types/Crew";

// 班组可用性：值班状态 + 当前工单
export function useCrewAvailability(rows: Crew[] = []) {
  const filter = ref<"ALL" | "ON_DUTY" | "BUSY">("ALL");

  const available = computed(() => rows.filter((c) => c.duty_status === "ON_DUTY" && !c.current_ticket_id));
  const busy = computed(() => rows.filter((c) => c.current_ticket_id));
  const onDuty = computed(() => rows.filter((c) => c.duty_status === "ON_DUTY"));

  const filtered = computed(() => {
    if (filter.value === "ON_DUTY") return onDuty.value;
    if (filter.value === "BUSY") return busy.value;
    return rows;
  });

  return { filter, available, busy, onDuty, filtered };
}
