import { useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';
import { wsService } from '../services/websocket';

/**
 * useOrderBook Hook
 * 初次載入打一次 API 取得快照，後續透過 WS depth_snapshot 即時更新
 */
export function useOrderBook(symbol = 'BTC-USD') {
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 初次載入：打一次 API 取得快照
    const fetchOrderBook = useCallback(async () => {
        try {
            const data = await api.getOrderBook(symbol);
            setBids(data.bids || []);
            setAsks(data.asks || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch order book');
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        fetchOrderBook();
    }, [fetchOrderBook]);

    // 訂閱 WS depth_snapshot 事件，即時更新掛單簿
    useEffect(() => {
        const handleDepth = (message) => {
            if (message.type !== 'depth_snapshot') return;
            const data = message.data;
            // 過濾非目前交易對的深度更新
            if (data.symbol && data.symbol !== symbol) return;
            setBids(data.bids || []);
            setAsks(data.asks || []);
        };

        const unsubscribe = wsService.subscribe(handleDepth);
        return () => unsubscribe();
    }, [symbol]);

    return { bids, asks, loading, error, refetch: fetchOrderBook };
}
