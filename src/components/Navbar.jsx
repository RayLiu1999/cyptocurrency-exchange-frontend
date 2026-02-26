import React, { useState } from 'react';
import SimulatorPanel from './SimulatorPanel';

export default function Navbar({ currentPrice, priceChange, balances = {}, selectedSymbol = 'BTC-USD', onSymbolChange, showToast }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const symbols = [
    { value: 'BTC-USD', label: 'BTC/USD', icon: '₿', color: 'orange-500' },
    { value: 'ETH-USD', label: 'ETH/USD', icon: 'Ξ', color: 'purple-400' }
  ];

  const currentSymbolData = symbols.find(s => s.value === selectedSymbol) || symbols[0];

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      {/* Logo */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
            <span className="text-[var(--bg-void)] font-bold text-lg">X</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight">CryptoX</span>
        </div>

        {/* Market Selector - Dropdown */}
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

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              />
              
              {/* Menu */}
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

      {/* Price Display */}
      <div className="flex items-center gap-4">
        {/* Simulator Panel */}
        <SimulatorPanel currentSymbol={selectedSymbol} showToast={showToast} />
        
        <div className="text-right">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-[var(--green-up)]">
              {currentPrice || '---'}
            </span>
            <span className={`font-mono text-sm ${priceChange?.startsWith('-') ? 'text-[var(--red-down)]' : 'text-[var(--green-up)]'}`}>
              {priceChange || ''}
            </span>
          </div>
          <span className="text-[var(--text-muted)] text-xs">標記價格</span>
        </div>

        {/* Account Balances */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-lg bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-xs">USD</span>
            <span className="font-mono text-sm text-[var(--text-primary)]">
              ${formatNumber(balances.USD, 2)}
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-xs">₿</span>
            <span className="font-mono text-sm text-[var(--text-primary)]">
              {formatNumber(balances.BTC, 4)}
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xs">Ξ</span>
            <span className="font-mono text-sm text-[var(--text-primary)]">
              {formatNumber(balances.ETH, 4)}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--green-muted)]">
          <div className="w-2 h-2 rounded-full bg-[var(--green-up)] animate-pulse"></div>
          <span className="text-[var(--green-up)] text-xs font-semibold">LIVE</span>
        </div>
      </div>
    </header>
  );
}
