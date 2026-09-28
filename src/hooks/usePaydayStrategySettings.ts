import { useState } from "react";

import {
  PaydayStrategySettings,
  DEFAULT_PAYDAY_STRATEGY_SETTINGS,
} from "../types/PaydayStrategySettings";

const STORAGE_KEY =
  "debtcrusher-payday-strategy-settings";

function loadSettings(): PaydayStrategySettings {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return {
        ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
      };
    }

    const parsed =
      JSON.parse(stored);

    return {
      ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
      ...parsed,
    };
  } catch {
    return {
      ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
    };
  }
}

export function usePaydayStrategySettings() {
  const [settings, setSettingsState] =
    useState<PaydayStrategySettings>(
      loadSettings
    );

  function setSettings(
    updates: Partial<PaydayStrategySettings>
  ) {
    setSettingsState(
      (current) => {
        const next = {
          ...current,
          ...updates,
        };

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(next)
        );

        return next;
      }
    );
  }

  function resetSettings() {
    const defaults = {
      ...DEFAULT_PAYDAY_STRATEGY_SETTINGS,
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