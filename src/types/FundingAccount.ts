export type FundingAccountType =
  | "Checking"
  | "Savings"
  | "Credit Card"
  | "Cash";

export interface FundingAccount {
  id: string;
  name: string;
  type: FundingAccountType;
  createdAt: string;
  updatedAt: string;
}