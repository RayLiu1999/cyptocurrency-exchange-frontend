import React from 'react';

/**
 * PortfolioPage - 資產與風控監控（佔位頁面）
 * Stage 3 實作時將包含：資產分佈圖、執行中策略監控、全局風控水位
 */
export default function PortfolioPage() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--bg-void)]">
      <div className="text-center glass-panel p-12 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center mx-auto mb-6 opacity-60">
          <svg className="w-8 h-8 text-[var(--bg-void)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-2xl mb-3 text-gradient">資產與風控</h2>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          多交易所資產監控、執行中策略追蹤、全局風險水位管理。
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
