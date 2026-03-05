import React from 'react';
import { formatPrice, formatQty, formatTotal } from '../utils/format';

export default function OrderBook({ bids = [], asks = [] }) {

  // Calculate max quantity for depth visualization
  const allQtys = [...bids.map(b => b.quantity), ...asks.map(a => a.quantity)];
  const maxQty = Math.max(...allQtys, 1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <h3 className="font-display font-semibold text-sm">Order Book</h3>
        <div className="flex gap-1">
          <button className="w-6 h-6 rounded bg-[var(--bg-hover)] flex items-center justify-center">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
              <rect y="0" width="12" height="4" className="fill-[var(--green-up)]" />
              <rect y="6" width="12" height="4" className="fill-[var(--red-down)]" />
            </svg>
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-4 py-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sells) - reversed order, from low to high */}
      <div className="flex-1 overflow-auto flex flex-col-reverse">
        {(asks.length > 0 ? asks.slice(0, 10) : [{ price: 67435.50, quantity: 0.5432 }, { price: 67435.00, quantity: 0.1234 }]).map((ask, i) => (
          <div
            key={`ask-${i}`}
            className="grid grid-cols-3 px-4 py-1 text-xs font-mono relative hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-[var(--red-down)] opacity-10 pointer-events-none"
              style={{ width: `${(ask.quantity / maxQty) * 100}%` }}
            />
            <span className="text-[var(--red-down)] relative z-10">{formatPrice(ask.price)}</span>
            <span className="text-right text-[var(--text-secondary)] relative z-10">{formatQty(ask.quantity)}</span>
            <span className="text-right text-[var(--text-muted)] relative z-10">{formatTotal(ask.price, ask.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Spread / Current Price */}
      <div className="px-4 py-3 border-y border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <div className="flex items-center justify-between">
          <span className="text-xl font-mono font-semibold text-[var(--green-up)]">
            {bids[0]?.price ? formatPrice(bids[0].price) : '67,432.50'}
          </span>
          <span className="text-[var(--text-muted)] text-xs">Spread: 0.01%</span>
        </div>
      </div>

      {/* Bids (Buys) */}
      <div className="flex-1 overflow-auto">
        {(bids.length > 0 ? bids.slice(0, 10) : [{ price: 67432.50, quantity: 0.4231 }, { price: 67432.00, quantity: 1.2034 }]).map((bid, i) => (
          <div
            key={`bid-${i}`}
            className="grid grid-cols-3 px-4 py-1 text-xs font-mono relative hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-[var(--green-up)] opacity-10 pointer-events-none"
              style={{ width: `${(bid.quantity / maxQty) * 100}%` }}
            />
            <span className="text-[var(--green-up)] relative z-10">{formatPrice(bid.price)}</span>
            <span className="text-right text-[var(--text-secondary)] relative z-10">{formatQty(bid.quantity)}</span>
            <span className="text-right text-[var(--text-muted)] relative z-10">{formatTotal(bid.price, bid.quantity)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
