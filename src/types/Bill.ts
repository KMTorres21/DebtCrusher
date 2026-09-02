export type BillCategory =
  | "Housing"
  | "Utilities"
  | "Insurance"
  | "Phone"
  | "Internet"
  | "Credit Card"
  | "Loan"
  | "Subscription"
  | "Medical"
  | "Transportation"
  | "Other";

export type BillFrequency =
  | "once"
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly"
  | "quarterly"
  | "semiannually"
  | "yearly";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  paid: boolean;
  recurring: boolean;
  frequency?: BillFrequency;
    semiMonthlyDay1?: number;
    semiMonthlyDay2?: number;
  autoPay: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
