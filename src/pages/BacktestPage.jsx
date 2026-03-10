import React from 'react';

/**
 * BacktestPage - 回測中心（佔位頁面）
 * Stage 3 實作時將包含：KPI 指標卡片、淨值曲線圖、交易明細表
 */
export default function BacktestPage() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--bg-void)]">
      <div className="text-center glass-panel p-12 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center mx-auto mb-6 opacity-60">
          <svg className="w-8 h-8 text-[var(--bg-void)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-2xl mb-3 text-gradient">回測中心</h2>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          歷史數據回放與策略績效分析（夏普比率、最大回撤等）。
          <br />此功能將於 Stage 3 開放。
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)] animate-pulse"></div>
          COMING SOON
        </div>
      </div>
    </div>
  );
}
