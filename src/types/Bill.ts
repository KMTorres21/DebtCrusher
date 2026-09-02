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
  | "Once"
  | "Weekly"
  | "Biweekly"
  | "Semimonthly"
  | "Monthly"
  | "Quarterly"
  | "Semiannually"
  | "Yearly";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  paid: boolean;
  recurring: boolean;
  frequency?: BillFrequency;
  autoPay: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
