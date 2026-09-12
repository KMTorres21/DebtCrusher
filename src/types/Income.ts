export interface Income {
  id: string;
  source: string;
  amount: number;
  fundingAccountId?: string;

  frequency:
    | "weekly"
    | "biweekly"
    | "semimonthly"
    | "monthly"
    | "onetime";

  nextPayDate: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}