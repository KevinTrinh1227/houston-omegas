'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, RefreshCcw, Clock, CheckCircle, XCircle } from 'lucide-react';

interface PaymentStats {
  stats: {
    totalOrders: number;
    paidOrders: number;
    totalRevenue: number;
    totalFees: number;
    refundedOrders: number;
    disputedOrders: number;
    failedOrders: number;
    netRevenue: number;
  };
  revenueByType: { type: string; count: number; total: number }[];
  recentOrders: {
    id: string;
    customer_email: string;
    status: string;
    amount: number;
    payment_method: string | null;
    card_brand: string | null;
    card_last4: string | null;
    paid_at: string | null;
    created_at: string;
    metadata: { type?: string; event_title?: string; semester?: string; member_name?: string } | null;
  }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  fulfilled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  created: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  checkout_started: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  expired: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  refunded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  partially_refunded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  disputed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  paid: <CheckCircle size={12} />,
  fulfilled: <CheckCircle size={12} />,
  created: <Clock size={12} />,
  checkout_started: <Clock size={12} />,
  expired: <XCircle size={12} />,
  cancelled: <XCircle size={12} />,
  refunded: <RefreshCcw size={12} />,
  partially_refunded: <RefreshCcw size={12} />,
  disputed: <AlertTriangle size={12} />,
};

export default function PaymentsPage() {
  const { member } = useAuth();
  const [data, setData] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/admin/stats?period=${period}`, { credentials: 'include' });
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const fmtCompact = (cents: number) => {
    const dollars = cents / 100;
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
    return `$${dollars.toFixed(0)}`;
  };

  const formatDate = (date: string) => new Date(date + 'Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const getOrderDescription = (order: PaymentStats['recentOrders'][0]) => {
    if (!order.metadata) return 'Payment';
    if (order.metadata.type === 'event_ticket') return order.metadata.event_title || 'Event Ticket';
    if (order.metadata.type === 'dues') return `${order.metadata.semester || ''} Dues - ${order.metadata.member_name || ''}`;
    return 'Payment';
  };

  if (!member || !['admin', 'president', 'treasurer'].includes(member.role)) {
    return (
      <div className="text-center py-12">
        <p className="text-dash-text-muted">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Payments</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Revenue and transaction overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-dash-card border border-dash-border rounded-lg text-sm text-dash-text"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={fetchStats}
            className="p-2 bg-dash-card border border-dash-border rounded-lg hover:border-dash-text-muted transition-colors"
            title="Refresh"
          >
            <RefreshCcw size={16} className={`text-dash-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
        </div>
      ) : data ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-dash-card rounded-xl border border-dash-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-500" />
                <span className="text-[10px] text-dash-text-muted uppercase tracking-wider">Revenue</span>
              </div>
              <p className="text-lg font-semibold text-dash-text">{fmt(data.stats.totalRevenue)}</p>
              <p className="text-xs text-dash-text-muted mt-0.5">{data.stats.paidOrders} orders</p>
            </div>
            <div className="bg-dash-card rounded-xl border border-dash-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-blue-500" />
                <span className="text-[10px] text-dash-text-muted uppercase tracking-wider">Net Revenue</span>
              </div>
              <p className="text-lg font-semibold text-dash-text">{fmt(data.stats.netRevenue)}</p>
              <p className="text-xs text-dash-text-muted mt-0.5">After fees</p>
            </div>
            <div className="bg-dash-card rounded-xl border border-dash-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={16} className="text-purple-500" />
                <span className="text-[10px] text-dash-text-muted uppercase tracking-wider">Fees Collected</span>
              </div>
              <p className="text-lg font-semibold text-dash-text">{fmt(data.stats.totalFees)}</p>
              <p className="text-xs text-dash-text-muted mt-0.5">5% service fee</p>
            </div>
            <div className="bg-dash-card rounded-xl border border-dash-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="text-[10px] text-dash-text-muted uppercase tracking-wider">Issues</span>
              </div>
              <p className="text-lg font-semibold text-dash-text">{data.stats.refundedOrders + data.stats.disputedOrders}</p>
              <p className="text-xs text-dash-text-muted mt-0.5">{data.stats.refundedOrders} refunds, {data.stats.disputedOrders} disputes</p>
            </div>
          </div>

          {/* Revenue by Type */}
          {data.revenueByType.length > 0 && (
            <div className="bg-dash-card rounded-xl border border-dash-border p-5 mb-6">
              <h2 className="text-sm font-medium text-dash-text mb-4">Revenue by Type</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data.revenueByType.map((item) => (
                  <div key={item.type} className="text-center p-3 bg-dash-card-hover rounded-lg">
                    <p className="text-xs text-dash-text-muted uppercase tracking-wider mb-1">
                      {item.type === 'event_ticket' ? 'Events' : item.type === 'dues' ? 'Dues' : item.type || 'Other'}
                    </p>
                    <p className="text-lg font-semibold text-dash-text">{fmtCompact(item.total)}</p>
                    <p className="text-[10px] text-dash-text-muted">{item.count} orders</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Revenue Chart */}
          {data.dailyRevenue.length > 0 && (
            <div className="bg-dash-card rounded-xl border border-dash-border p-5 mb-6">
              <h2 className="text-sm font-medium text-dash-text mb-4">Daily Revenue (Last 30 Days)</h2>
              <div className="flex items-end gap-1 h-32">
                {data.dailyRevenue.map((day, i) => {
                  const maxRevenue = Math.max(...data.dailyRevenue.map(d => d.revenue));
                  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group" title={`${day.date}: ${fmt(day.revenue)}`}>
                      <div
                        className="w-full bg-green-500 rounded-t transition-all hover:bg-green-400"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-dash-text-muted">
                <span>{data.dailyRevenue[0]?.date}</span>
                <span>{data.dailyRevenue[data.dailyRevenue.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-dash-card rounded-xl border border-dash-border overflow-hidden">
            <div className="px-5 py-4 border-b border-dash-border">
              <h2 className="text-sm font-medium text-dash-text">Recent Transactions</h2>
            </div>
            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-dash-text-muted">
                No transactions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-dash-border">
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Description</th>
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Customer</th>
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Amount</th>
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Status</th>
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Date</th>
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-dash-border/50 hover:bg-dash-card-hover transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-xs font-medium text-dash-text truncate max-w-[200px]">
                            {getOrderDescription(order)}
                          </p>
                          <code className="text-[10px] text-dash-text-muted">{order.id.substring(0, 8)}</code>
                        </td>
                        <td className="px-5 py-3 text-xs text-dash-text">{order.customer_email}</td>
                        <td className="px-5 py-3 text-xs font-medium text-dash-text">{fmt(order.amount)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_ICONS[order.status]}
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-dash-text-secondary">
                          {formatDate(order.paid_at || order.created_at)}
                        </td>
                        <td className="px-5 py-3 text-xs text-dash-text-secondary">
                          {order.card_brand === 'cashapp' ? 'Cash App' :
                            order.card_brand ? `${order.card_brand.toUpperCase()} ****${order.card_last4}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">
          Failed to load payment data
        </div>
      )}
    </div>
  );
}
