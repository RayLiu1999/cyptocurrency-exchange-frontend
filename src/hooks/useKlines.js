import { useState, useEffect, useCallback, useRef } from 'react';
import { getKlines } from '../services/api';
import { wsService } from '../services/websocket';

/**
 * useKlines Hook
 * 取得 K 線歷史數據並監聽 WebSocket 即時更新最後一根 K 線
 */
export function useKlines(symbol = 'BTC-USD', interval = '1m', limit = 100) {
    const [klines, setKlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const lastKlineRef = useRef(null);

    // 取得歷史 K 線
    const fetchKlines = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getKlines(symbol, interval, limit);
            // 將後端格式轉換為 lightweight-charts 格式
            const formatted = (data || []).map(k => ({
                time: new Date(k.time || k.timestamp).getTime() / 1000,
                open: parseFloat(k.open),
                high: parseFloat(k.high),
                low: parseFloat(k.low),
                close: parseFloat(k.close),
                volume: parseFloat(k.volume) || 0
            }));
            setKlines(formatted);
            if (formatted.length > 0) {
                lastKlineRef.current = formatted[formatted.length - 1];
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch klines:', err);
            setError(err.message || 'Failed to fetch klines');
            // 產生模擬數據作為 fallback
            setKlines(generateMockKlines());
        } finally {
            setLoading(false);
        }
    }, [symbol, interval, limit]);

    // 處理 WebSocket trade 事件，更新最後一根 K 線
    useEffect(() => {
        const handleTrade = (message) => {
            if (message.type !== 'trade') return;
            const trade = message.data;
            if (trade.symbol !== symbol) return;

            const price = parseFloat(trade.price);
            const tradeTime = Math.floor(new Date(trade.time || trade.timestamp || Date.now()).getTime() / 1000);
            
            // 計算當前 K 線時間區間 (以分鐘為單位)
            const intervalSeconds = 60; // 1m
            const currentBarTime = Math.floor(tradeTime / intervalSeconds) * intervalSeconds;

            setKlines(prev => {
                if (prev.length === 0) return prev;
                
                const lastBar = prev[prev.length - 1];
                
                if (lastBar.time === currentBarTime) {
                    // 更新現有 K 線
                    const updatedBar = {
                        ...lastBar,
                        high: Math.max(lastBar.high, price),
                        low: Math.min(lastBar.low, price),
                        close: price
                    };
                    return [...prev.slice(0, -1), updatedBar];
                } else if (currentBarTime > lastBar.time) {
                    // 創建新的 K 線
                    const newBar = {
                        time: currentBarTime,
                        open: price,
                        high: price,
                        low: price,
                        close: price,
                        volume: 0
                    };
                    return [...prev, newBar];
                }
                return prev;
            });
        };

        const unsubscribe = wsService.subscribe(handleTrade);
        return () => unsubscribe();
    }, [symbol]);

    useEffect(() => {
        fetchKlines();
    }, [fetchKlines]);

    return { klines, loading, error, refetch: fetchKlines };
}

// 產生模擬 K 線數據
function generateMockKlines(count = 100) {
    const now = Math.floor(Date.now() / 1000);
    const interval = 60; // 1 minute
    let price = 67000 + Math.random() * 1000;
    
    return Array.from({ length: count }, (_, i) => {
        const time = now - (count - i) * interval;
        const volatility = 50 + Math.random() * 100;
        const open = price;
        const close = price + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        price = close;
        
        return { time, open, high, low, close, volume: Math.random() * 100 };
    });
}
