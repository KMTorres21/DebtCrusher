import { useEffect, useState } from "react";

const STORAGE_KEY =
  "debtbegone-display-settings";

export interface DisplaySettings {
  showBillStatementDate: boolean;
  showDebtStatementDate: boolean;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  showBillStatementDate: true,
  showDebtStatementDate: true,
};

function loadSettings(): DisplaySettings {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(stored),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useDisplaySettings() {
  const [displaySettings, setSettingsState] =
    useState<DisplaySettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(displaySettings)
    );
  }, [displaySettings]);

  function updateSettings(
    updates: Partial<DisplaySettings>
  ) {
    setSettingsState((current) => ({
      ...current,
      ...updates,
    }));
  }

  return {
    displaySettings,
    updateSettings,
  };
}