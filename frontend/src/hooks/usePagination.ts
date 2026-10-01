import { computed, ref } from "vue";

// 通用分页
export function usePagination<T>(rows: T[] = [], pageSize = 8) {
  const page = ref(1);
  const totalPages = computed(() => Math.max(1, Math.ceil(rows.length / pageSize)));
  const pageRows = computed(() => rows.slice((page.value - 1) * pageSize, page.value * pageSize));
  const total = rows.length;

  function setPage(p: number) {
    page.value = Math.min(Math.max(1, p), totalPages.value);
  }

  return { page, pageSize, pageRows, total, totalPages, setPage };
}
