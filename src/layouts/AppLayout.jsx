import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { TradingEnvironmentProvider, useTradingEnvironment } from '../contexts/TradingEnvironmentContext';

/**
 * AppLayoutInner - 內層佈局
 * 從 Context 讀取 tradingMode 並套用至 data-trading-mode 屬性
 */
function AppLayoutInner() {
  const { tradingMode } = useTradingEnvironment();

  return (
    <div
      className="h-screen flex bg-[var(--bg-void)] grain-overlay"
      data-trading-mode={tradingMode}
    >
      {/* 左側導覽列 */}
      <Sidebar />

      {/* 右側主內容區 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

/**
 * AppLayout - 全局佈局元件
 * 提供 TradingEnvironmentProvider 包裹整個應用
 */
export default function AppLayout() {
  return (
    <TradingEnvironmentProvider>
      <AppLayoutInner />
    </TradingEnvironmentProvider>
  );
}
