export type BillFundingMode =
  | "together"
  | "large-bills"
  | "always-split";

export interface PaydayStrategySettings {
  billFundingMode: BillFundingMode;
  largeBillThreshold: number;
  protectedPaycheckAmount: number;
}

export const DEFAULT_PAYDAY_STRATEGY_SETTINGS: PaydayStrategySettings = {
  billFundingMode: "large-bills",
  largeBillThreshold: 67,
  protectedPaycheckAmount: 0,
};