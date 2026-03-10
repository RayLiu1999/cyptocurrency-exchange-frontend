import React from 'react';
import { formatPrice, formatQty } from '../utils/format';

export default function TradeHistory({ trades = [], loading = false }) {
  const formatTime = (timeVal) => {
    if (timeVal == null) return '--:--:--';
    try {
      // 後端回傳 Unix 毫秒整數，直接用 new Date(ms)
      const date = typeof timeVal === 'number' ? new Date(timeVal) : new Date(timeVal);
      return date.toLocaleTimeString('zh-TW', { hour12: false });
    } catch {
      return String(timeVal);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <h3 className="font-display font-semibold text-sm">最新成交</h3>
        {loading && (
          <span className="text-[var(--text-muted)] text-xs animate-pulse">載入中...</span>
        )}
      </div>

      <div className="grid grid-cols-3 px-4 py-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
        <span>價格</span>
        <span className="text-right">數量</span>
        <span className="text-right">時間</span>
      </div>

      <div className="flex-1 overflow-auto">
        {trades.length === 0 && !loading && (
          <div className="flex items-center justify-center h-20 text-[var(--text-muted)] text-sm">
            等待成交...
          </div>
        )}
        {trades.map((trade, i) => (
          <div
            key={trade.id || i}
            className="grid grid-cols-3 px-4 py-1.5 text-xs font-mono hover:bg-[var(--bg-hover)] transition-colors"
          >
            <span className={trade.side === 'BUY' ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]'}>
              {formatPrice(trade.price)}
            </span>
            <span className="text-right text-[var(--text-secondary)]">
              {formatQty(trade.quantity)}
            </span>
            <span className="text-right text-[var(--text-muted)]">
              {formatTime(trade.time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
