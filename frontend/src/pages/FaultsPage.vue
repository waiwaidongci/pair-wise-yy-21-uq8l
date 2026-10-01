<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { FaultTypeText } from "../constants/FaultType";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { formatDate } from "../utils/formatters";
import type { FaultReport } from "../types/FaultReport";

const faultStore = useFaultReportStore();
const ticketStore = useRepairTicketStore();

const showForm = ref(false);
const form = ref({ reporter_name: "", phone: "", asset_id: 1, fault_type: "OUTAGE", address_desc: "", severity: "MEDIUM", report_channel: "PHONE" });

onMounted(async () => {
  await Promise.all([faultStore.load(), ticketStore.load()]);
});

const ticketByFault = computed(() => {
  const map = new Map<number, string>();
  for (const t of ticketStore.rows) map.set(t.fault_report_id, t.status);
  return map;
});

async function submit() {
  const payload: FaultReport = {
    id: 0,
    reporter_name: form.value.reporter_name,
    phone: form.value.phone,
    asset_id: Number(form.value.asset_id),
    fault_type: form.value.fault_type,
    address_desc: form.value.address_desc,
    severity: form.value.severity,
    report_channel: form.value.report_channel,
    status: "WAIT_DISPATCH"
  };
  await faultStore.create(payload);
  showForm.value = false;
}
</script>

<template>
  <div class="faults-page">
    <div class="toolbar">
      <button class="btn btn-primary" @click="showForm = !showForm">+ 登记报修</button>
    </div>

    <div v-if="showForm" class="panel form">
      <h3>登记故障报修</h3>
      <div class="grid">
        <div class="field"><label>报修人</label><input v-model="form.reporter_name" /></div>
        <div class="field"><label>电话</label><input v-model="form.phone" /></div>
        <div class="field"><label>资产ID</label><input v-model.number="form.asset_id" type="number" /></div>
        <div class="field"><label>故障类型</label>
          <select v-model="form.fault_type">
            <option v-for="(label, key) in FaultTypeText" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="field"><label>严重程度</label>
          <select v-model="form.severity">
            <option value="LOW">低</option><option value="MEDIUM">中</option><option value="HIGH">高</option><option value="CRITICAL">紧急</option>
          </select>
        </div>
        <div class="field"><label>渠道</label><input v-model="form.report_channel" /></div>
        <div class="field full"><label>地址</label><input v-model="form.address_desc" /></div>
      </div>
      <button class="btn btn-primary" @click="submit">提交报修</button>
    </div>

    <div class="panel">
      <h3>报修记录</h3>
      <table v-if="faultStore.rows.length">
        <thead><tr><th>编号</th><th>报修人</th><th>故障类型</th><th>地址</th><th>严重程度</th><th>工单状态</th><th>登记时间</th></tr></thead>
        <tbody>
          <tr v-for="f in faultStore.rows" :key="f.id">
            <td>#{{ f.id }}</td>
            <td>{{ f.reporter_name }}</td>
            <td>{{ FaultTypeText[f.fault_type as keyof typeof FaultTypeText] ?? f.fault_type }}</td>
            <td>{{ f.address_desc }}</td>
            <td><PriorityTag :value="f.severity" /></td>
            <td>
              <StatusBadge v-if="ticketByFault.has(f.id)" :value="ticketByFault.get(f.id)!" />
              <span v-else class="muted">未派工</span>
            </td>
            <td>{{ formatDate(f.reported_at ?? "") }}</td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-else text="暂无报修记录" />
    </div>
  </div>
</template>

<style scoped>
.faults-page { padding: 16px; }
.toolbar { margin-bottom: 12px; }
.btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; }
.btn-primary { background: #409eff; color: #fff; }
.panel { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.panel h3 { font-size: 15px; margin-bottom: 12px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: 13px; color: #606266; }
.field input, .field select { padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid #f0f2f5; }
th { color: #909399; font-weight: 500; }
.muted { color: #c0c4cc; }
</style>
