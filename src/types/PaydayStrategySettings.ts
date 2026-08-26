export type PaydayBillFundingMode =
  | "together"
  | "large-bills"
  | "always-split";

export interface PaydayStrategySettings {
  billFundingMode: PaydayBillFundingMode;
  largeBillThreshold: number;

  debtSafetyNetEnabled: boolean;
  debtSafetyNetAmount: number;
}

export const DEFAULT_PAYDAY_STRATEGY_SETTINGS: 
PaydayStrategySettings = {
  billFundingMode: "large-bills",
  largeBillThreshold: 67,

  debtSafetyNetEnabled: false,
  debtSafetyNetAmount: 500,
};