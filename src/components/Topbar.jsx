import React, { useState } from 'react';
import SimulatorPanel from './SimulatorPanel';
import { formatPrice, formatQty } from '../utils/format';
import { MODE_CONFIG, TRADING_MODES } from '../contexts/tradingEnvironmentConstants';
import { useTradingEnvironment } from '../contexts/useTradingEnvironment';

export default function Topbar({ currentPrice, priceChange, balances = {}, selectedSymbol = 'BTC-USD', onSymbolChange, showToast, isConnected = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { tradingMode, setTradingMode, modeConfig, isInternal } = useTradingEnvironment();

  const symbols = [
    { value: 'BTC-USD', label: 'BTC/USD', icon: '₿', color: 'orange-500' },
    { value: 'ETH-USD', label: 'ETH/USD', icon: 'Ξ', color: 'purple-400' }
  ];

  const currentSymbolData = symbols.find(s => s.value === selectedSymbol) || symbols[0];

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] mode-glow-border">
      {/* 左側：品牌名稱 + 模式切換 + 交易對選擇器 */}
      <div className="flex items-center gap-4">
        <span className="font-display font-bold text-lg tracking-tight">CryptoX</span>

        {/* 模式切換 Toggle */}
        <div className="flex items-center bg-[var(--bg-elevated)] rounded-lg p-0.5">
          {Object.values(TRADING_MODES).map((mode) => {
            const config = MODE_CONFIG[mode];
            const isActive = tradingMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setTradingMode(mode)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--mode-label-bg)] text-[var(--mode-label-text)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span>{config.badge}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* 模式標示徽章 */}
        <div className="mode-badge">
          {modeConfig.badge} {modeConfig.shortLabel}
        </div>

        {/* 交易對下拉選擇器 */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <span className={`w-6 h-6 rounded-full bg-${currentSymbolData.color}/20 flex items-center justify-center text-${currentSymbolData.color} text-xs font-bold`}>
              {currentSymbolData.icon}
            </span>
            <span className="font-display font-semibold">{currentSymbolData.label}</span>
            <svg
              className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 下拉選單 */}
          {isDropdownOpen && (
            <>
              {/* 背景遮罩 */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* 選單本體 */}
              <div className="absolute top-full left-0 mt-2 w-48 glass-panel p-2 z-20 animate-fade-in">
                {symbols.map((symbol) => (
                  <button
                    key={symbol.value}
                    onClick={() => {
                      onSymbolChange(symbol.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      selectedSymbol === symbol.value
                        ? 'bg-[var(--accent-glow)] text-[var(--accent-primary)]'
                        : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full bg-${symbol.color}/20 flex items-center justify-center text-${symbol.color} text-xs font-bold`}>
                      {symbol.icon}
                    </span>
                    <span className="font-display font-semibold">{symbol.label}</span>
                    {selectedSymbol === symbol.value && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 右側：價格 + 餘額 + 模擬器 + 連線狀態 */}
      <div className="flex items-center gap-6">
        {/* 模擬器按鈕 — 僅 Internal 模式顯示 */}
        {isInternal && (
          <div className="mr-2">
            <SimulatorPanel currentSymbol={selectedSymbol} showToast={showToast} />
          </div>
        )}

        {/* 即時價格 */}
        <div className="text-right flex flex-col items-end justify-center">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-[var(--green-up)]">
              {formatPrice(currentPrice) || '---'}
            </span>
            <span className={`font-mono text-sm ${priceChange?.startsWith('-') ? 'text-[var(--red-down)]' : 'text-[var(--green-up)]'}`}>
              {priceChange || ''}
            </span>
          </div>
          <span className="text-[var(--text-muted)] text-xs font-medium">標記價格 (Mark Price)</span>
        </div>

        {/* 帳戶餘額 */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-lg bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-xs">USD</span>
            <span className="font-mono text-sm text-[var(--text-primary)]">
              ${formatPrice(balances.USD)}
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-xs">₿</span>
            <span className="font-mono text-sm text-[var(--text-primary)]">
              {formatQty(balances.BTC, 4)}
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xs">Ξ</span>
            <span className="font-mono text-sm text-[var(--text-primary)]">
              {formatQty(balances.ETH, 4)}
            </span>
          </div>
        </div>

        {/* WebSocket 連線狀態 */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isConnected ? 'bg-[var(--green-muted)]' : 'bg-[var(--red-muted)]'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--green-up)] animate-pulse' : 'bg-[var(--red-down)]'}`}></div>
          <span className={`${isConnected ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]'} text-xs font-semibold`}>
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
    </header>
  );
}
