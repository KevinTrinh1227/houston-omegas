'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Ticket, Calendar, Mail } from 'lucide-react';

interface OrderStatus {
  id: string;
  customer_email: string;
  status: string;
  amount: number;
  service_fee: number;
  payment_method: string | null;
  card_brand: string | null;
  card_last4: string | null;
  fulfilled: number;
  paid_at: string | null;
  created_at: string;
  items: { name: string; description: string; amount: number; quantity: number; total: number }[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError('Order not found');
        }
      } catch {
        setError('Failed to load order status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [sessionId]);

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (date: string) => new Date(date + 'Z').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const isPaid = order?.status === 'paid' || order?.status === 'fulfilled';

  if (loading) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-2xl mx-auto text-center">
          <Loader2 size={48} className="mx-auto text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Loading order status...</p>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  if (error || !order) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-2xl mx-auto text-center">
          <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-6">{error || 'Could not find your order'}</p>
          <Link href="/events" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} />
            Back to Events
          </Link>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar variant="light" />
      <div className="pt-28 pb-20 px-6 sm:px-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {isPaid ? (
            <>
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-500">Thank you for your purchase</p>
            </>
          ) : (
            <>
              <Loader2 size={64} className="mx-auto text-yellow-500 animate-spin mb-4" />
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                Processing Payment
              </h1>
              <p className="text-gray-500">Please wait while we confirm your payment</p>
            </>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Order ID</span>
              <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{order.id.substring(0, 12)}...</code>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4 mb-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Ticket size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatAmount(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              {order.service_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Fee</span>
                  <span className="text-gray-600">{formatAmount(order.service_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatAmount(order.amount)}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Confirmation sent to</p>
                <p className="text-sm text-gray-900">{order.customer_email}</p>
              </div>
            </div>
            {order.paid_at && (
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Payment date</p>
                  <p className="text-sm text-gray-900">{formatDate(order.paid_at)}</p>
                </div>
              </div>
            )}
            {order.card_brand && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div>
                  <p className="text-xs text-gray-500">Payment method</p>
                  <p className="text-sm text-gray-900">
                    {order.card_brand === 'cashapp' ? 'Cash App' : `${order.card_brand?.toUpperCase()} ****${order.card_last4}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all"
          >
            <ArrowLeft size={14} />
            Back to Events
          </Link>
        </div>
      </div>
      <Footer variant="light" />
    </PageWrapper>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-2xl mx-auto text-center">
          <Loader2 size={48} className="mx-auto text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    }>
      <SuccessContent />
    </Suspense>
  );
}
