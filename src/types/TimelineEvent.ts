export type TimelineEventType =
  | "income"
  | "bill"
  | "debt";

export interface TimelineEvent {
  id: string;

  date: string;

  type: TimelineEventType;

  title: string;

  amount: number;

  runningBalance?: number;
}