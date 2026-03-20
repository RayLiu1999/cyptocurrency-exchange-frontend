import React, { useState, useCallback } from 'react';
import { useTradingEnvironment } from '../contexts/useTradingEnvironment';

/**
 * 內建策略模板清單
 * 每個策略包含：名稱、描述、類型、可調參數定義
 */
const STRATEGY_TEMPLATES = [
  {
    id: 'ma_cross',
    name: 'MA Crossover',
    description: '當短期均線上穿長期均線時買入，下穿時賣出。經典趨勢追蹤策略。',
    category: '趨勢追蹤',
    icon: '📈',
    params: [
      { key: 'shortPeriod', label: '短期 MA 週期', type: 'number', min: 2, max: 50, step: 1, defaultValue: 7 },
      { key: 'longPeriod', label: '長期 MA 週期', type: 'number', min: 10, max: 200, step: 1, defaultValue: 25 },
      { key: 'quantity', label: '每次下單數量', type: 'number', min: 0.001, max: 10, step: 0.001, defaultValue: 0.01 },
    ],
  },
  {
    id: 'rsi_reversal',
    name: 'RSI Reversal',
    description: '當 RSI 低於超賣區時買入，高於超買區時賣出。均值回歸策略。',
    category: '均值回歸',
    icon: '🔄',
    params: [
      { key: 'period', label: 'RSI 週期', type: 'number', min: 5, max: 50, step: 1, defaultValue: 14 },
      { key: 'oversold', label: '超賣閾值', type: 'number', min: 10, max: 40, step: 1, defaultValue: 30 },
      { key: 'overbought', label: '超買閾值', type: 'number', min: 60, max: 90, step: 1, defaultValue: 70 },
      { key: 'quantity', label: '每次下單數量', type: 'number', min: 0.001, max: 10, step: 0.001, defaultValue: 0.01 },
    ],
  },
  {
    id: 'grid_trading',
    name: 'Grid Trading',
    description: '在價格區間內等距掛買賣單，適合震盪行情。自動高拋低吸。',
    category: '網格交易',
    icon: '🔲',
    params: [
      { key: 'upperPrice', label: '網格上界 (USD)', type: 'number', min: 1000, max: 200000, step: 100, defaultValue: 70000 },
      { key: 'lowerPrice', label: '網格下界 (USD)', type: 'number', min: 100, max: 150000, step: 100, defaultValue: 60000 },
      { key: 'gridCount', label: '網格數量', type: 'number', min: 3, max: 100, step: 1, defaultValue: 10 },
      { key: 'totalInvestment', label: '總投入 (USD)', type: 'number', min: 100, max: 1000000, step: 100, defaultValue: 10000 },
    ],
  },
];

/**
 * 策略實例的初始狀態生成器
 */
function createStrategyInstance(template, env) {
  const paramValues = {};
  template.params.forEach(p => {
    paramValues[p.key] = p.defaultValue;
  });
  return {
    id: `${template.id}_${Date.now()}`,
    templateId: template.id,
    name: template.name,
    icon: template.icon,
    category: template.category,
    status: 'IDLE',           // IDLE | RUNNING | STOPPED | ERROR
    environment: env,          // INTERNAL | PAPER
    params: paramValues,
    createdAt: new Date().toISOString(),
    pnl: 0,
    trades: 0,
  };
}

/**
 * StrategyPage - 策略編輯器（頁面二）
 * 包含策略模板選取、參數配置、已部署策略管理
 */
export default function StrategyPage() {
  const { tradingMode, modeConfig, isInternal } = useTradingEnvironment();

  // 當前選中的策略模板
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // 正在編輯的參數值
  const [editingParams, setEditingParams] = useState({});

  // 已部署的策略實例清單
  const [deployedStrategies, setDeployedStrategies] = useState([]);

  // 選取策略模板
  const handleSelectTemplate = useCallback((template) => {
    setSelectedTemplate(template);
    const defaults = {};
    template.params.forEach(p => {
      defaults[p.key] = p.defaultValue;
    });
    setEditingParams(defaults);
  }, []);

  // 更新編輯中的參數
  const handleParamChange = useCallback((key, value) => {
    setEditingParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  }, []);

  // 部署策略
  const handleDeploy = useCallback(() => {
    if (!selectedTemplate) return;
    const instance = createStrategyInstance(selectedTemplate, tradingMode);
    instance.params = { ...editingParams };
    instance.status = 'RUNNING';
    setDeployedStrategies(prev => [instance, ...prev]);
    setSelectedTemplate(null);
    setEditingParams({});
  }, [selectedTemplate, editingParams, tradingMode]);

  // 停止 / 啟動策略
  const handleToggleStrategy = useCallback((id) => {
    setDeployedStrategies(prev => prev.map(s =>
      s.id === id
        ? { ...s, status: s.status === 'RUNNING' ? 'STOPPED' : 'RUNNING' }
        : s
    ));
  }, []);

  // 刪除策略
  const handleRemoveStrategy = useCallback((id) => {
    setDeployedStrategies(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 頁面標題列 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-xl">策略編輯器</h1>
          <div className="mode-badge">
            {modeConfig.badge} {modeConfig.shortLabel}
          </div>
        </div>
        <p className="text-[var(--text-muted)] text-sm">選取策略模板 → 調整參數 → 一鍵部署至{isInternal ? '系統模擬' : '市場模擬'}環境</p>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左側面板：策略模板庫 */}
        <div className="w-80 border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-sm text-[var(--text-secondary)]">策略模板庫</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {STRATEGY_TEMPLATES.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                    isSelected
                      ? 'bg-[var(--mode-label-bg)] border border-[var(--mode-accent)] shadow-lg'
                      : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h3 className={`font-display font-semibold text-sm ${isSelected ? 'text-[var(--mode-label-text)]' : 'text-[var(--text-primary)]'}`}>
                        {template.name}
                      </h3>
                      <span className="text-xs text-[var(--text-muted)]">{template.category}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 中間面板：參數配置區 */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-void)]">
          {selectedTemplate ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-lg mx-auto">
                {/* 策略標題 */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--mode-accent)] to-[var(--accent-primary)] flex items-center justify-center text-3xl opacity-80">
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-2xl">{selectedTemplate.name}</h2>
                    <p className="text-[var(--text-muted)] text-sm">{selectedTemplate.description}</p>
                  </div>
                </div>

                {/* 參數表單 */}
                <div className="space-y-5">
                  <h3 className="font-display font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider">參數設定</h3>
                  {selectedTemplate.params.map((param) => (
                    <div key={param.key} className="glass-panel p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="font-display font-medium text-sm text-[var(--text-primary)]">
                          {param.label}
                        </label>
                        <span className="font-mono text-sm text-[var(--mode-label-text)] font-semibold">
                          {editingParams[param.key]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={editingParams[param.key] ?? param.defaultValue}
                        onChange={(e) => handleParamChange(param.key, e.target.value)}
                        className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-[var(--mode-accent)]
                          [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--mode-glow)]
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-webkit-slider-thumb]:transition-all
                          [&::-webkit-slider-thumb]:hover:scale-125"
                      />
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-[var(--text-muted)] font-mono">{param.min}</span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">{param.max}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 部署按鈕 */}
                <button
                  onClick={handleDeploy}
                  className="w-full mt-8 py-4 rounded-xl font-display font-bold text-lg transition-all duration-300
                    bg-gradient-to-r from-[var(--mode-accent)] to-[var(--accent-primary)]
                    text-[var(--bg-void)] hover:shadow-[0_0_30px_var(--mode-glow)]
                    hover:scale-[1.02] active:scale-[0.98]"
                >
                  🚀 部署至{isInternal ? '系統模擬' : '市場模擬'}環境
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                <p className="text-[var(--text-muted)] font-display">從左側選擇一個策略模板開始</p>
              </div>
            </div>
          )}
        </div>

        {/* 右側面板：已部署策略管理 */}
        <div className="w-80 border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-display font-semibold text-sm text-[var(--text-secondary)]">運行中策略</h2>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {deployedStrategies.filter(s => s.status === 'RUNNING').length} 個執行中
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {deployedStrategies.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[var(--text-muted)] text-sm text-center px-4">
                  尚未部署任何策略。
                  <br />
                  <span className="text-xs opacity-70">選取模板 → 設定參數 → 點擊部署</span>
                </p>
              </div>
            ) : (
              deployedStrategies.map((strategy) => {
                const statusColors = {
                  RUNNING: { bg: 'bg-[var(--green-muted)]', text: 'text-[var(--green-up)]', dot: 'bg-[var(--green-up)]', label: '運行中' },
                  STOPPED: { bg: 'bg-[var(--bg-elevated)]', text: 'text-[var(--text-muted)]', dot: 'bg-[var(--text-muted)]', label: '已停止' },
                  IDLE: { bg: 'bg-[var(--bg-elevated)]', text: 'text-[var(--text-muted)]', dot: 'bg-[var(--text-muted)]', label: '待命' },
                  ERROR: { bg: 'bg-[var(--red-muted)]', text: 'text-[var(--red-down)]', dot: 'bg-[var(--red-down)]', label: '錯誤' },
                };
                const sc = statusColors[strategy.status] || statusColors.IDLE;

                return (
                  <div
                    key={strategy.id}
                    className="glass-panel p-4 animate-fade-in"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span>{strategy.icon}</span>
                        <span className="font-display font-semibold text-sm">{strategy.name}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${sc.bg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${strategy.status === 'RUNNING' ? 'animate-pulse' : ''}`}></div>
                        <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
                      </div>
                    </div>

                    {/* 參數摘要 */}
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {Object.entries(strategy.params).slice(0, 4).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center px-2 py-1 bg-[var(--bg-elevated)] rounded text-xs">
                          <span className="text-[var(--text-muted)] truncate mr-1">{key}</span>
                          <span className="font-mono text-[var(--text-primary)]">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* 環境標識 */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[var(--text-muted)]">
                        環境: <span className="font-mono text-[var(--mode-label-text)]">{strategy.environment}</span>
                      </span>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStrategy(strategy.id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          strategy.status === 'RUNNING'
                            ? 'bg-[var(--red-muted)] text-[var(--red-down)] hover:bg-red-500/20'
                            : 'bg-[var(--green-muted)] text-[var(--green-up)] hover:bg-green-500/20'
                        }`}
                      >
                        {strategy.status === 'RUNNING' ? '⏹ 停止' : '▶ 啟動'}
                      </button>
                      <button
                        onClick={() => handleRemoveStrategy(strategy.id)}
                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--red-down)] hover:bg-[var(--red-muted)] transition-all duration-200"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
