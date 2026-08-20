import dayjs from "dayjs";

export interface ClaimDateRangeValue {
  mode: "today" | "yesterday" | "custom";
  startTime: number;
  endTime: number;
  startDate: string;
  endDate: string;
}

export function createClaimDefaultRange(): ClaimDateRangeValue {
  const startDay = dayjs().subtract(29, "day").startOf("day");
  const endDay = dayjs().subtract(1, "day").endOf("day");

  return {
    mode: "custom",
    startTime: startDay.unix(),
    endTime: endDay.unix(),
    startDate: startDay.format("YYYY-MM-DD"),
    endDate: endDay.format("YYYY-MM-DD")
  };
}
