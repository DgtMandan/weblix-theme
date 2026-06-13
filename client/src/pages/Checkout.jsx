import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CreditCard, Download, LockKeyhole, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { downloadProtectedFile } from '../utils/download.js';
import { SEO } from '../utils/seo.jsx';
import { formatUsd } from '../utils/currency.js';
import { trackEvent } from '../hooks/useAnalytics.js';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function Checkout() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [checkout, setCheckout] = useState(location.state?.checkout || null);
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  useEffect(() => {
    if (order) return;
    api.get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Order not found. Please start checkout again.'));
  }, [order, orderId]);

  useEffect(() => {
    if (searchParams.get('stripe') !== 'success') return;
    setLoading(true);
    api.post(`/orders/stripe-sync/${orderId}`)
      .then(async ({ data }) => {
        setOrder(data.order);
        if (data.downloadUrl) {
          await downloadProtectedFile(data.downloadUrl, `${data.order?.item?.slug || data.order?.item?.name || 'weblix-download'}.zip`);
          navigate('/dashboard');
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Stripe payment is still processing. Please refresh in a moment.'))
      .finally(() => setLoading(false));
  }, [navigate, orderId, searchParams]);

  const item = useMemo(() => order?.item || {}, [order]);

  async function verifyAndDownload(payload) {
    const { data } = await api.post('/orders/verify', payload);
    trackEvent('purchase_complete', { orderId: payload.orderId, status: payload.status });
    await downloadProtectedFile(data.downloadUrl, `${item.slug || item.name || 'weblix-download'}.zip`);
    navigate('/dashboard');
  }

  async function payNow() {
    if (!order) return;
    setError('');
    setLoading(true);
    try {
      let activeOrder = order;
      let activeCheckout = checkout;
      if (!checkout) {
        const created = await api.post('/orders', { itemType: order.itemType, itemId: order.item?._id || order.item, provider: 'auto' });
        activeOrder = created.data.order;
        activeCheckout = created.data.checkout;
        setOrder(created.data.order);
        setCheckout(created.data.checkout);
      }

      if (Number(activeOrder.amount || 0) <= 0) {
        await verifyAndDownload({
          orderId: activeOrder._id,
          providerPaymentId: `coupon_free_${Date.now()}`,
          status: 'paid'
        });
        return;
      }

      if (activeCheckout.sessionUrl) {
        window.location.href = activeCheckout.sessionUrl;
        return;
      }

      if (activeCheckout.razorpayKey && await loadRazorpay()) {
        new window.Razorpay({
          key: activeCheckout.razorpayKey,
          amount: activeCheckout.providerOrder.amount,
          currency: activeCheckout.currency,
          order_id: activeCheckout.providerOrderId,
          name: 'Weblix Website Builder',
          description: item.name || 'Secure Weblix digital download',
          prefill: { name: user?.name, email: user?.email },
          handler: (response) => verifyAndDownload({
            orderId: activeOrder._id,
            providerPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            status: 'paid'
          })
        }).open();
        return;
      }

      await verifyAndDownload({
        orderId: activeOrder._id,
        providerPaymentId: `dev_${Date.now()}`,
        status: 'paid'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function applyCoupon(event) {
    event.preventDefault();
    if (!order || !couponCode.trim()) return;
    setError('');
    setCouponMessage('');
    setLoading(true);
    try {
      const { data } = await api.post(`/orders/${order._id}/coupon`, { code: couponCode });
      trackEvent('coupon_apply', { orderId: order._id, couponCode });
      setOrder(data.order);
      setCheckout(data.checkout);
      setCouponMessage(`${data.order.couponCode} applied. You saved ${formatUsd(data.order.discountAmount)}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Coupon could not be applied.');
    } finally {
      setLoading(false);
    }
  }

  if (!order && !error) {
    return <div className="min-h-screen bg-[#0d0d0d] p-10 text-white">Loading checkout...</div>;
  }

  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-16 text-white">
      <SEO title="Checkout" description="Secure Weblix checkout and ZIP download page." />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#1b1b1b] p-8 md:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-[#2155FF]">
            <CreditCard />
          </div>
          <h1 className="mt-8 font-display text-5xl font-black leading-tight md:text-6xl">Secure checkout</h1>
          <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-white/55">
            Review your order, complete payment, and your ZIP file will download automatically after successful verification.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Protected payment', ShieldCheck],
              ['JWT secured order', LockKeyhole],
              ['Auto ZIP download', Download]
            ].map(([label, Icon]) => (
              <div key={label} className="rounded-[18px] border border-white/10 bg-[#0d0d0d] p-5">
                <Icon className="text-[#4F7BFF]" />
                <p className="mt-4 text-sm font-black text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#1b1b1b] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          {error ? (
            <div>
              <h2 className="text-2xl font-black">Checkout unavailable</h2>
              <p className="mt-4 rounded-[10px] border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">{error}</p>
              <Link to="/templates" className="mt-6 inline-flex rounded-[10px] bg-[#2155FF] px-5 py-3 text-sm font-black transition hover:bg-[#4F7BFF]">Back to templates</Link>
            </div>
          ) : (
            <>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#4F7BFF]">Order summary</p>
              <h2 className="mt-4 text-3xl font-black">{item.name || order.itemType}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-white/50">{item.description || 'Weblix secure digital product download.'}</p>
              <div className="mt-8 rounded-[18px] bg-[#0d0d0d] p-5">
                <div className="flex justify-between text-sm font-bold text-white/50"><span>Item type</span><span className="capitalize">{order.itemType}</span></div>
                <div className="mt-4 flex justify-between text-sm font-bold text-white/50"><span>Status</span><span className="capitalize">{order.status}</span></div>
                {order.originalAmount && order.discountAmount > 0 && (
                  <>
                    <div className="mt-4 flex justify-between text-sm font-bold text-white/50"><span>Original price</span><span>{formatUsd(order.originalAmount)}</span></div>
                    <div className="mt-4 flex justify-between text-sm font-bold text-[#48d88b]"><span>Coupon {order.couponCode}</span><span>-{formatUsd(order.discountAmount)}</span></div>
                  </>
                )}
                {order.licenseType === 'yearly' && (
                  <div className="mt-4 flex justify-between text-sm font-bold text-white/50">
                    <span>Renewal</span>
                    <span>{order.autoRenew ? 'Auto yearly renewal' : 'Manual yearly license'}</span>
                  </div>
                )}
                <div className="mt-4 flex justify-between text-xl font-black"><span>Total</span><span className="text-[#4F7BFF]">{formatUsd(order.amount)}</span></div>
              </div>
              <form onSubmit={applyCoupon} className="mt-4 rounded-[18px] border border-white/10 bg-[#0d0d0d] p-4">
                <label className="text-sm font900 text-white/70">Coupon code</label>
                <div className="mt-3 flex gap-2">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={order.status === 'paid' || order.discountAmount > 0} className="min-h-12 flex-1 rounded-[10px] border border-white/10 bg-[#111] px-4 uppercase outline-none focus:border-[#4F7BFF] disabled:opacity-50" placeholder="WEBLIX20" />
                  <button disabled={loading || order.status === 'paid' || order.discountAmount > 0} className="rounded-[10px] bg-white/10 px-4 text-sm font900 text-white transition hover:bg-[#2155FF] disabled:opacity-50">Apply</button>
                </div>
                {couponMessage && <p className="mt-3 text-sm font900 text-[#48d88b]">{couponMessage}</p>}
              </form>
              {error && <p className="mt-4 rounded-[10px] border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">{error}</p>}
              <button disabled={loading || order.status === 'paid'} onClick={payNow} className="mt-6 min-h-14 w-full rounded-[10px] bg-[#2155FF] text-sm font-black transition hover:bg-[#4F7BFF] disabled:cursor-not-allowed disabled:opacity-60">
                {order.status === 'paid' ? 'Already paid' : loading ? 'Processing...' : 'Pay now and download'}
              </button>
              <p className="mt-4 text-center text-xs font-bold text-white/35">Dev mode auto-verifies when Razorpay keys are not configured.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
