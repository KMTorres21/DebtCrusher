export interface CalendarEvent {
  id: string;
  date: string;

  type: "bill" | "income" | "debt";

  title: string;

  amount: number;

  paid?: boolean;
}