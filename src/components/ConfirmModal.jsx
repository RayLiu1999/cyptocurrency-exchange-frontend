import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmModal({ isOpen, onClose, onConfirm, orderData, loading = false }) {
    // ESC 鍵關閉
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // 避免背景捲動
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const { symbol, side, type, price, quantity } = orderData;
    
    // 解析交易對
    const [base, quote] = symbol ? symbol.split('-') : ['BTC', 'USD'];
    
    // 計算總額
    const total = type === 'LIMIT' && price && quantity
        ? (parseFloat(price) * parseFloat(quantity)).toFixed(2)
        : '市價執行';

    const isBuy = side === 'BUY';

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative glass-panel p-6 w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold">確認{isBuy ? '買入' : '賣出'}</h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Order Details */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] text-sm">交易對</span>
                        <span className="font-mono font-semibold">{symbol}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] text-sm">方向</span>
                        <span className={`font-semibold ${isBuy ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]'}`}>
                            {isBuy ? '買入' : '賣出'}
                        </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] text-sm">類型</span>
                        <span className="font-mono">{type === 'LIMIT' ? '限價單' : '市價單'}</span>
                    </div>

                    {type === 'LIMIT' && (
                        <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                            <span className="text-[var(--text-muted)] text-sm">價格</span>
                            <span className="font-mono">{parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2 })} {quote}</span>
                        </div>
                    )}

                    <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] text-sm">數量</span>
                        <span className="font-mono">{parseFloat(quantity).toFixed(6)} {base}</span>
                    </div>

                    <div className="flex justify-between py-3 bg-[var(--bg-elevated)] rounded-lg px-3 mt-4">
                        <span className="text-[var(--text-secondary)] font-semibold">預估總額</span>
                        <span className="font-mono font-bold text-lg">
                            {type === 'LIMIT' ? `${parseFloat(total).toLocaleString('en-US')} ${quote}` : '市價執行'}
                        </span>
                    </div>
                </div>

                {/* Warning */}
                <div className="mb-6 p-3 rounded-lg bg-[rgba(255,200,0,0.1)] border border-[rgba(255,200,0,0.3)]">
                    <p className="text-xs text-[#ffc800] flex items-start gap-2">
                        <span className="text-base">⚠</span>
                        <span>請仔細核對訂單資訊，送出後將立即執行撮合</span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] font-display font-semibold hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isBuy ? 'btn-buy' : 'btn-sell'
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>處理中...</span>
                            </div>
                        ) : (
                            `確認${isBuy ? '買入' : '賣出'}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    const portalTarget = document.getElementById('modal-root') || document.body;
    return createPortal(modalContent, portalTarget);
}
