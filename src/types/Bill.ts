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

export interface Bill {
  id: string;

  name: string;
  amount: number;

  dueDate: string; // YYYY-MM-DD

  category: BillCategory;

  recurring: boolean;

  paid: boolean;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}