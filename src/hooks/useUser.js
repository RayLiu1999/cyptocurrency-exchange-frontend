import { useState, useEffect, useCallback } from 'react';
import { joinArena, getAccounts } from '../services/api';

const USER_ID_KEY = 'exchange_user_id';

/**
 * useUser Hook
 * 管理用戶狀態：自動加入並領取測試金，儲存 user_id 至 localStorage
 */
export function useUser() {
    const [userId, setUserId] = useState(null);
    const [balances, setBalances] = useState({
        USD: 0,
        BTC: 0,
        ETH: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 從 API 回傳解析餘額
    const parseBalances = (accounts) => {
        const newBalances = { USD: 0, BTC: 0, ETH: 0 };
        if (accounts && Array.isArray(accounts)) {
            accounts.forEach(acc => {
                const currency = acc.currency?.toUpperCase();
                const balance = parseFloat(acc.balance) || 0;
                if (currency in newBalances) {
                    newBalances[currency] = balance;
                }
            });
        }
        return newBalances;
    };

    // 刷新餘額（調用 GET /accounts）
    const refreshBalances = useCallback(async () => {
        if (!userId) return;
        try {
            const accounts = await getAccounts(userId);
            setBalances(parseBalances(accounts));
        } catch (err) {
            console.error('Failed to refresh balances:', err);
        }
    }, [userId]);

    // 初始化：檢查 localStorage 或調用 joinArena
    const initUser = useCallback(async () => {
        setLoading(true);
        try {
            const storedUserId = localStorage.getItem(USER_ID_KEY);
            
            if (storedUserId) {
                // 已有 user_id，調用 API 取得最新餘額
                setUserId(storedUserId);
                try {
                    const accounts = await getAccounts(storedUserId);
                    setBalances(parseBalances(accounts));
                } catch {
                    // API 失敗時使用預設值
                    setBalances({ USD: 100000, BTC: 10, ETH: 100 });
                }
            } else {
                // 調用 /test/join 取得新帳號
                const result = await joinArena();
                const newUserId = result.user_id;
                
                localStorage.setItem(USER_ID_KEY, newUserId);
                setUserId(newUserId);
                
                // 從 API 回傳中提取餘額
                if (result.accounts) {
                    setBalances(parseBalances(result.accounts));
                } else {
                    // 預設測試金額
                    setBalances({ USD: 100000, BTC: 10, ETH: 100 });
                }
            }
            setError(null);
        } catch (err) {
            console.error('Failed to init user:', err);
            setError(err.message || 'Failed to initialize user');
        } finally {
            setLoading(false);
        }
    }, []);

    // 重置用戶（清除 localStorage 並重新加入）
    const resetUser = useCallback(async () => {
        localStorage.removeItem(USER_ID_KEY);
        setUserId(null);
        await initUser();
    }, [initUser]);

    useEffect(() => {
        initUser();
    }, [initUser]);

    return {
        userId,
        balances,
        loading,
        error,
        resetUser,
        refreshBalances
    };
}
