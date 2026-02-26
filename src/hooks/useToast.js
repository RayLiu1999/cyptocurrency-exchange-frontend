import { useState, useCallback } from 'react';

let toastId = 0;

/**
 * useToast Hook
 * 管理 Toast 通知隊列
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const show = useCallback((message, type = 'info', duration = 3000) => {
        const id = ++toastId;
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        // 自動消失
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((message, duration = 3000) => {
        return show(message, 'success', duration);
    }, [show]);

    const error = useCallback((message, duration = 5000) => {
        return show(message, 'error', duration);
    }, [show]);

    const info = useCallback((message, duration = 3000) => {
        return show(message, 'info', duration);
    }, [show]);

    const warning = useCallback((message, duration = 4000) => {
        return show(message, 'warning', duration);
    }, [show]);

    return { toasts, show, dismiss, success, error, info, warning };
}
