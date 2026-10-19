export type BillFundingMode =
  | "together"
  | "large-bills"
  | "always-split";

export interface PaydayStrategySettings {
  billFundingMode: BillFundingMode;
  largeBillThreshold: number;
}

export const DEFAULT_PAYDAY_STRATEGY_SETTINGS: PaydayStrategySettings = {
  billFundingMode: "large-bills",
  largeBillThreshold: 67,
};