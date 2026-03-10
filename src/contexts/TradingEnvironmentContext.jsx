import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * 交易環境模式定義
 * INTERNAL: 系統模擬 — 使用 Go 後端隨機行情，完全本地可控
 * PAPER:    市場模擬 — 使用 CCXT 真實行情，模擬下單（不動真錢）
 */
export const TRADING_MODES = {
  INTERNAL: 'INTERNAL',
  PAPER: 'PAPER',
};

// 各模式的 metadata，供 UI 使用
export const MODE_CONFIG = {
  [TRADING_MODES.INTERNAL]: {
    label: '系統模擬',
    shortLabel: 'SIM',
    description: '使用內建撮合引擎產生的模擬行情',
    badge: '🔧',
    accentHue: '263',      // 靛紫色 hue
  },
  [TRADING_MODES.PAPER]: {
    label: '市場模擬',
    shortLabel: 'PAPER',
    description: '串接 CCXT 即時市場行情，模擬下單',
    badge: '📡',
    accentHue: '155',      // 青綠色 hue
  },
};

const TradingEnvironmentContext = createContext(null);

export function TradingEnvironmentProvider({ children }) {
  // 從 localStorage 讀取上次選擇的模式，預設為 INTERNAL
  const [tradingMode, setTradingModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('tradingMode');
      return saved && TRADING_MODES[saved] ? saved : TRADING_MODES.INTERNAL;
    } catch {
      return TRADING_MODES.INTERNAL;
    }
  });

  // 切換模式並持久化
  const setTradingMode = useCallback((mode) => {
    if (!TRADING_MODES[mode]) return;
    setTradingModeState(mode);
    try {
      localStorage.setItem('tradingMode', mode);
    } catch {
      // localStorage 不可用時靜默忽略
    }
  }, []);

  // 取得當前模式的 metadata
  const modeConfig = MODE_CONFIG[tradingMode];

  // 是否為內部模擬模式
  const isInternal = tradingMode === TRADING_MODES.INTERNAL;

  // 是否為市場模擬模式
  const isPaper = tradingMode === TRADING_MODES.PAPER;

  return (
    <TradingEnvironmentContext.Provider
      value={{
        tradingMode,
        setTradingMode,
        modeConfig,
        isInternal,
        isPaper,
        TRADING_MODES,
        MODE_CONFIG,
      }}
    >
      {children}
    </TradingEnvironmentContext.Provider>
  );
}

/**
 * useTradingEnvironment - 讀取當前交易環境 Context
 * 必須在 TradingEnvironmentProvider 內部使用
 */
export function useTradingEnvironment() {
  const context = useContext(TradingEnvironmentContext);
  if (!context) {
    throw new Error('useTradingEnvironment 必須在 TradingEnvironmentProvider 內使用');
  }
  return context;
}
