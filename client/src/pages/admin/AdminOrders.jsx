import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Receipt } from 'lucide-react';
import { api } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';
import { formatUsd } from '../../utils/currency.js';

function Badge({ value }) {
  return <span className={`rounded-[10px] px-3 py-1 text-xs font900 ${value === 'paid' ? 'bg-[#1f8f55]/15 text-[#48d88b]' : 'bg-[#2155FF]/15 text-[#4F7BFF]'}`}>{value}</span>;
}

function LicenseCell({ order }) {
  if (order.licenseType === 'lifetime') return <span className="text-[#48d88b]">Lifetime</span>;
  if (order.licenseType === 'yearly') {
    const renews = order.renewalDueAt ? new Date(order.renewalDueAt).toLocaleDateString() : 'pending';
    return (
      <span>
        Yearly {order.autoRenew ? 'auto-renew' : 'manual'}<br />
        <span className="text-white/35">Renews {renews}</span>
      </span>
    );
  }
  return <span>{order.licenseKey || '-'}</span>;
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => { api.get('/orders/admin/all').then(({ data }) => setOrders(data)).catch(() => setOrders([])); }, []);
  const visible = orders.filter((order) => `${order.item?.name} ${order.user?.email} ${order.status}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Manage Orders" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Orders</p><h1 className="mt-2 text-3xl font-black">Payment & download orders</h1></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="min-h-12 rounded-[10px] border border-white/10 bg-[#171717] px-4 outline-none" placeholder="Search orders" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] bg-[#171717] p-5"><Receipt className="text-[#4F7BFF]" /><p className="mt-4 text-sm text-white/45">Total Orders</p><h2 className="text-3xl font-black">{orders.length}</h2></div>
          <div className="rounded-[18px] bg-[#171717] p-5"><Download className="text-[#4F7BFF]" /><p className="mt-4 text-sm text-white/45">Paid Orders</p><h2 className="text-3xl font-black">{orders.filter((o) => o.status === 'paid').length}</h2></div>
          <div className="rounded-[18px] bg-[#171717] p-5"><p className="text-sm text-white/45">Revenue</p><h2 className="mt-4 text-3xl font-black text-[#4F7BFF]">{formatUsd(orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount, 0))}</h2></div>
        </div>
        <div className="mt-6 overflow-hidden rounded-[18px] border border-white/10 bg-[#171717]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#101010] text-xs font900 uppercase tracking-[0.12em] text-white/35"><tr><th className="px-5 py-4">Item</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">License</th></tr></thead>
              <tbody className="divide-y divide-white/10">{visible.map((order) => <tr key={order._id}><td className="px-5 py-4 font900">{order.item?.name || order.itemType}</td><td className="px-5 py-4 text-[#4F7BFF]">{order.user?.email}</td><td className="px-5 py-4">{formatUsd(order.amount)}</td><td className="px-5 py-4">{order.paymentProvider}</td><td className="px-5 py-4"><Badge value={order.status} /></td><td className="px-5 py-4 text-white/45"><LicenseCell order={order} /></td></tr>)}</tbody>
            </table>
          </div>
          {visible.length === 0 && <p className="p-8 text-center text-white/45">No orders found. Try buying a template or builder product first.</p>}
        </div>
        <Link to="/admin" className="mt-6 inline-flex rounded-[10px] bg-[#2155FF] px-4 py-3 text-sm font900">Back Dashboard</Link>
      </div>
    </section>
  );
}
