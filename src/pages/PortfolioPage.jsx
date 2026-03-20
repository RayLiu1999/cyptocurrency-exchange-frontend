import React, { useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTradingEnvironment } from '../contexts/useTradingEnvironment';

/**
 * 模擬資產組合數據
 */
const MOCK_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.5234, price: 67850, color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', balance: 4.125, price: 3520, color: '#627eea' },
  { symbol: 'SOL', name: 'Solana', balance: 85.5, price: 142, color: '#00ffa3' },
  { symbol: 'USDT', name: 'Tether', balance: 12500, price: 1, color: '#26a17b' },
  { symbol: 'AVAX', name: 'Avalanche', balance: 120, price: 35.8, color: '#e84142' },
];

/**
 * 模擬 PnL 歷史走勢（30 天）
 */
function generatePnlHistory() {
  const data = [];
  let cumPnl = 0;
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const daily = (Math.random() - 0.45) * 500;
    cumPnl += daily;
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      dailyPnl: Math.round(daily * 100) / 100,
      cumPnl: Math.round(cumPnl * 100) / 100,
    });
  }
  return data;
}

const PNL_HISTORY = generatePnlHistory();

/**
 * 自訂圓餅圖 Tooltip
 */
function PieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className="glass-panel p-3 text-xs border border-[var(--border-subtle)]">
      <p className="font-display font-semibold" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="font-mono text-[var(--text-primary)]">${d.value.toLocaleString()}</p>
      <p className="text-[var(--text-muted)]">{(d.payload.percent * 100).toFixed(1)}%</p>
    </div>
  );
}

/**
 * 自訂走勢圖 Tooltip
 */
function LineTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-panel p-3 text-xs border border-[var(--border-subtle)]">
      <p className="font-display font-semibold text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="font-mono" style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/**
 * 風控設定的預設值
 */
const DEFAULT_RISK_SETTINGS = {
  maxDrawdown: 15,
  maxPositionSize: 30,
  dailyLossLimit: 500,
  stopLossEnabled: true,
  stopLossPercent: 5,
  takeProfitEnabled: false,
  takeProfitPercent: 10,
  maxOpenPositions: 5,
};

/**
 * PortfolioPage - 資產與風控監控（頁面四）
 */
export default function PortfolioPage() {
  const { modeConfig, isInternal } = useTradingEnvironment();

  // 風控設定
  const [riskSettings, setRiskSettings] = useState(DEFAULT_RISK_SETTINGS);

  // 更新風控設定
  const updateRisk = useCallback((key, value) => {
    setRiskSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // 計算資產組合數據
  const portfolioData = MOCK_ASSETS.map(a => ({
    ...a,
    value: Math.round(a.balance * a.price * 100) / 100,
  }));
  const totalValue = portfolioData.reduce((sum, a) => sum + a.value, 0);
  const pieData = portfolioData.map(a => ({
    name: a.symbol,
    value: a.value,
    color: a.color,
    percent: a.value / totalValue,
  }));

  // 24h 變化模擬
  const change24h = 1247.35;
  const changePct = (change24h / totalValue) * 100;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 頁面標題列 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-xl">資產與風控</h1>
          <div className="mode-badge">
            {modeConfig.badge} {modeConfig.shortLabel}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">總資產價值</p>
            <p className="font-mono font-bold text-lg">${totalValue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">24h 變化</p>
            <p className={`font-mono font-bold text-lg ${change24h >= 0 ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]'}`}>
              {change24h >= 0 ? '+' : ''}${change24h.toLocaleString()} <span className="text-xs">({changePct.toFixed(2)}%)</span>
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左側主面板 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 上半：資產分配 + 持倉清單 */}
          <div className="flex border-b border-[var(--border-subtle)]" style={{ height: '50%' }}>
            {/* 圓餅圖 */}
            <div className="w-80 flex flex-col items-center justify-center border-r border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <h3 className="font-display font-semibold text-sm text-[var(--text-secondary)] mb-2">資產分配</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    formatter={(val) => <span className="text-xs font-mono text-[var(--text-secondary)]">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 持倉清單 */}
            <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
              <table className="data-table">
                <thead className="sticky top-0 bg-[var(--bg-primary)] z-10">
                  <tr>
                    <th>資產</th>
                    <th>持有數量</th>
                    <th>現價 (USD)</th>
                    <th>市值 (USD)</th>
                    <th className="text-right">佔比</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.map((asset) => (
                    <tr key={asset.symbol}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                          <span className="font-display font-semibold">{asset.symbol}</span>
                          <span className="text-xs text-[var(--text-muted)]">{asset.name}</span>
                        </div>
                      </td>
                      <td className="font-mono">{asset.balance}</td>
                      <td className="font-mono">${asset.price.toLocaleString()}</td>
                      <td className="font-mono font-semibold">${asset.value.toLocaleString()}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(asset.value / totalValue) * 100}%`, backgroundColor: asset.color }}
                            ></div>
                          </div>
                          <span className="font-mono text-xs text-[var(--text-secondary)] w-12 text-right">
                            {((asset.value / totalValue) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 下半：PnL 走勢圖 */}
          <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-void)]">
            <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <h3 className="font-display font-semibold text-sm text-[var(--text-secondary)]">累計損益走勢（30 天）</h3>
            </div>
            <div className="flex-1 min-h-0 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PNL_HISTORY}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#55556a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#55556a" fontSize={10} tickLine={false} />
                  <Tooltip content={<LineTooltip />} />
                  <Area type="monotone" dataKey="cumPnl" name="累計損益" stroke="#00ff88" fill="url(#pnlGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 右側面板：風控設定 */}
        <div className="w-80 border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-sm text-[var(--text-secondary)]">風控設定</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* 最大回撤限制 */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-display font-medium text-sm">最大回撤限制</label>
                <span className="font-mono text-sm text-[var(--red-down)] font-semibold">{riskSettings.maxDrawdown}%</span>
              </div>
              <input
                type="range" min={5} max={50} step={1}
                value={riskSettings.maxDrawdown}
                onChange={(e) => updateRisk('maxDrawdown', parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--red-down)]
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,51,102,0.5)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-1"><span className="text-xs text-[var(--text-muted)] font-mono">5%</span><span className="text-xs text-[var(--text-muted)] font-mono">50%</span></div>
            </div>

            {/* 單一倉位上限 */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-display font-medium text-sm">單一倉位上限</label>
                <span className="font-mono text-sm text-[var(--mode-label-text)] font-semibold">{riskSettings.maxPositionSize}%</span>
              </div>
              <input
                type="range" min={5} max={100} step={5}
                value={riskSettings.maxPositionSize}
                onChange={(e) => updateRisk('maxPositionSize', parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--mode-accent)]
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--mode-glow)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-1"><span className="text-xs text-[var(--text-muted)] font-mono">5%</span><span className="text-xs text-[var(--text-muted)] font-mono">100%</span></div>
            </div>

            {/* 每日虧損上限 */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-display font-medium text-sm">每日虧損上限</label>
                <span className="font-mono text-sm text-[var(--red-down)] font-semibold">${riskSettings.dailyLossLimit}</span>
              </div>
              <input
                type="range" min={100} max={5000} step={100}
                value={riskSettings.dailyLossLimit}
                onChange={(e) => updateRisk('dailyLossLimit', parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--red-down)]
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,51,102,0.5)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-1"><span className="text-xs text-[var(--text-muted)] font-mono">$100</span><span className="text-xs text-[var(--text-muted)] font-mono">$5000</span></div>
            </div>

            {/* 停損開關 */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="font-display font-medium text-sm">自動停損</label>
                <button
                  onClick={() => updateRisk('stopLossEnabled', !riskSettings.stopLossEnabled)}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                    riskSettings.stopLossEnabled ? 'bg-[var(--red-down)]' : 'bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${
                    riskSettings.stopLossEnabled ? 'left-6' : 'left-1'
                  }`}></div>
                </button>
              </div>
              {riskSettings.stopLossEnabled && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <span className="text-xs text-[var(--text-muted)]">觸發閾值</span>
                  <input
                    type="number" min={1} max={50} step={0.5}
                    value={riskSettings.stopLossPercent}
                    onChange={(e) => updateRisk('stopLossPercent', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
                      text-center font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--red-down)]"
                  />
                  <span className="text-xs text-[var(--text-muted)]">%</span>
                </div>
              )}
            </div>

            {/* 自動止盈 */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="font-display font-medium text-sm">自動止盈</label>
                <button
                  onClick={() => updateRisk('takeProfitEnabled', !riskSettings.takeProfitEnabled)}
                  className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
                    riskSettings.takeProfitEnabled ? 'bg-[var(--green-up)]' : 'bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${
                    riskSettings.takeProfitEnabled ? 'left-6' : 'left-1'
                  }`}></div>
                </button>
              </div>
              {riskSettings.takeProfitEnabled && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <span className="text-xs text-[var(--text-muted)]">觸發閾值</span>
                  <input
                    type="number" min={1} max={100} step={0.5}
                    value={riskSettings.takeProfitPercent}
                    onChange={(e) => updateRisk('takeProfitPercent', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
                      text-center font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-up)]"
                  />
                  <span className="text-xs text-[var(--text-muted)]">%</span>
                </div>
              )}
            </div>

            {/* 最大同時持倉數 */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-display font-medium text-sm">最大同時持倉</label>
                <span className="font-mono text-sm text-[var(--mode-label-text)] font-semibold">{riskSettings.maxOpenPositions}</span>
              </div>
              <input
                type="range" min={1} max={20} step={1}
                value={riskSettings.maxOpenPositions}
                onChange={(e) => updateRisk('maxOpenPositions', parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--mode-accent)]
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--mode-glow)] [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-1"><span className="text-xs text-[var(--text-muted)] font-mono">1</span><span className="text-xs text-[var(--text-muted)] font-mono">20</span></div>
            </div>

            {/* 風控摘要 */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-card)] border border-[var(--border-subtle)]">
              <h4 className="font-display font-semibold text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wider">風控摘要</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">模式</span>
                  <span className="font-mono text-[var(--mode-label-text)]">{isInternal ? '系統模擬' : '市場模擬'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">回撤限制</span>
                  <span className="font-mono text-[var(--red-down)]">{riskSettings.maxDrawdown}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">停損</span>
                  <span className={`font-mono ${riskSettings.stopLossEnabled ? 'text-[var(--red-down)]' : 'text-[var(--text-muted)]'}`}>
                    {riskSettings.stopLossEnabled ? `${riskSettings.stopLossPercent}%` : '關閉'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">止盈</span>
                  <span className={`font-mono ${riskSettings.takeProfitEnabled ? 'text-[var(--green-up)]' : 'text-[var(--text-muted)]'}`}>
                    {riskSettings.takeProfitEnabled ? `${riskSettings.takeProfitPercent}%` : '關閉'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
