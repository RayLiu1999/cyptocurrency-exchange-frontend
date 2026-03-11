import React from 'react';
import { formatPrice, formatQty } from '../utils/format';

export default function OrderList({ orders = [], onCancel, loading }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW': return 'badge-new';
      case 'FILLED': return 'badge-filled';
      case 'CANCELED': return 'badge-canceled';
      case 'PARTIALLY_FILLED': return 'badge-partial';
      default: return 'badge-new';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
        載入中...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <h3 className="font-display font-semibold text-sm">My Orders</h3>
        <span className="text-[var(--text-muted)] text-xs">{orders.length} 筆</span>
      </div>

      <div className="flex-1 overflow-auto">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
            暫無訂單
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left whitespace-nowrap">Time</th>
                <th className="text-left whitespace-nowrap">Symbol</th>
                <th className="text-left whitespace-nowrap">Side</th>
                <th className="text-center whitespace-nowrap">Price</th>
                <th className="text-center whitespace-nowrap">Filled/Qty</th>
                <th className="text-center whitespace-nowrap">Status</th>
                <th className="text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="text-left text-[var(--text-muted)] whitespace-nowrap">
                    {order.created_at
                      ? new Date(typeof order.created_at === 'number' ? order.created_at : Number(order.created_at)).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\//g, '-')
                      : '-'}
                  </td>
                  <td className="text-left whitespace-nowrap font-mono font-bold">
                    {order.symbol}
                  </td>
                  <td className="text-left whitespace-nowrap">
                    <span className={order.side === 'BUY' ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]'}>
                      {order.side === 'BUY' ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="text-center whitespace-nowrap">{formatPrice(order.price)}</td>
                  <td className="text-center whitespace-nowrap">{formatQty(order.filled_quantity)} / {formatQty(order.quantity)}</td>
                  <td className="text-center whitespace-nowrap">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-center whitespace-nowrap">
                    {['NEW', 'PARTIALLY_FILLED'].includes(order.status) ? (
                      <button
                        onClick={() => onCancel(order.id)}
                        className="text-[var(--red-down)] hover:underline text-xs"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
