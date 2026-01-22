import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// =============== Testing & Onboarding ===============
export const joinArena = async () => {
    try {
        const response = await api.post('/test/join');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// =============== User Accounts ===============
export const getAccounts = async (userId) => {
    try {
        const response = await api.get('/accounts', {
            params: { user_id: userId },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// =============== Orders API ===============
export const placeOrder = async (orderData) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getOrders = async (userId) => {
    try {
        const response = await api.get('/orders', {
            params: { user_id: userId },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const cancelOrder = async (orderId, userId) => {
    try {
        const response = await api.delete(`/orders/${orderId}`, {
            params: { user_id: userId }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

// =============== Market Data API ===============
export const getOrderBook = async (symbol = 'BTC-USD') => {
    try {
        const response = await api.get('/orderbook', {
            params: { symbol },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getKlines = async (symbol = 'BTC-USD', interval = '1m', limit = 100) => {
    try {
        const response = await api.get('/klines', {
            params: { symbol, interval, limit },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export const getTrades = async (symbol = 'BTC-USD', limit = 50) => {
    try {
        const response = await api.get('/trades', {
            params: { symbol, limit },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

export default api;
