import { useState } from "react";
import {
  PayoffStrategy,
} from "../utils/debtPayoff";

const STORAGE_KEY =
  "debtcrusher-debt-payoff-settings";

export interface DebtPayoffSettings {
  strategy: PayoffStrategy;
  extraPayment: number;
}

const DEFAULT_SETTINGS: DebtPayoffSettings = {
  strategy: "avalanche",
  extraPayment: 0,
};

function loadSettings(): DebtPayoffSettings {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {
        ...DEFAULT_SETTINGS,
      };
    }

    const parsed =
      JSON.parse(stored);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return {
      ...DEFAULT_SETTINGS,
    };
  }
}

export function useDebtPayoffSettings() {
  const [settings, setSettingsState] =
    useState<DebtPayoffSettings>(
      loadSettings
    );

  function setSettings(
    updates: Partial<DebtPayoffSettings>
  ) {
    setSettingsState((current) => {
      const next = {
        ...current,
        ...updates,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );

      return next;
    });
  }

  function resetSettings() {
    const defaults = {
      ...DEFAULT_SETTINGS,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaults)
    );

    setSettingsState(defaults);
  }

  return {
    settings,
    setSettings,
    resetSettings,
  };
}