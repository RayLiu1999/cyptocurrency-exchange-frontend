import { useEffect, useState } from "react";
import { wsService } from "../services/websocket";

export function useWebSocket() {
  const [data, setData] = useState(null);
  const [tradeData, setTradeData] = useState([]);
  const [latestPrice, setLatestPrice] = useState(null);
  const [isConnected, setIsConnected] = useState(wsService.isConnected);
  const [orderUpdate, setOrderUpdate] = useState(null);
  const [depthSnapshot, setDepthSnapshot] = useState(null);

  useEffect(() => {
    wsService.connect();

    const unsubscribe = wsService.subscribe((message) => {
      if (message.type === "system_connection") {
        setIsConnected(message.isConnected);
        return;
      }

      setData(message);

      // 依事件類型分派處理
      if (message.type === "trade") {
        const trade = message.data;
        setTradeData((prev) => [trade, ...prev].slice(0, 50));
        setLatestPrice(trade.price);
      } else if (message.type === "order_update") {
        setOrderUpdate(message.data);
      } else if (message.type === "depth_snapshot") {
        setDepthSnapshot(message.data);
      }
    });

    return () => {
      unsubscribe();
      wsService.disconnect();
    };
  }, []);

  return { data, tradeData, latestPrice, isConnected, orderUpdate, depthSnapshot };
}
