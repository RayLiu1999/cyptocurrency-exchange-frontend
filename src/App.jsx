import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import TradingView from './components/TradingView';
import OrderBook from './components/OrderBook';
import TradeHistory from './components/TradeHistory';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import ToastContainer from './components/Toast';
import { useWebSocket } from './hooks/useWebSocket';
import { useOrders } from './hooks/useOrders';
import { useOrderBook } from './hooks/useOrderBook';
import { useUser } from './hooks/useUser';
import { useTrades } from './hooks/useTrades';
import { useToast } from './hooks/useToast';

function App() {
  // 交易對狀態
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USD');

  // Toast 通知系統
  const { toasts, success, error, dismiss, show } = useToast();

  // 用戶狀態（自動加入或讀取 localStorage）
  const { userId, balances, loading: userLoading, error: userError, refreshBalances } = useUser();

  // Hooks（等 userId 就緒後才啟用）
  const { latestPrice } = useWebSocket();
  const { orders, fetchOrders, placeNewOrder, cancelUserOrder, loading: ordersLoading } = useOrders(userId);
  const { bids, asks } = useOrderBook(selectedSymbol, 1000);
  const { trades, loading: tradesLoading } = useTrades(selectedSymbol, 50);

  // Poll orders（僅當 userId 存在時）
  useEffect(() => {
    if (!userId) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders, userId]);

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
      <div className="h-screen flex items-center justify-center bg-[var(--bg-void)]">
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
      <div className="h-screen flex items-center justify-center bg-[var(--bg-void)]">
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
    <div className="h-screen flex flex-col bg-[var(--bg-void)] grain-overlay">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <Navbar 
        currentPrice={latestPrice} 
        balances={balances} 
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
        showToast={show}
      />

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Chart + My Orders */}
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

        {/* Middle: Order Book */}
        <div className="w-72 border-r border-[var(--border-subtle)] bg-[var(--bg-card)] hidden md:flex flex-col animate-fade-in animate-delay-1">
          <OrderBook bids={bids} asks={asks} />
        </div>

        {/* Right: Trades + Order Form */}
        <div className="w-80 flex flex-col bg-[var(--bg-card)]">
          <div className="flex-1 min-h-0 overflow-hidden animate-fade-in animate-delay-2">
            <TradeHistory trades={trades} loading={tradesLoading} symbol={selectedSymbol} />
          </div>
          <div className="animate-fade-in animate-delay-3">
            <OrderForm 
              onPlaceOrder={handlePlaceOrder} 
              balances={balances} 
              symbol={selectedSymbol}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
