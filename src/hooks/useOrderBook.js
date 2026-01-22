import { useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

export function useOrderBook(symbol = 'BTC-USD', pollInterval = 1000) {
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        const interval = setInterval(fetchOrderBook, pollInterval);
        return () => clearInterval(interval);
    }, [fetchOrderBook, pollInterval]);

    return { bids, asks, loading, error, refetch: fetchOrderBook };
}
