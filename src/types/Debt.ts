import { ActivityEntry } from "./ActivityEntry";

export type DebtType =
  | "Credit Card"
  | "Auto Loan"
  | "Personal Loan"
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

  interestRate: number;
  minimumPayment: number;

  dueDate: string;

  statementDate?: string;
  statementBalance?: number;
  statementReviewed?: boolean;
  statementReviewedAt?: ActivityEntry[];
  activityHistory?: ActivityEntry[];
  creditLimit?: number;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}