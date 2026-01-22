import React from 'react';

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
                <th>Time</th>
                <th>Side</th>
                <th className="text-right">Price</th>
                <th className="text-right">Filled/Qty</th>
                <th className="text-right">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="text-[var(--text-muted)]">
                    {order.created_at ? new Date(order.created_at).toLocaleTimeString() : '-'}
                  </td>
                  <td>
                    <span className={order.side === 'BUY' ? 'text-[var(--green-up)]' : 'text-[var(--red-down)]'}>
                      {order.side === 'BUY' ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="text-right">{order.price}</td>
                  <td className="text-right">{order.filled_quantity} / {order.quantity}</td>
                  <td className="text-right">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {['NEW', 'PARTIALLY_FILLED'].includes(order.status) && (
                      <button
                        onClick={() => onCancel(order.id)}
                        className="text-[var(--red-down)] hover:underline text-xs"
                      >
                        Cancel
                      </button>
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
