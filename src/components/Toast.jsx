import React from 'react';

const toastStyles = {
    success: {
        bg: 'bg-[var(--green-muted)]',
        border: 'border-[var(--green-up)]',
        icon: '✓',
        iconColor: 'text-[var(--green-up)]'
    },
    error: {
        bg: 'bg-[var(--red-muted)]',
        border: 'border-[var(--red-down)]',
        icon: '✕',
        iconColor: 'text-[var(--red-down)]'
    },
    warning: {
        bg: 'bg-[rgba(255,200,0,0.15)]',
        border: 'border-[#ffc800]',
        icon: '⚠',
        iconColor: 'text-[#ffc800]'
    },
    info: {
        bg: 'bg-[var(--accent-glow)]',
        border: 'border-[var(--accent-primary)]',
        icon: 'ℹ',
        iconColor: 'text-[var(--accent-primary)]'
    }
};

function ToastItem({ toast, onDismiss }) {
    const style = toastStyles[toast.type] || toastStyles.info;

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${style.bg} ${style.border} shadow-lg backdrop-blur-sm animate-slide-down mb-2 min-w-[300px] max-w-[420px]`}
        >
            <span className={`text-lg font-bold ${style.iconColor}`}>
                {style.icon}
            </span>
            <span className="flex-1 text-sm text-[var(--text-primary)] font-mono">
                {toast.message}
            </span>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export default function ToastContainer({ toasts, onDismiss }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
