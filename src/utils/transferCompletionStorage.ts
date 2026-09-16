const STORAGE_KEY =
  "debtbegone_transfer_completions";

export interface TransferCompletion {
  payday: string;
  fundingAccountId: string;
  completed: boolean;
}

export function getTransferCompletions(): TransferCompletion[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    return stored
      ? JSON.parse(stored)
      : [];
  } catch {
    return [];
  }
}

export function saveTransferCompletions(
  completions: TransferCompletion[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      completions
    )
  );
}