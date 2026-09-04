export interface DebtBeGoneBackup {
  app: "DebtBeGone!!";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}
export interface BackupPreview {
  bills: number;
  debts: number;
  incomeSources: number;
  settings: boolean;
}

function countStoredArray(
  key: string
): number {
  const value = localStorage.getItem(key);

  if (!value) {
    return 0;
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.length
      : 0;
  } catch {
    return 0;
  }
}

export function getBackupPreview(): BackupPreview {
  return {
    bills: countStoredArray(
      "debtcrusher-bills"
    ),

    debts: countStoredArray(
      "debtcrusher-debts"
    ),

    incomeSources: countStoredArray(
      "debtcrusher_income"
    ),

    settings:
      localStorage.getItem(
        "debtbegone-display-settings"
      ) !== null,
  };
}


const STORAGE_PREFIXES = [
  "debtbegone-",
  "debtbegone_",
  "debtcrusher-",
  "debtcrusher_",
];
function isDebtBeGoneStorageKey(
  key: string
): boolean {
  return STORAGE_PREFIXES.some(
    prefix => key.startsWith(prefix));
}

export function createBackup(): DebtBeGoneBackup {
  const data: Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (!key || 
      !isDebtBeGoneStorageKey(key)
    ) {
      continue;
    }

import {
  downloadBackup,
  getBackupPreview,
  parseBackup,
  restoreBackup,
} from "../utils/backup";

    const value = localStorage.getItem(key);

    if (value !== null) {
      data[key] = value;
    }
  }

const backupPreview =
  getBackupPreview();

  return {
    app: "DebtBeGone!!",
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

<div className="mt-4 rounded-xl bg-slate-50 p-4">
  <p className="text-sm font-semibold text-slate-700">
    Backup Preview
  </p>

  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
    <div>
      <p className="text-slate-500">
        Bills
      </p>

      <p className="font-bold text-slate-900">
        {backupPreview.bills}
      </p>
    </div>

    <div>
      <p className="text-slate-500">
        Debts
      </p>

      <p className="font-bold text-slate-900">
        {backupPreview.debts}
      </p>
    </div>

    <div>
      <p className="text-slate-500">
        Income Sources
      </p>

      <p className="font-bold text-slate-900">
        {backupPreview.incomeSources}
      </p>
    </div>

    <div>
      <p className="text-slate-500">
        Settings
      </p>

      <p className="font-bold text-slate-900">
        {backupPreview.settings
          ? "Included"
          : "None"}
      </p>
    </div>
  </div>
</div>

export function downloadBackup() {
  const backup = createBackup();

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  link.href = url;
  link.download = `DebtBeGone!!-Backup-${today}.json`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function parseBackup(
  fileContents: string
): DebtBeGoneBackup {
  let parsed: unknown;

  try {
    parsed = JSON.parse(fileContents);
  } catch {
    throw new Error(
      "This file is not valid JSON."
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null
  ) {
    throw new Error(
      "This is not a valid DebtBeGone!! backup."
    );
  }

  const backup =
    parsed as Partial<DebtBeGoneBackup>;

  if (backup.app !== "DebtBeGone!!") {
    throw new Error(
      "This file was not created by DebtBeGone!!."
    );
  }

  if (backup.version !== 1) {
    throw new Error(
      "This backup version is not supported."
    );
  }

  if (
    !backup.data ||
    typeof backup.data !== "object" ||
    Array.isArray(backup.data)
  ) {
    throw new Error(
      "The backup does not contain valid DebtBeGone!! data."
    );
  }

  const backupData =
    backup.data as Record<string, string>;

  for (const [key, value] of Object.entries(
    backupData
  )) {
    if (!isDebtBeGoneStorageKey(key)) {
      throw new Error(
        `Invalid storage key found in backup: ${key}`
      );
    }

    if (typeof value !== "string") {
      throw new Error(
        `Invalid data found for ${key}.`
      );
    }
  }

  return backup as DebtBeGoneBackup;
}

export function restoreBackup(
  backup: DebtBeGoneBackup
) {
  // Remove existing DebtBeGone!! data only.
  // Other websites/app localStorage is untouched.
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (
      key &&
      isDebtBeGoneStorageKey(key)
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Restore the backup.
  Object.entries(backup.data).forEach(
    ([key, value]) => {
      localStorage.setItem(key, value);
    }
  );
}