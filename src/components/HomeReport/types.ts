export type ReportCurrent = "1" | "2" | "3" | "4";

export interface SelectOption {
  label: string;
}

export interface SummaryItem {
  label: string;
  value: number;
  color: "success" | "danger" | "warn";
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
