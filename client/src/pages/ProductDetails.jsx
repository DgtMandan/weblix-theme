import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { api, assetUrl } from '../services/api.js';
import { useCheckout } from '../hooks/useCheckout.js';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';
import { formatUsd } from '../utils/currency.js';

export function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const { buy, loading } = useCheckout();

  useEffect(() => {
    setError('');
    api.get(`/products/${slug}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError('Product not found.'));
  }, [slug]);

  if (error) {
    return (
      <section className="grid min-h-screen place-items-center bg-[#0d0d0d] px-4 text-white">
        <SEO title="Product not found" />
        <div className="max-w-xl text-center">
          <h1 className="font-display text-5xl font-black">Product not found</h1>
          <p className="mt-4 text-white/55">{error}</p>
          <Link to="/pricing" className="mt-8 inline-flex rounded-[10px] bg-[#2155FF] px-5 py-3 text-sm font-black transition hover:bg-[#4F7BFF]">View pricing</Link>
        </div>
      </section>
    );
  }

  if (!product) return <div className="min-h-screen bg-[#0d0d0d] p-10 text-white">Loading product...</div>;

  return (
    <section className="overflow-hidden bg-[#0d0d0d] py-16 text-white">
      <SEO title={product.name} description={product.description} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1fr_0.9fr]">
        <Reveal>
          <p className="mb-5 inline-flex rounded-full border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#4F7BFF]">Builder ZIP</p>
          <h1 className="font-display text-5xl font-black leading-tight tracking-[-0.02em] md:text-7xl">{product.name}</h1>
          <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-white/58">{product.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="text-5xl font-black text-[#4F7BFF]">{formatUsd(product.price)}</span>
            {product.compareAtPrice && <span className="text-xl font-bold text-white/35 line-through">{formatUsd(product.compareAtPrice)}</span>}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => buy('product', product._id)} disabled={loading}>
              {loading ? 'Creating order...' : 'Buy Builder ZIP'}
            </Button>
            <Button to="/pricing" variant="ghost">Compare Plans</Button>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="rounded-[28px] border border-white/10 bg-[#1b1b1b] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-8">
          <div className="grid aspect-[16/11] place-items-center overflow-hidden rounded-[20px] bg-[#0d0d0d]">
            {product.screenshots?.[0] ? (
              <img src={assetUrl(product.screenshots[0])} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_top,#2155FF_0%,#0d0d0d_48%,#06134A_100%)]">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((item) => <span key={item} className="h-16 w-16 rounded-[14px] bg-[#4F7BFF]" />)}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['Secure license', ShieldCheck],
              ['Auto download', Download],
              ['Premium UI', Sparkles]
            ].map(([label, Icon]) => (
              <div key={label} className="rounded-[16px] bg-[#0d0d0d] p-4">
                <Icon className="text-[#4F7BFF]" />
                <p className="mt-3 text-sm font-black text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 max-w-7xl px-4">
        <Reveal className="rounded-[28px] bg-[#1b1b1b] p-8 md:p-10">
          <h2 className="text-3xl font-black">Included features</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {product.features?.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-[16px] bg-[#0d0d0d] p-4">
                <CheckCircle2 className="shrink-0 text-[#4F7BFF]" />
                <span className="font-bold text-white/75">{feature}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
