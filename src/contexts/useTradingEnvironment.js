import { useContext } from 'react';
import { TradingEnvironmentContext } from './tradingEnvironmentStore';

export function useTradingEnvironment() {
  const context = useContext(TradingEnvironmentContext);
  if (!context) {
    throw new Error('useTradingEnvironment 必須在 TradingEnvironmentProvider 內使用');
  }
  return context;
}