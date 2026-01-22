import React, { useState } from 'react';

export default function OrderForm({ onPlaceOrder, disabled, balances = {} }) {
  const [side, setSide] = useState('BUY');
  const [type, setType] = useState('LIMIT');
  const [price, setPrice] = useState('67432.50');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 根據買賣方向決定可用餘額
  const availableBalance = side === 'BUY'
    ? balances.USD || 0
    : balances.BTC || 0;

  const availableCurrency = side === 'BUY' ? 'USD' : 'BTC';

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const handleSubmit = async () => {
    if (!quantity || (type === 'LIMIT' && !price)) return;

    setIsSubmitting(true);
    try {
      await onPlaceOrder({
        symbol: 'BTC-USD',
        side,
        type,
        price: type === 'LIMIT' ? parseFloat(price) : 0,
        quantity: parseFloat(quantity)
      });
      setQuantity('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = type === 'LIMIT' && price && quantity
    ? (parseFloat(price) * parseFloat(quantity)).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '0.00';

  // 快捷百分比按鈕
  const handlePercentage = (pct) => {
    if (side === 'BUY') {
      // 買入：用 USD 換算成 BTC
      const usdAmount = availableBalance * (pct / 100);
      const currentPrice = parseFloat(price) || 67432.50;
      const btcAmount = usdAmount / currentPrice;
      setQuantity(btcAmount.toFixed(6));
    } else {
      // 賣出：直接用 BTC 餘額
      const btcAmount = availableBalance * (pct / 100);
      setQuantity(btcAmount.toFixed(6));
    }
  };

  return (
    <div className="p-4 border-t border-[var(--border-subtle)]">
      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setSide('BUY')}
          className={`py-3 font-display font-semibold rounded-lg transition-all ${side === 'BUY'
            ? 'bg-[var(--green-up)] text-[var(--bg-void)]'
            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
        >
          買入
        </button>
        <button
          onClick={() => setSide('SELL')}
          className={`py-3 font-display font-semibold rounded-lg transition-all ${side === 'SELL'
            ? 'bg-[var(--red-down)] text-white'
            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
        >
          賣出
        </button>
      </div>

      {/* Order Type */}
      <div className="flex gap-2 mb-4">
        {['LIMIT', 'MARKET'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${type === t
              ? 'bg-[var(--accent-glow)] text-[var(--accent-primary)] border border-[var(--border-accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
          >
            {t === 'LIMIT' ? '限價' : '市價'}
          </button>
        ))}
      </div>

      {/* Available Balance */}
      <div className="mb-3 flex justify-between text-xs">
        <span className="text-[var(--text-muted)]">可用餘額</span>
        <span className="font-mono text-[var(--accent-primary)]">
          {side === 'BUY'
            ? `$${formatNumber(availableBalance, 2)}`
            : `${formatNumber(availableBalance, 6)}`
          } {availableCurrency}
        </span>
      </div>

      {/* Price Input */}
      {type === 'LIMIT' && (
        <div className="mb-3">
          <label className="text-[var(--text-muted)] text-xs mb-1.5 block">價格</label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field w-full pr-16"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">USD</span>
          </div>
        </div>
      )}

      {/* Quantity Input */}
      <div className="mb-3">
        <label className="text-[var(--text-muted)] text-xs mb-1.5 block">數量</label>
        <div className="relative">
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.0000"
            className="input-field w-full pr-16"
            step="0.0001"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">BTC</span>
        </div>
      </div>

      {/* Quick Percentage Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            onClick={() => handlePercentage(pct)}
            className="py-1.5 text-xs font-mono rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="mb-4 p-3 rounded-lg bg-[var(--bg-elevated)]">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">預估總額</span>
          <span className="font-mono">{total} <span className="text-[var(--text-muted)]">USD</span></span>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || disabled || !quantity}
        className={`w-full py-3 font-display font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${side === 'BUY' ? 'btn-buy' : 'btn-sell'
          }`}
      >
        {isSubmitting ? '處理中...' : (side === 'BUY' ? '買入 BTC' : '賣出 BTC')}
      </button>
    </div>
  );
}
