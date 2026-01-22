import { useEffect, useState } from 'react';
import { wsService } from '../services/websocket';

export function useWebSocket() {
    const [data, setData] = useState(null);
    const [tradeData, setTradeData] = useState([]);
    const [latestPrice, setLatestPrice] = useState(null);

    useEffect(() => {
        wsService.connect();

        const unsubscribe = wsService.subscribe((message) => {
            setData(message);
            
            // Handle different message types
            if (message.type === 'trade') {
                const trade = message.data;
                setTradeData(prev => [trade, ...prev].slice(0, 50)); // Keep last 50 trades
                setLatestPrice(trade.price);
            }
        });

        return () => {
            unsubscribe();
            wsService.disconnect();
        };
    }, []);

    return { data, tradeData, latestPrice };
}
