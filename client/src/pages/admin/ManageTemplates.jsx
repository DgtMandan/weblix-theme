import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { api } from '../../services/api.js';

const initial = {
  name: '',
  description: '',
  price: '',
  tags: 'Digital,SaaS',
  demoUrl: '',
  thumbnail: null,
  previewImages: [],
  zip: null
};

export function ManageTemplates() {
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
      ['name', 'description', 'price', 'tags', 'demoUrl'].forEach((key) => data.append(key, form[key]));
      if (form.thumbnail) data.append('thumbnail', form.thumbnail);
      if (form.zip) data.append('zip', form.zip);
      form.previewImages.forEach((file) => data.append('previewImages', file));
      await api.post('/admin/templates', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Template created with images and ZIP. It is now visible on the Home Template ZIP files section and Templates page. Buyers download this exact ZIP after payment.');
      setForm(initial);
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Template upload failed.');
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
              <h1 className="text-3xl font-black text-white">Add Template ZIP</h1>
              <p className="mt-2 text-sm text-white/55">Upload thumbnail, preview images and the paid ZIP file. After payment, this exact ZIP downloads automatically.</p>
            </div>
            <Link to="/templates" className="text-sm font900 text-lightBlue transition hover:text-white">View Templates</Link>
          </div>
          {message && <div className="mt-5 rounded-[10px] border border-lightBlue/30 bg-lightBlue/10 p-4 text-sm font800 text-lightBlue">{message}</div>}
          {error && <div className="mt-5 rounded-[10px] border border-red-400/30 bg-red-500/10 p-4 text-sm font800 text-red-200">{error}</div>}
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input required className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="number" className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Price USD" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <textarea required className="min-h-28 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Template description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Tags comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Demo / live preview URL" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4">
                <span className="text-sm font900 text-white">Thumbnail image</span>
                <input required type="file" accept=".png,.jpg,.jpeg,.webp" className="mt-3 w-full text-sm text-white/60" onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })} />
              </label>
              <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4">
                <span className="text-sm font900 text-white">Preview images</span>
                <input type="file" multiple accept=".png,.jpg,.jpeg,.webp" className="mt-3 w-full text-sm text-white/60" onChange={(e) => setForm({ ...form, previewImages: [...e.target.files] })} />
              </label>
              <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4">
                <span className="text-sm font900 text-white">Template ZIP file</span>
                <input required type="file" accept=".zip" className="mt-3 w-full text-sm text-white/60" onChange={(e) => setForm({ ...form, zip: e.target.files[0] })} />
              </label>
            </div>
            <Button disabled={loading}>{loading ? 'Uploading...' : 'Create Template & Upload ZIP'}</Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
