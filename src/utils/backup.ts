export interface DebtCrusherBackup {
  app: "DebtCrusher";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

const STORAGE_PREFIX = "debtcrusher-";

export function createBackup(): DebtCrusherBackup {
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
    app: "DebtCrusher",
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
  link.download = `DebtCrusher-Backup-${today}.json`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function parseBackup(
  fileContents: string
): DebtCrusherBackup {
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
      "This is not a valid DebtCrusher backup."
    );
  }

  const backup =
    parsed as Partial<DebtCrusherBackup>;

  if (backup.app !== "DebtCrusher") {
    throw new Error(
      "This file was not created by DebtCrusher."
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
      "The backup does not contain valid DebtCrusher data."
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

  return backup as DebtCrusherBackup;
}

export function restoreBackup(
  backup: DebtCrusherBackup
) {
  // Remove existing DebtCrusher data only.
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