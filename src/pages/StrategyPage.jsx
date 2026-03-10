import React from 'react';

/**
 * StrategyPage - 策略編輯器（佔位頁面）
 * Stage 3 實作時將包含：策略清單、參數設定區、執行面板
 */
export default function StrategyPage() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--bg-void)]">
      <div className="text-center glass-panel p-12 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center mx-auto mb-6 opacity-60">
          <svg className="w-8 h-8 text-[var(--bg-void)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="font-display font-bold text-2xl mb-3 text-gradient">策略編輯器</h2>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          配置與管理量化交易策略（MA Cross、RSI、Grid 等）。
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
