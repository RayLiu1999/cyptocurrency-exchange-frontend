import React, { useState, useEffect, useMemo, useRef } from 'react';
import ConfirmModal from './ConfirmModal';
import { formatPrice, formatQty, formatTotal } from '../utils/format';

export default function OrderForm({ onPlaceOrder, disabled, balances = {}, symbol = 'BTC-USD', asks = [], bids = [] }) {
  const [side, setSide] = useState('BUY');
  const [type, setType] = useState('LIMIT');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 記錄使用者是否自行修改過價格，不覆蓋手動輸入
  const priceManuallyEdited = useRef(false);

  // 最佳買價：bids[0]，最佳賣價：asks[0]
  const bestBid = useMemo(() => bids.length > 0 ? parseFloat(bids[0].price) : null, [bids]);
  const bestAsk = useMemo(() => asks.length > 0 ? parseFloat(asks[0].price) : null, [asks]);

  // 自動帶入價格：僅在未手動編輯時才會覆蓋
  // 使用「對手盤最佳價」作為初始參考，讓使用者快速送出可立即成交的單
  // 若對手盤沒有報價，就 fallback 到同方向的 best price
  useEffect(() => {
    if (type !== 'LIMIT') return;
    if (priceManuallyEdited.current) return; // 使用者自行輸入後就不再自動帶入

    // BUY 想立即成交 → 掛在 bestAsk 以上； SELL 想立即成交 → 掛在 bestBid 以下
    // 但作為「預設價格」，直接帶入對手盤最佳價是最合理的
    let refPrice = side === 'BUY' ? bestBid : bestAsk;
    if (!refPrice || refPrice <= 0) {
      refPrice = side === 'BUY' ? bestAsk : bestBid;
    }

    if (refPrice != null && refPrice > 0) {
      setPrice(refPrice.toFixed(2));
    } else {
      setPrice('');
    }
  }, [side, type, bestAsk, bestBid]);

  // 當前有效價格（用於計算 total 和百分比按鈕）
  // 這裡同樣做一個 Fallback，如果自己的對手盤沒有價格，就用另一邊來估算
  const effectivePrice = (() => {
    const p = parseFloat(price);
    if (!isNaN(p) && p > 0) return p;
    const p1 = side === 'BUY' ? bestAsk : bestBid;
    if (p1 > 0) return p1;
    const p2 = side === 'BUY' ? bestBid : bestAsk;
    if (p2 > 0) return p2;
    return null;
  })();

  // 解析交易對
  const [base, quote] = symbol.split('-');

  // 根據買賣方向決定可用餘額
  const availableBalance = side === 'BUY'
    ? balances[quote] || 0
    : balances[base] || 0;

  const availableCurrency = side === 'BUY' ? quote : base;


  const handleSubmit = async () => {
    if (!quantity || (type === 'LIMIT' && !price)) return;
    // 打開確認視窗
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      await onPlaceOrder({
        symbol: symbol,
        side,
        type,
        price: type === 'LIMIT' ? parseFloat(price) : 0,
        quantity: parseFloat(quantity)
      });
      setQuantity('');
      setShowConfirmModal(false);
    } catch (err) {
      console.error(err);
      // 錯誤由 App.jsx 處理
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = (() => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return '0.00';
    return effectivePrice > 0 ? formatTotal(effectivePrice, qty) : (type === 'MARKET' ? '市價估算中...' : '0.00');
  })();

  // 快捷百分比按鈕
  const handlePercentage = (pct) => {
    if (side === 'BUY') {
      if (!effectivePrice || effectivePrice <= 0) return; // 無市價資料時不動作
      const quoteAmount = availableBalance * (pct / 100);
      setQuantity((quoteAmount / effectivePrice).toFixed(6));
    } else {
      setQuantity((availableBalance * (pct / 100)).toFixed(6));
    }
  };

  return (
    <div className="p-4 border-t border-[var(--border-subtle)]">
      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => { setSide('BUY'); setQuantity(''); priceManuallyEdited.current = false; }}
          className={`py-3 font-display font-semibold rounded-lg transition-all ${side === 'BUY'
            ? 'bg-[var(--green-up)] text-[var(--bg-void)]'
            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            }`}
        >
          買進
        </button>
        <button
          onClick={() => { setSide('SELL'); setQuantity(''); priceManuallyEdited.current = false; }}
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
            ? `$${formatPrice(availableBalance)}`
            : `${formatQty(availableBalance, 6)}`
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
              onChange={(e) => { priceManuallyEdited.current = true; setPrice(e.target.value); }}
              className="input-field w-full pr-16"
              placeholder={bestAsk || bestBid ? (side === 'BUY' ? bestAsk?.toFixed(2) : bestBid?.toFixed(2)) : '市價載入中...'}
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">{quote}</span>
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
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">{base}</span>
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
          <span className="font-mono">{total} <span className="text-[var(--text-muted)]">{quote}</span></span>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || disabled || !quantity}
        className={`w-full py-3 font-display font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${side === 'BUY' ? 'btn-buy' : 'btn-sell'
          }`}
      >
        {isSubmitting ? '處理中...' : (side === 'BUY' ? `買進 ${base}` : `賣出 ${base}`)}
      </button>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmOrder}
        orderData={{ symbol, side, type, price, quantity }}
        loading={isSubmitting}
      />
    </div>
  );
}
