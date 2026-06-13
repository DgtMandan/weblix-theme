import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, Cloud, Code2, Headphones, Infinity, LayoutTemplate, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';
import { api } from '../services/api.js';
import { useCheckout } from '../hooks/useCheckout.js';

const planFeatures = {
  pro: [
    'Weblix Builder ZIP download',
    'One year of product updates',
    'License key in customer dashboard',
    'Protected ZIP downloads',
    'Branded purchase email',
    'Template marketplace access',
    'Setup and email support'
  ],
  lifetime: [
    'Permanent Weblix Builder access',
    'Lifetime download access',
    'All included template packs',
    'Commercial project usage',
    'Priority product support'
  ]
};

const benefits = [
  ['Builder ZIP delivery', 'Customers receive the exact Weblix Builder package after successful checkout.', LayoutTemplate],
  ['Yearly and lifetime licenses', 'Sell renewable yearly access or permanent lifetime access from the same system.', Sparkles],
  ['Protected downloads', 'ZIP files stay private and unlock only after verified payment.', ShieldCheck],
  ['Template marketplace', 'Upload paid template ZIPs with thumbnails, preview images, categories, and prices.', Infinity],
  ['SEO blog dashboard', 'Publish Weblix guides, SEO articles, and trending AI website builder content.', Code2],
  ['Customer dashboard', 'Buyers can view orders, licenses, billing history, and downloads anytime.', Cloud],
  ['Payment-ready flow', 'Use Razorpay for one-time purchases and Stripe subscriptions for yearly renewals.', Zap],
  ['Admin controls', 'Manage products, templates, blogs, users, orders, and settings from one dashboard.', CheckCircle2],
  ['Support-ready records', 'Every order keeps license details, renewal dates, and secure download history.', Headphones]
];

const platformRows = [
  ['Builder ZIP', 'Included', 'Included', true],
  ['License key', 'Yearly renewal', 'Lifetime', true],
  ['Dashboard downloads', 'Included', 'Included', true],
  ['Template ZIPs', 'Marketplace access', 'Included pack', true],
  ['Purchase email', 'Included', 'Included', true],
  ['Admin management', 'Included', 'Included', true],
  ['Support', 'Standard', 'Priority', true]
];

const faqs = [
  ['Why choose Weblix Website Builder?', 'Weblix combines builder sales, template marketplace, secure downloads, auth, payments, blogs, and admin controls in one MERN SaaS system.'],
  ['Can I sell paid templates?', 'Yes. Admins can create templates, upload ZIP files and preview images, then customers can pay and download securely.'],
  ['Does payment unlock downloads?', 'Yes. Paid orders generate a download record that appears in the customer dashboard.'],
  ['Can I add blog posts?', 'Yes. Admins can publish posts manually, and the backend includes scheduled trend-draft generation.'],
  ['How does yearly licensing work?', 'Yearly plans create a renewal date and can use Stripe subscription webhooks to keep the license active automatically.'],
  ['What happens with lifetime access?', 'Lifetime plans do not expire. The customer keeps access to the purchased builder ZIP and included downloads.'],
  ['Can I use it for client websites?', 'Yes. License terms can be configured around your business rules and displayed in the customer dashboard.']
];

const builderPlans = [
  {
    title: 'Weblix Builder Yearly',
    price: '99',
    period: 'yr',
    slug: 'weblix-builder-yearly',
    badge: 'YEARLY',
    description: 'Annual Weblix Builder ZIP license with one year of downloads, updates, renewal tracking, and customer dashboard access.',
    features: planFeatures.pro,
    highlighted: true,
    cta: 'Start yearly license'
  },
  {
    title: 'Weblix Builder Lifetime',
    price: '149',
    period: 'once',
    slug: 'weblix-builder-lifetime',
    badge: 'LIFETIME',
    description: 'One payment for permanent Weblix Builder ZIP access, lifetime downloads, updates, and priority product support.',
    features: planFeatures.lifetime,
    highlighted: false,
    cta: 'Buy lifetime license'
  }
];

function PlanCard({ title, price, period, features, highlighted, description, badge, cta, slug, productsBySlug, buy, loading }) {
  const product = productsBySlug[slug];
  const canBuy = Boolean(product?._id);
  return (
    <div className={`relative flex h-full min-h-[620px] flex-col rounded-[18px] border p-6 ${highlighted ? 'border-[#2155FF] bg-[#050505] shadow-[0_0_0_1px_rgba(33,85,255,0.45),0_30px_120px_rgba(33,85,255,0.18)]' : 'border-white/12 bg-[#050505]'}`}>
      <div>
        {badge && <span className="absolute right-4 top-4 rounded-[10px] bg-white px-3 py-1 text-[10px] font900 text-[#0A0F2C]">{badge}</span>}
        <p className="text-sm font900 text-[#2155FF]">{title}</p>
        <h3 className="mt-6 text-4xl font-black">${price}<span className="text-base font700 text-white/45">/{period}</span></h3>
        <p className="mt-3 min-h-20 text-sm leading-6 text-white/48">{description}</p>
        {canBuy ? (
          <button type="button" onClick={() => buy('product', product._id)} disabled={loading} className="mt-6 flex min-h-11 w-full items-center justify-center rounded-[10px] bg-white px-5 py-3 text-sm font900 text-[#0A0F2C] transition hover:bg-[#4F7BFF] hover:text-white disabled:cursor-not-allowed disabled:opacity-55">
            {loading ? 'Creating order...' : cta}
          </button>
        ) : (
          <Link to={`/product/${slug}`} className="mt-6 flex min-h-11 w-full items-center justify-center rounded-[10px] bg-white px-5 py-3 text-sm font900 text-[#0A0F2C] transition hover:bg-[#4F7BFF] hover:text-white">
            View product
          </Link>
        )}
        <div className="mt-6 h-px bg-white/10" />
        <div className="mt-6 grid gap-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-sm text-white/75">
              <CheckCircle2 size={16} className="text-[#2155FF]" />
              {feature}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-auto rounded-[10px] bg-[#2155FF]/12 px-4 py-3 text-center text-xs font800 text-[#4F7BFF]">
        {canBuy ? `${product.billingCycle || 'one-time'} license checkout ready` : 'Product page available. Add this plan in admin to enable checkout.'}
      </p>
    </div>
  );
}

function PricingCards({ reveal = false, productsBySlug, buy, loading }) {
  const plans = builderPlans;
  return (
    <div className="mt-12 grid items-stretch gap-7 text-left md:grid-cols-2">
      {plans.map((plan, index) => {
        const card = <PlanCard key={plan.title} {...plan} productsBySlug={productsBySlug} buy={buy} loading={loading} />;
        return reveal ? <Reveal key={plan.title} delay={index * 0.08}>{card}</Reveal> : card;
      })}
    </div>
  );
}

export function Pricing() {
  const [productsBySlug, setProductsBySlug] = useState({});
  const { buy, loading } = useCheckout();

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => {
        const mapped = {};
        data.forEach((product) => { mapped[product.slug] = product; });
        setProductsBySlug(mapped);
      })
      .catch(() => setProductsBySlug({}));
  }, []);

  return (
    <section className="bg-[#0d0d0d] text-white">
      <SEO title="Pricing" />
      <section className="px-4 pb-24 pt-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font900 text-[#2155FF]">Pricing</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-display text-5xl font-black leading-[1.05] tracking-[-0.04em] md:text-7xl">
            Weblix Builder pricing for serious website delivery.
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm font800 text-white/65">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#28e989]" /> Builder ZIP delivery</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#28e989]" /> Yearly or lifetime license</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#28e989]" /> Secure customer downloads</span>
          </div>
          <div className="mx-auto max-w-4xl">
            <PricingCards reveal productsBySlug={productsBySlug} buy={buy} loading={loading} />
          </div>
        </div>
      </section>

      <section className="rounded-t-[30px] border-t border-white/10 bg-[#0d0d0d] px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-sm font900 text-[#2155FF]">Built for Weblix products</p>
            <h2 className="mt-5 max-w-4xl font-display text-4xl font-black leading-tight tracking-[-0.03em] md:text-5xl">
              Choose the license that matches how you deliver websites.
            </h2>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-white/55">
              Weblix Builder ZIP pricing is now simple: choose yearly access for renewable updates or lifetime access for permanent builder downloads.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map(([title, text, Icon], index) => (
              <Reveal key={title} delay={index * 0.03} className="rounded-[14px] border border-white/10 bg-[#050505] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                <Icon className="text-[#2155FF]" size={20} />
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 rounded-[14px] bg-[#2155FF] p-10 text-center text-white">
            <p className="mx-auto max-w-3xl text-lg font700 leading-8">Weblix keeps the full purchase journey connected: customer account, payment, license, ZIP file, email receipt, and dashboard download.</p><p className="mt-5 text-sm font900">Weblix delivery workflow</p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-sm font900 text-[#2155FF]">Plan details</p>
            <h2 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight md:text-5xl">
              Everything customers need after buying Weblix.
            </h2>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-white/45">Both yearly and lifetime plans connect to the same secure checkout, license, email, and download system.</p>
          </Reveal>
          <div className="mt-9 overflow-x-auto rounded-[16px] border border-white/10 bg-[#050505] p-4 md:p-6">
            <div className="grid min-w-[760px] grid-cols-7 gap-4 md:min-w-[900px]">
              {platformRows.map(([name, yearly, lifetime, best]) => (
                <div key={name} className={`rounded-[12px] p-4 text-center ${best ? 'border border-[#2155FF] bg-[#2155FF]/10' : 'bg-white/5'}`}>
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-[10px] bg-white/10 text-sm font-black text-[#4F7BFF]">{name.slice(0, 1)}</div>
                  <p className="mt-3 text-sm font-black">{name}</p>
                  <p className="mt-4 text-xs text-white/45">Yearly</p>
                  <p className="font900 text-[#28e989]">{yearly}</p>
                  <p className="mt-3 text-xs text-white/45">Lifetime</p>
                  <p className="font900">{lifetime}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-sm font900 text-[#2155FF]">After purchase</p>
            <h2 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight md:text-5xl">
              A clear license and download experience for every buyer.
            </h2>
            <p className="mt-3 text-2xl font-black text-white/35">No manual file sending. No public ZIP exposure.</p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Reveal className="rounded-[16px] border border-white/10 bg-[#050505] p-7 text-white">
              <h3 className="text-2xl font-black">Customer dashboard included</h3>
              <p className="mt-4 text-sm leading-6 text-white/55">Buyers can revisit their order history, license key, renewal date, billing record, and protected downloads anytime.</p>
              <div className="mt-8 grid gap-3 rounded-[14px] bg-[#0d0d0d] p-5">
                {['License key generated', 'Download unlocked', 'Email receipt sent'].map((item) => <div key={item} className="rounded-[10px] bg-white/5 px-4 py-3 text-sm font900 text-white/70">{item}</div>)}
              </div>
            </Reveal>
            <Reveal delay={0.08} className="rounded-[16px] bg-[#121926] p-7">
              <h3 className="text-2xl font-black">Yearly renewal tracking</h3>
              <p className="mt-4 text-sm leading-6 text-white/55">Yearly plans store renewal date, subscription status, and download access rules so expired licenses can be handled automatically.</p>
              <div className="mx-auto mt-10 grid h-40 w-40 place-items-center rounded-full border-[18px] border-[#2155FF] text-center text-xl font-black">365<br /><span className="text-xs text-white/45">days</span></div>
            </Reveal>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {['Checkout', 'License', 'Email', 'Dashboard', 'Download'].map((item) => (
              <div key={item} className="rounded-[12px] border border-white/10 bg-[#050505] p-5 text-center text-white">
                <p className="font900">{item}</p>
                <p className="mt-2 text-xs text-white/55">Connected</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl font-black leading-tight md:text-5xl">Choose yearly renewal or lifetime access.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/45">Choose the yearly builder license or the lifetime builder license. Template ZIPs remain purchased individually from the template marketplace.</p>
          <PricingCards productsBySlug={productsBySlug} buy={buy} loading={loading} />
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-4xl font-black">Frequently Asked Questions</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {faqs.map(([question, answer], index) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font900">
                  {question}
                  <ChevronDown size={18} className="text-[#2155FF] transition group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm leading-7 text-white/48">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

