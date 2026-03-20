import React, { useState } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useTradingEnvironment } from '../contexts/useTradingEnvironment';

/**
 * 模擬回測資料產生器
 * 根據策略模板與參數產生一組模擬的淨值曲線與交易紀錄
 */
function generateMockBacktestData(days = 90) {
  const data = [];
  const trades = [];
  let equity = 10000;
  let maxEquity = equity;
  let maxDrawdown = 0;
  let wins = 0;
  let losses = 0;
  let totalProfit = 0;
  let totalLoss = 0;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    // 隨機模擬每日損益（帶輕微正偏）
    const dailyReturn = (Math.random() - 0.47) * 0.03;
    const pnl = equity * dailyReturn;
    equity += pnl;

    if (equity > maxEquity) maxEquity = equity;
    const drawdown = ((maxEquity - equity) / maxEquity) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;

    if (pnl > 0) { wins++; totalProfit += pnl; }
    else { losses++; totalLoss += Math.abs(pnl); }

    data.push({
      date: dateStr,
      equity: Math.round(equity * 100) / 100,
      drawdown: Math.round(drawdown * 100) / 100,
      dailyPnl: Math.round(pnl * 100) / 100,
    });

    // 隨機生成交易記錄（約 40% 的天有交易）
    if (Math.random() > 0.6) {
      const side = pnl > 0 ? 'BUY' : 'SELL';
      const price = 60000 + Math.random() * 10000;
      trades.push({
        id: `T-${i.toString().padStart(3, '0')}`,
        date: dateStr,
        side,
        symbol: 'BTC-USD',
        price: Math.round(price * 100) / 100,
        quantity: Math.round((0.001 + Math.random() * 0.05) * 10000) / 10000,
        pnl: Math.round(pnl * 100) / 100,
        type: 'LIMIT',
      });
    }
  }

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
  const netPnl = equity - 10000;
  const returnPct = (netPnl / 10000) * 100;

  // 簡化版夏普比率估算
  const avgDailyReturn = data.reduce((sum, d) => sum + d.dailyPnl, 0) / days;
  const variance = data.reduce((sum, d) => sum + Math.pow(d.dailyPnl - avgDailyReturn, 2), 0) / days;
  const stdDev = Math.sqrt(variance);
  const sharpe = stdDev > 0 ? (avgDailyReturn / stdDev) * Math.sqrt(252) : 0;

  return {
    equityCurve: data,
    trades: trades.reverse(),
    kpi: {
      netPnl: Math.round(netPnl * 100) / 100,
      returnPct: Math.round(returnPct * 100) / 100,
      sharpe: Math.round(sharpe * 100) / 100,
      winRate: Math.round(winRate * 10) / 10,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      totalTrades,
      finalEquity: Math.round(equity * 100) / 100,
    },
  };
}

/**
 * 策略選取清單（回測可用策略）
 */
const BACKTEST_STRATEGIES = [
  { id: 'ma_cross', name: 'MA Crossover', icon: '📈', period: '90 天' },
  { id: 'rsi_reversal', name: 'RSI Reversal', icon: '🔄', period: '90 天' },
  { id: 'grid_trading', name: 'Grid Trading', icon: '🔲', period: '90 天' },
];

/**
 * KPI 指標卡片元件
 */
function KpiCard({ label, value, unit, trend, color }) {
  return (
    <div className="glass-panel p-4 flex flex-col">
      <span className="text-xs text-[var(--text-muted)] font-display mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-xl font-bold ${color || 'text-[var(--text-primary)]'}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-[var(--text-muted)]">{unit}</span>}
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-mono mt-1 ${trend >= 0 ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}

/**
 * 自訂 Tooltip 元件
 */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-panel p-3 text-xs border border-[var(--border-subtle)]">
      <p className="font-display font-semibold text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="font-mono" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/**
 * BacktestPage - 回測中心（頁面三）
 */
export default function BacktestPage() {
  const { modeConfig } = useTradingEnvironment();

  // 選中的策略
  const [selectedStrategy, setSelectedStrategy] = useState(BACKTEST_STRATEGIES[0]);

  // 是否已執行回測
  const [hasRun, setHasRun] = useState(false);

  // 回測結果資料
  const [backtestResult, setBacktestResult] = useState(null);

  // 圖表顯示模式：equity（淨值）或 drawdown（回撤）
  const [chartMode, setChartMode] = useState('equity');

  // 執行回測
  const handleRunBacktest = () => {
    const result = generateMockBacktestData(90);
    setBacktestResult(result);
    setHasRun(true);
  };

  // KPI 色彩判斷
  const kpiColor = (val) => val >= 0 ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 頁面標題列 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-xl">回測中心</h1>
          <div className="mode-badge">
            {modeConfig.badge} {modeConfig.shortLabel}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 策略選取 */}
          <div className="flex items-center gap-2 bg-[var(--bg-elevated)] rounded-lg px-3 py-2">
            {BACKTEST_STRATEGIES.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedStrategy(s); setHasRun(false); setBacktestResult(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-semibold transition-all ${
                  selectedStrategy.id === s.id
                    ? 'bg-[var(--mode-label-bg)] text-[var(--mode-label-text)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden xl:inline">{s.name}</span>
              </button>
            ))}
          </div>
          {/* 執行回測按鈕 */}
          <button
            onClick={handleRunBacktest}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-display font-semibold text-sm transition-all duration-300
              bg-gradient-to-r from-[var(--mode-accent)] to-[var(--accent-primary)]
              text-[var(--bg-void)] hover:shadow-[0_0_20px_var(--mode-glow)] hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            執行回測
          </button>
        </div>
      </header>

      {/* 主內容區 */}
      {!hasRun ? (
        /* 未執行回測前的引導畫面 */
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-void)]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--mode-accent)] to-[var(--accent-secondary)] flex items-center justify-center mx-auto mb-6 opacity-50">
              <svg className="w-10 h-10 text-[var(--bg-void)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl mb-2">選擇策略並執行回測</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
              上方選擇策略模板，點擊「執行回測」，系統將使用 90 天歷史數據進行模擬交易，產生完整的績效報告。
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{selectedStrategy.icon}</span>
              <span className="font-display font-semibold text-lg">{selectedStrategy.name}</span>
              <span className="text-xs text-[var(--text-muted)]">({selectedStrategy.period})</span>
            </div>
          </div>
        </div>
      ) : backtestResult && (
        /* 回測結果 */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* KPI 指標列 */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
            <KpiCard label="淨損益" value={`$${backtestResult.kpi.netPnl.toLocaleString()}`} color={kpiColor(backtestResult.kpi.netPnl)} trend={backtestResult.kpi.returnPct} />
            <KpiCard label="最終淨值" value={`$${backtestResult.kpi.finalEquity.toLocaleString()}`} color="text-[var(--text-primary)]" />
            <KpiCard label="夏普比率" value={backtestResult.kpi.sharpe} color={kpiColor(backtestResult.kpi.sharpe)} />
            <KpiCard label="勝率" value={backtestResult.kpi.winRate} unit="%" color={kpiColor(backtestResult.kpi.winRate - 50)} />
            <KpiCard label="最大回撤" value={backtestResult.kpi.maxDrawdown} unit="%" color="text-[var(--red-down)]" />
            <KpiCard label="利潤因子" value={backtestResult.kpi.profitFactor} color={kpiColor(backtestResult.kpi.profitFactor - 1)} />
            <KpiCard label="總交易次數" value={backtestResult.kpi.totalTrades} color="text-[var(--text-primary)]" />
            <KpiCard label="報酬率" value={backtestResult.kpi.returnPct} unit="%" color={kpiColor(backtestResult.kpi.returnPct)} />
          </div>

          {/* 圖表區 + 交易明細 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 左側：圖表 */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border-subtle)]">
              {/* 圖表切換 */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <button
                  onClick={() => setChartMode('equity')}
                  className={`px-3 py-1 rounded-md text-xs font-display font-semibold transition-all ${
                    chartMode === 'equity'
                      ? 'bg-[var(--mode-label-bg)] text-[var(--mode-label-text)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  淨值曲線
                </button>
                <button
                  onClick={() => setChartMode('drawdown')}
                  className={`px-3 py-1 rounded-md text-xs font-display font-semibold transition-all ${
                    chartMode === 'drawdown'
                      ? 'bg-[var(--red-muted)] text-[var(--red-down)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  回撤分析
                </button>
                <button
                  onClick={() => setChartMode('dailyPnl')}
                  className={`px-3 py-1 rounded-md text-xs font-display font-semibold transition-all ${
                    chartMode === 'dailyPnl'
                      ? 'bg-[var(--green-muted)] text-[var(--green-up)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  每日損益
                </button>
              </div>

              {/* 圖表本體 */}
              <div className="flex-1 min-h-0 p-4 bg-[var(--bg-void)]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'dailyPnl' ? (
                    <BarChart data={backtestResult.equityCurve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#55556a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#55556a" fontSize={10} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                      <Bar
                        dataKey="dailyPnl"
                        name="每日損益"
                        fill="#00ff88"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <AreaChart data={backtestResult.equityCurve}>
                      <defs>
                        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartMode === 'equity' ? '#7c3aed' : '#ff3366'} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={chartMode === 'equity' ? '#7c3aed' : '#ff3366'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#55556a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#55556a" fontSize={10} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      {chartMode === 'equity' && (
                        <ReferenceLine y={10000} stroke="rgba(255,255,255,0.15)" strokeDasharray="5 5" label={{ value: '初始', fill: '#55556a', fontSize: 10 }} />
                      )}
                      <Area
                        type="monotone"
                        dataKey={chartMode}
                        name={chartMode === 'equity' ? '淨值' : '回撤 %'}
                        stroke={chartMode === 'equity' ? '#7c3aed' : '#ff3366'}
                        fill="url(#equityGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右側：交易明細 */}
            <div className="w-96 flex flex-col overflow-hidden bg-[var(--bg-primary)]">
              <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-[var(--text-secondary)]">交易明細</h2>
                <span className="font-mono text-xs text-[var(--text-muted)]">{backtestResult.trades.length} 筆</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="data-table">
                  <thead className="sticky top-0 bg-[var(--bg-primary)] z-10">
                    <tr>
                      <th>日期</th>
                      <th>方向</th>
                      <th>價格</th>
                      <th>數量</th>
                      <th className="text-right">損益</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backtestResult.trades.map((trade) => (
                      <tr key={trade.id}>
                        <td className="font-mono text-[var(--text-secondary)]">{trade.date}</td>
                        <td>
                          <span className={`badge ${trade.side === 'BUY' ? 'badge-new' : 'badge-canceled'}`}>
                            {trade.side === 'BUY' ? '買' : '賣'}
                          </span>
                        </td>
                        <td className="font-mono">${trade.price.toLocaleString()}</td>
                        <td className="font-mono text-[var(--text-secondary)]">{trade.quantity}</td>
                        <td className={`font-mono text-right ${trade.pnl >= 0 ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
