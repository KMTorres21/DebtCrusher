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
  dueDate: string;
  category: BillCategory;
  paid: boolean;
  recurring: boolean;
  autoPay: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
