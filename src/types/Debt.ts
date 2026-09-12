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
  fundingAccountId?: string;
  type: DebtType;
  balance: number;
  originalBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  statementDate?: string;
  statementBalance?: number;
  statementReviewed?: boolean;
  statementReviewedAt?: string;
  activityHistory?: ActivityEntry[];
  creditLimit?: number;
  notes?: string;
  promoInterestRate?: number;
  promoEndDate?: string;
  promoDeferredInterest?: boolean;
  createdAt: string;
  updatedAt: string;
}