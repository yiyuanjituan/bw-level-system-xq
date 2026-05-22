export type ReportCurrent = "1" | "2" | "3" | "4";

export type AccountTimeFilterMode = "today" | "yesterday" | "custom";

export interface SelectOption {
  label: string;
}

export interface AccountTimeRange {
  mode: AccountTimeFilterMode;
  label: string;
  startTime: number;
  endTime: number;
  startDate: string;
  endDate: string;
}

export interface SummaryItem {
  label: string;
  value: string | number;
  color?: "default" | "success" | "danger" | "warn";
}

export interface RecordItem {
  title: string;
  time: string;
  amount: number;
  amountPrefix?: string;
  remark: string;
  status: string;
  statusType: "success" | "danger" | "warn";
}
