export const formatDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-CN");
};

export const formatStatus = (value: string): string => value.replace(/_/g, " ");

export const formatNumber = (value: number): string => new Intl.NumberFormat("zh-CN").format(value);

export const formatPhone = (value: string | null | undefined): string => {
  if (!value) return "—";
  return value.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
};

export const formatRisk = (value: string): string =>
  ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "紧急", EXTREME: "极高" }[value] ?? value);

export const formatQuantity = (value: number): string => `${formatNumber(value)} 件`;
