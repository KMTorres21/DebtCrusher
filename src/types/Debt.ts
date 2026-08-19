export type DebtType =
  | "Credit Card"
  | "Personal Loan"
  | "Auto Loan"
  | "Student Loan"
  | "Mortgage"
  | "HELOC"
  | "Medical"
  | "Other";

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  balance: number;
  originalBalance: number;
  creditLimit?: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
