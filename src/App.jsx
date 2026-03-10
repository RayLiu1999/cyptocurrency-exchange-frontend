import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import TradingPage from './pages/TradingPage';
import StrategyPage from './pages/StrategyPage';
import BacktestPage from './pages/BacktestPage';
import PortfolioPage from './pages/PortfolioPage';

/**
 * App - 路由配置中心
 * 所有頁面共享 AppLayout（Sidebar + 主內容區），
 * 各頁面各自管理 Topbar 與自身狀態。
 */
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<TradingPage />} />
        <Route path="/strategy" element={<StrategyPage />} />
        <Route path="/backtest" element={<BacktestPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Route>
    </Routes>
  );
}

export default App;
