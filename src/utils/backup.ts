export interface DebtBeGoneBackup {
  app: "DebtBeGone!!";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

const STORAGE_PREFIX = "debtbegone-";

export function createBackup(): DebtBeGoneBackup {
  const data: Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (!key || !key.startsWith(STORAGE_PREFIX)) {
      continue;
    }

    const value = localStorage.getItem(key);

    if (value !== null) {
      data[key] = value;
    }
  }

  return {
    app: "DebtBeGone!!",
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

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

  for (const [key, value] of Object.entries(
    backup.data
  )) {
    if (!key.startsWith(STORAGE_PREFIX)) {
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
      key.startsWith(STORAGE_PREFIX)
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