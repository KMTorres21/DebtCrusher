export interface Income {
  id: string;
  source: string;
  amount: number;

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