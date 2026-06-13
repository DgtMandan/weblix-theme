import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Layers, ShoppingBag } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { api, assetUrl } from '../services/api.js';
import { useCheckout } from '../hooks/useCheckout.js';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';
import { formatUsd } from '../utils/currency.js';

export function TemplateDetails() {
  const { slug } = useParams();
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState('');
  const { buy, loading } = useCheckout();

  useEffect(() => {
    setError('');
    setTemplate(null);
    api.get(`/templates/${slug}`)
      .then(({ data }) => setTemplate(data))
      .catch(() => setError('Template not found.'));
  }, [slug]);

  if (error) {
    return (
      <section className="grid min-h-screen place-items-center bg-[#0d0d0d] px-4 text-white">
        <SEO title="Template not found" />
        <div className="max-w-xl text-center">
          <h1 className="font-display text-5xl font-black">Template not found</h1>
          <p className="mt-4 text-white/55">{error}</p>
          <Link to="/templates" className="mt-8 inline-flex rounded-[10px] bg-[#2155FF] px-5 py-3 text-sm font-black transition hover:bg-[#4F7BFF]">Back to templates</Link>
        </div>
      </section>
    );
  }

  if (!template) return <div className="min-h-screen bg-[#0d0d0d] p-10 text-white">Loading template...</div>;

  return (
    <section className="bg-[#0d0d0d] py-16 text-white">
      <SEO title={template.name} description={template.description} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="rounded-[28px] border border-white/10 bg-[#1b1b1b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="grid aspect-[16/10] place-items-center overflow-hidden rounded-[20px] bg-[#0d0d0d]">
            {template.thumbnail ? (
              <img src={assetUrl(template.thumbnail)} alt={template.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_top,#2155FF_0%,#0d0d0d_55%)]">
                <Layers size={74} className="text-[#4F7BFF]" />
              </div>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mb-5 inline-flex rounded-full border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#4F7BFF]">Template ZIP</p>
          <h1 className="font-display text-5xl font-black leading-tight tracking-[-0.02em]">{template.name}</h1>
          <p className="mt-5 text-lg font-bold leading-8 text-white/58">{template.description}</p>
          <div className="mt-6 text-5xl font-black text-[#4F7BFF]">{formatUsd(template.price)}</div>
          <div className="mt-6 flex flex-wrap gap-2">
            {template.tags?.map((tag) => <span key={tag} className="rounded-full bg-white/8 px-3 py-1 text-xs font-black text-white/55">{tag}</span>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => buy('template', template._id)} disabled={loading}>
              <ShoppingBag size={18} /> {loading ? 'Creating order...' : 'Buy & Download'}
            </Button>
            {template.demoUrl && <Button to={template.demoUrl} variant="ghost"><ExternalLink size={18} /> Live Preview</Button>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
