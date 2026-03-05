import { useState, useCallback } from "react";
import * as api from "../services/api";

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await api.getOrders(userId);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const placeNewOrder = async (orderData) => {
    setLoading(true);
    try {
      const result = await api.placeOrder({ ...orderData, user_id: userId });
      await fetchOrders(); // Refresh list
      return result;
    } catch (err) {
      setError(err.message || "Failed to place order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelUserOrder = async (orderId) => {
    // setLoading(true); // Don't block whole UI for cancel
    try {
      await api.cancelOrder(orderId, userId);
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Failed to cancel order");
    }
  };

  const updateLocalOrder = useCallback((updatedOrder) => {
    setOrders((prev) => {
      const index = prev.findIndex((o) => o.id === updatedOrder.id);
      if (index > -1) {
        const newOrders = [...prev];
        newOrders[index] = { ...newOrders[index], ...updatedOrder };
        return newOrders;
      }
      return [updatedOrder, ...prev];
    });
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    placeNewOrder,
    cancelUserOrder,
    updateLocalOrder,
  };
}
