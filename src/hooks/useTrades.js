import { useState, useEffect, useCallback } from "react";
import { getTrades } from "../services/api";
import { wsService } from "../services/websocket";

/**
 * useTrades Hook
 * 取得最新成交列表並監聽 WebSocket 即時更新
 */
export function useTrades(symbol = "BTC-USD", limit = 50) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 取得歷史成交
  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrades(symbol, limit);
      // 格式化數據
      const formatted = (data || []).map((t, idx) => ({
        id: t.id || `trade-${idx}`,
        price: parseFloat(t.price),
        quantity: parseFloat(t.quantity),
        // created_at 是 UnixMilli BIGINT，直接存入後由顯示層轉換
        time: t.created_at ?? t.time ?? t.timestamp,
        side: t.side || (Math.random() > 0.5 ? "BUY" : "SELL"),
      }));
      setTrades(formatted);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch trades:", err);
      setError(err.message || "Failed to fetch trades");
      // 保持空列表，WebSocket 會推送即時成交
    } finally {
      setLoading(false);
    }
  }, [symbol, limit]);

  // 監聽 WebSocket trade 事件
  useEffect(() => {
    const handleTrade = (message) => {
      if (message.type !== "trade") return;
      const trade = message.data;
      if (trade.symbol && trade.symbol !== symbol) return;

      const newTrade = {
        id: trade.id || `ws-${Date.now()}`,
        price: parseFloat(trade.price),
        quantity: parseFloat(trade.quantity),
        // WS 推送的 trade 事件中 created_at 也是 UnixMilli
        time: trade.created_at ?? trade.time ?? Date.now(),
        side: trade.side || "BUY",
      };

      setTrades((prev) => {
        // 插入到最前面，保持最大 limit 筆
        const updated = [newTrade, ...prev];
        return updated.slice(0, limit);
      });
    };

    const unsubscribe = wsService.subscribe(handleTrade);
    return () => unsubscribe();
  }, [symbol, limit]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
}
