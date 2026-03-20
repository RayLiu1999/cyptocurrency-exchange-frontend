import React, { useState, useCallback } from 'react';
import { MODE_CONFIG, TRADING_MODES } from './tradingEnvironmentConstants';
import { TradingEnvironmentContext } from './tradingEnvironmentStore';

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
