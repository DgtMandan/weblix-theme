import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { api } from '../../services/api.js';

const initial = {
  name: 'Weblix Website Builder',
  slug: 'weblix-builder-yearly',
  description: '',
  longDescription: '',
  price: '',
  compareAtPrice: '',
  billingCycle: 'one-time',
  licenseDurationDays: '',
  license: 'single-site',
  features: 'React + Vite frontend, Node Express backend, MongoDB database, Admin dashboard, Payment and secure downloads',
  screenshots: [],
  zip: null
};

export function ManageProducts() {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      ['name', 'slug', 'description', 'longDescription', 'price', 'compareAtPrice', 'billingCycle', 'licenseDurationDays', 'license'].forEach((key) => {
        if (form[key] !== '') data.append(key, form[key]);
      });
      data.append('features', form.features.split(',').map((item) => item.trim()).filter(Boolean));
      if (form.zip) data.append('zip', form.zip);
      form.screenshots.forEach((file) => data.append('screenshots', file));
      await api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Builder product saved. Buyers on the product page will receive this ZIP after payment.');
      e.target.reset();
      setForm(initial);
    } catch (err) {
      setError(err.response?.data?.message || 'Builder product upload failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-[#0d0d0d] py-10 text-white">
      <div className="mx-auto max-w-5xl px-4">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white">Builder Theme Product</h1>
              <p className="mt-2 text-sm text-white/55">Upload the main Weblix Website Builder ZIP. When someone buys from the product page, this ZIP downloads automatically.</p>
            </div>
            <Link to="/pricing" className="text-sm font900 text-lightBlue transition hover:text-white">View Builder Plans</Link>
          </div>
          {message && <div className="mt-5 rounded-[10px] border border-lightBlue/30 bg-lightBlue/10 p-4 text-sm font800 text-lightBlue">{message}</div>}
          {error && <div className="mt-5 rounded-[10px] border border-red-400/30 bg-red-500/10 p-4 text-sm font800 text-red-200">{error}</div>}
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input required className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <input required type="number" className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Price USD" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input type="number" className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Compare price USD" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
              <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="License" value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <select className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value, licenseDurationDays: e.target.value === 'yearly' ? '365' : '' })}>
                <option value="one-time">One-time</option>
                <option value="yearly">Yearly license</option>
                <option value="lifetime">Lifetime license</option>
              </select>
              <input type="number" className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="License duration days (365 for yearly)" value={form.licenseDurationDays} onChange={(e) => setForm({ ...form, licenseDurationDays: e.target.value })} />
            </div>
            <textarea required className="min-h-24 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <textarea className="min-h-32 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Long description" value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} />
            <textarea className="min-h-24 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Features comma separated" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4">
                <span className="text-sm font900 text-white">Product screenshots</span>
                <input type="file" multiple accept=".png,.jpg,.jpeg,.webp" className="mt-3 w-full text-sm text-white/60" onChange={(e) => setForm({ ...form, screenshots: [...e.target.files] })} />
              </label>
              <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4">
                <span className="text-sm font900 text-white">Builder theme ZIP</span>
                <input required type="file" accept=".zip" className="mt-3 w-full text-sm text-white/60" onChange={(e) => setForm({ ...form, zip: e.target.files[0] })} />
              </label>
            </div>
            <Button disabled={loading}>{loading ? 'Uploading...' : 'Save Builder Product ZIP'}</Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
