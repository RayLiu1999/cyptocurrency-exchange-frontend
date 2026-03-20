import React, { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import TradingView from '../components/TradingView';
import OrderBook from '../components/OrderBook';
import TradeHistory from '../components/TradeHistory';
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderList';
import ToastContainer from '../components/Toast';
import { useWebSocket } from '../hooks/useWebSocket';
import { useOrders } from '../hooks/useOrders';
import { useOrderBook } from '../hooks/useOrderBook';
import { useUser } from '../hooks/useUser';
import { useTrades } from '../hooks/useTrades';
import { useToast } from '../hooks/useToast';
import { useTradingEnvironment } from '../contexts/useTradingEnvironment';

/**
 * TradingPage - 交易看板（頁面一）
 * 支援雙模態：Internal Sim（完整功能）與 Paper Trading（佔位等待 CCXT）
 */
export default function TradingPage() {
  const { isInternal, isPaper } = useTradingEnvironment();

  // 交易對狀態
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USD');

  // Toast 通知系統
  const { toasts, success, error, dismiss, show } = useToast();

  // 用戶狀態（自動加入或讀取 localStorage）
  const { userId, balances, loading: userLoading, error: userError, refreshBalances } = useUser();

  // Hooks（等 userId 就緒後才啟用）
  const { latestPrice, isConnected, orderUpdate } = useWebSocket();
  const { orders, fetchOrders, placeNewOrder, cancelUserOrder, loading: ordersLoading, updateLocalOrder } = useOrders(userId);
  const { bids, asks } = useOrderBook(selectedSymbol);
  const { trades, loading: tradesLoading } = useTrades(selectedSymbol, 50);

  // 訂單輪詢策略：WS 連線正常時 60 秒補救，斷線時每 3 秒補償
  useEffect(() => {
    if (!userId) return;
    fetchOrders();
    const pollMs = isConnected ? 60000 : 3000;
    const interval = setInterval(fetchOrders, pollMs);
    return () => clearInterval(interval);
  }, [fetchOrders, userId, isConnected]);

  // WebSocket 即時更新本地訂單
  useEffect(() => {
    if (orderUpdate && orderUpdate.user_id === userId) {
      updateLocalOrder(orderUpdate);
      // 因為訂單有變更，可能成交了，順便更新一下餘額
      refreshBalances();
    }
  }, [orderUpdate, userId, updateLocalOrder, refreshBalances]);

  // 下單處理（下單後更新餘額和訂單）
  const handlePlaceOrder = async (orderData) => {
    try {
      const result = await placeNewOrder(orderData);
      // 下單成功後更新餘額
      await refreshBalances();
      success(`訂單已送出！${orderData.side === 'BUY' ? '買進' : '賣出'} ${orderData.quantity} ${orderData.symbol.split('-')[0]}`);
      return result;
    } catch (err) {
      error(err.message || '下單失敗，請重試');
      throw err;
    }
  };

  // 撤單處理（撤單後更新餘額）
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelUserOrder(orderId);
      await refreshBalances();
      success('訂單已取消');
    } catch (err) {
      error(err.message || '取消訂單失敗');
    }
  };

  // 載入中畫面
  if (userLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-void)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)] font-mono">正在進入交易競技場...</p>
        </div>
      </div>
    );
  }

  // 錯誤畫面
  if (userError) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-void)]">
        <div className="text-center glass-panel p-8">
          <p className="text-[var(--red-down)] text-xl mb-4">⚠️ 連線失敗</p>
          <p className="text-[var(--text-secondary)] mb-4">{userError}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            重新連線
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <Topbar
        currentPrice={latestPrice}
        balances={balances}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
        showToast={show}
        isConnected={isConnected}
      />

      {/* Internal Sim 模式：渲染完整交易介面 */}
      {isInternal && (
        <main className="flex-1 flex overflow-hidden">
          {/* 左側：K 線圖 + 我的訂單 */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border-subtle)]">
            <div className="flex-1 min-h-0 animate-fade-in">
              <TradingView symbol={selectedSymbol} />
            </div>
            <div className="h-48 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] animate-fade-in animate-delay-2">
              <OrderList
                orders={orders}
                loading={ordersLoading}
                onCancel={handleCancelOrder}
              />
            </div>
          </div>

          {/* 中間：訂單簿 */}
          <div className="w-72 border-r border-[var(--border-subtle)] bg-[var(--bg-card)] hidden md:flex flex-col animate-fade-in animate-delay-1">
            <OrderBook bids={bids} asks={asks} />
          </div>

          {/* 右側：最新成交 + 下單面板 */}
          <div className="w-80 flex flex-col bg-[var(--bg-card)]">
            <div className="flex-1 min-h-0 overflow-hidden animate-fade-in animate-delay-2">
              <TradeHistory trades={trades} loading={tradesLoading} symbol={selectedSymbol} />
            </div>
            <div className="animate-fade-in animate-delay-3">
              <OrderForm
                onPlaceOrder={handlePlaceOrder}
                balances={balances}
                symbol={selectedSymbol}
                asks={asks}
                bids={bids}
              />
            </div>
          </div>
        </main>
      )}

      {/* Paper Trading 模式：佔位介面（等待 CCXT 後端就緒） */}
      {isPaper && (
        <main className="flex-1 flex overflow-hidden">
          {/* 左側：圖表佔位區 */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border-subtle)]">
            <div className="flex-1 min-h-0 flex items-center justify-center bg-[var(--bg-primary)]">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--mode-accent)] to-[var(--accent-primary)] flex items-center justify-center mx-auto mb-6 opacity-50">
                  <svg className="w-10 h-10 text-[var(--bg-void)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-xl mb-2 text-[var(--mode-label-text)]">即時市場行情</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                  串接 CCXT 即時 K 線圖與深度訂單簿。
                  <br />等待後端 Stage 3 完成後即可啟用。
                </p>
                <div className="mode-badge mx-auto">
                  <div className="w-2 h-2 rounded-full bg-[var(--mode-accent)] animate-pulse"></div>
                  AWAITING CCXT BACKEND
                </div>
              </div>
            </div>
            {/* 下方：我的訂單（佔位） */}
            <div className="h-48 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-center">
              <p className="text-[var(--text-muted)] text-sm font-mono">Paper Trading Orders</p>
            </div>
          </div>

          {/* 中間：訂單簿佔位 */}
          <div className="w-72 border-r border-[var(--border-subtle)] bg-[var(--bg-card)] hidden md:flex flex-col items-center justify-center">
            <div className="text-center px-4">
              <svg className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <p className="text-[var(--text-muted)] text-xs">即時掛單簿</p>
              <p className="text-[var(--text-muted)] text-xs opacity-50">Coming Soon</p>
            </div>
          </div>

          {/* 右側：成交 + 下單佔位 */}
          <div className="w-80 flex flex-col bg-[var(--bg-card)]">
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="text-center px-4">
                <svg className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-[var(--text-muted)] text-xs">即時成交記錄</p>
                <p className="text-[var(--text-muted)] text-xs opacity-50">Coming Soon</p>
              </div>
            </div>
            <div className="border-t border-[var(--border-subtle)] p-6 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[var(--text-muted)] text-xs">Paper Trading 下單</p>
                <p className="text-[var(--text-muted)] text-xs opacity-50">Coming Soon</p>
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
