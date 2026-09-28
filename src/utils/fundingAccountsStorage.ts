import { FundingAccount } from "../types/FundingAccount";

const STORAGE_KEY =
  "debtbegone_funding_accounts";

export function getFundingAccounts(): FundingAccount[] {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveFundingAccounts(
  accounts: FundingAccount[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(accounts)
  );
}