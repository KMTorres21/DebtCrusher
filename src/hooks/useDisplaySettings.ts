import { useEffect, useState } from "react";

const STORAGE_KEY =
  "debtbegone-display-settings";

export interface DisplaySettings {
  showBillStatementDate: boolean;
}

const DEFAULT_SETTINGS: DisplaySettings = {
  showBillStatementDate: true,
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
  const [settings, setSettingsState] =
    useState<DisplaySettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

  function setSettings(
    updates: Partial<DisplaySettings>
  ) {
    setSettingsState((current) => ({
      ...current,
      ...updates,
    }));
  }

  return {
    settings,
    setSettings,
  };
}