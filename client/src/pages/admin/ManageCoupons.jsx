import { useEffect, useState } from 'react';
import { BadgePercent, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { api } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';
import { formatUsd } from '../../utils/currency.js';

const initial = {
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  appliesTo: 'all',
  productBillingCycle: 'all',
  minimumAmount: '',
  maxUses: '',
  expiresAt: '',
  isActive: true
};

export function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function loadCoupons() {
    api.get('/admin/coupons').then(({ data }) => setCoupons(data)).catch(() => setCoupons([]));
  }

  useEffect(() => { loadCoupons(); }, []);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.post('/admin/coupons', {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: Number(form.discountValue),
        minimumAmount: Number(form.minimumAmount || 0),
        maxUses: Number(form.maxUses || 0),
        expiresAt: form.expiresAt || undefined
      });
      setMessage('Coupon saved. Buyers can use this code at checkout.');
      setForm(initial);
      loadCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Coupon could not be saved.');
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    await api.delete(`/admin/coupons/${id}`);
    loadCoupons();
  }

  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Manage Coupons" />
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#2155FF]/15 text-[#4F7BFF]"><BadgePercent /></span>
          <div>
            <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Coupons</p>
            <h1 className="text-3xl font-black">Builder ZIP & template discounts</h1>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={submit} className="rounded-[18px] border border-white/10 bg-[#171717] p-6">
            <h2 className="text-xl font-black">Create coupon</h2>
            {message && <div className="mt-4 rounded-[10px] bg-[#4F7BFF]/10 p-3 text-sm font900 text-[#4F7BFF]">{message}</div>}
            {error && <div className="mt-4 rounded-[10px] bg-red-500/10 p-3 text-sm font900 text-red-200">{error}</div>}
            <div className="mt-5 grid gap-3">
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 uppercase outline-none focus:border-[#4F7BFF]" placeholder="Coupon code, e.g. WEBLIX20" />
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Description" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]">
                  <option value="percent">Percent off</option>
                  <option value="fixed">Fixed USD off</option>
                </select>
                <input required type="number" min="1" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder={form.discountType === 'percent' ? '20' : '10'} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]">
                  <option value="all">Builder + templates</option>
                  <option value="product">Builder ZIP only</option>
                  <option value="template">Templates only</option>
                </select>
                <select value={form.productBillingCycle} onChange={(e) => setForm({ ...form, productBillingCycle: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]">
                  <option value="all">All builder plans</option>
                  <option value="yearly">Yearly builder</option>
                  <option value="lifetime">Lifetime builder</option>
                  <option value="one-time">One-time product</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="number" min="0" value={form.minimumAmount} onChange={(e) => setForm({ ...form, minimumAmount: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Minimum amount" />
                <input type="number" min="0" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Max uses, 0 unlimited" />
              </div>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" />
              <label className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-sm font900 text-white/70">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Coupon active
              </label>
              <Button disabled={loading}>{loading ? 'Saving...' : 'Save Coupon'}</Button>
            </div>
          </form>

          <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#171717]">
            <div className="border-b border-white/10 p-5">
              <h2 className="text-xl font-black">Active coupon list</h2>
              <p className="mt-1 text-sm text-white/45">Use these codes for builder ZIP and template checkout discounts.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#101010] text-xs font900 uppercase tracking-[0.12em] text-white/35">
                  <tr><th className="px-5 py-4">Code</th><th className="px-5 py-4">Discount</th><th className="px-5 py-4">Applies</th><th className="px-5 py-4">Uses</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="px-5 py-4 font900 text-[#4F7BFF]">{coupon.code}<p className="mt-1 text-xs font700 text-white/35">{coupon.description}</p></td>
                      <td className="px-5 py-4">{coupon.discountType === 'percent' ? `${coupon.discountValue}% off` : `${formatUsd(coupon.discountValue)} off`}</td>
                      <td className="px-5 py-4 capitalize">{coupon.appliesTo}{coupon.appliesTo === 'product' ? ` / ${coupon.productBillingCycle}` : ''}</td>
                      <td className="px-5 py-4">{coupon.usedCount || 0}{coupon.maxUses ? ` / ${coupon.maxUses}` : ' / unlimited'}</td>
                      <td className="px-5 py-4"><span className={`rounded-[10px] px-3 py-1 text-xs font900 ${coupon.isActive ? 'bg-[#1f8f55]/15 text-[#48d88b]' : 'bg-white/10 text-white/45'}`}>{coupon.isActive ? 'Active' : 'Off'}</span></td>
                      <td className="px-5 py-4"><button onClick={() => remove(coupon._id)} className="grid h-9 w-9 place-items-center rounded-[10px] bg-red-500/10 text-red-200 hover:bg-red-500/20"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {coupons.length === 0 && <p className="p-8 text-center text-white/45">No coupons yet. Create one like WEBLIX20.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
