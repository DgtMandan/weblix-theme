import { useState } from 'react';
import { BarChart3, BriefcaseBusiness, CheckCircle2, Code2, FileText, Gauge, Images, Layers3, Megaphone, MessageSquare, MonitorSmartphone, PenLine, Rocket, Search, Send, Share2, ShieldCheck, ShoppingCart, Sparkles, Target, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';
import { api } from '../services/api.js';
import { trackEvent } from '../hooks/useAnalytics.js';
import { SEO } from '../utils/seo.jsx';

const services = [
  { id: 'Custom website design', icon: MonitorSmartphone, title: 'Custom Website', text: 'Modern responsive website design, Weblix Builder setup, landing pages and launch support.' },
  { id: 'SEO growth package', icon: Search, title: 'SEO Growth', text: 'Technical SEO, local SEO pages, blog strategy, schema and Google ranking improvements.' },
  { id: 'Marketing ads', icon: Megaphone, title: 'Marketing Ads', text: 'Google Ads, landing pages, tracking setup, retargeting and conversion-focused campaigns.' },
  { id: 'Social media marketing', icon: Share2, title: 'Social Media', text: 'Content direction, post ideas, profile optimization and campaign planning for your brand.' }
];

const whyChooseUs = [
  { icon: WandSparkles, title: 'Professional Design', text: 'A polished website built around your brand, content, audience, and conversion goals.' },
  { icon: MonitorSmartphone, title: 'Mobile-Friendly Layout', text: 'Responsive pages that feel smooth on phones, tablets, laptops, and large screens.' },
  { icon: Gauge, title: 'Fast Performance', text: 'Clean structure, optimized sections, and careful asset handling for a faster user experience.' },
  { icon: Search, title: 'SEO Optimized', text: 'SEO titles, page structure, schema, metadata, and content direction prepared from launch.' }
];

const customServices = [
  { icon: BriefcaseBusiness, title: 'Business Websites', text: 'Company websites, service pages, contact flows, trust sections, and lead capture.' },
  { icon: ShoppingCart, title: 'E-commerce Websites', text: 'Product pages, checkout-ready layouts, payment flow planning, and catalog structure.' },
  { icon: FileText, title: 'Landing Pages', text: 'Campaign pages for ads, launches, offers, webinars, and high-converting lead funnels.' },
  { icon: Images, title: 'Portfolio Websites', text: 'Elegant portfolio pages for creators, agencies, consultants, and service businesses.' },
  { icon: Code2, title: 'Custom Web Applications', text: 'Dashboards, forms, data views, automation tools, and MERN features based on your needs.' },
  { icon: Layers3, title: 'Weblix Builder Setup', text: 'We prepare your site so your team can edit sections, pages, templates, and content after launch.' }
];

const processSteps = [
  ['Consultation', 'We understand your business, target customers, services, budget, and launch goals.'],
  ['Planning', 'We map pages, content, SEO keywords, marketing channels, and the right Weblix structure.'],
  ['Design', 'We create a modern visual direction with responsive layouts and conversion-focused sections.'],
  ['Development', 'We build the website, connect forms, optimize speed, prepare SEO, and test every important flow.'],
  ['Launch & Support', 'We launch the site, help with updates, and support marketing through ads, SEO, and social media.']
];

const portfolioItems = [
  'Business website redesign',
  'SEO landing page system',
  'Template marketplace setup',
  'Service brand launch'
];

const faqs = [
  ['Can Weblix build the full website for me?', 'Yes. Our team can plan, design, build, launch, and support your website based on your exact request.'],
  ['Do you also help with SEO and marketing?', 'Yes. We can include technical SEO, content direction, Google Ads planning, social media strategy, and lead generation setup.'],
  ['Can I edit the website after launch?', 'Yes. We can prepare the website with Weblix Builder so your team can update sections and content without starting from scratch.'],
  ['How much does a custom website cost?', 'Pricing depends on pages, features, content, SEO, ads, and marketing needs. Send a request and we will suggest the right custom package.']
];

const budgets = ['$300 - $999', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000+', 'Not sure yet'];
const timelines = ['ASAP', '1-2 weeks', '2-4 weeks', '1-2 months', 'Planning only'];

const initialForm = {
  name: '',
  email: '',
  company: '',
  phone: '',
  website: '',
  services: ['Custom website design'],
  budget: 'Not sure yet',
  timeline: 'Planning only',
  message: ''
};

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font900 uppercase tracking-[0.14em] text-white/40">{label}</span>
      {children}
    </label>
  );
}

export function RequestCustomWebsite() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const inputClass = 'min-h-14 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 text-sm font700 text-white outline-none transition placeholder:text-white/25 focus:border-[#4F7BFF] focus:bg-[#10131d]';

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleService(service) {
    setForm((current) => {
      const exists = current.services.includes(service);
      const next = exists ? current.services.filter((item) => item !== service) : [...current.services, service];
      return { ...current, services: next.length ? next : [service] };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const payload = {
        name: form.name,
        email: form.email,
        company: form.company,
        phone: form.phone,
        interest: `Request Custom Website: ${form.services.join(', ')}`,
        budget: form.budget,
        message: [
          `Website: ${form.website || 'Not provided'}`,
          `Timeline: ${form.timeline}`,
          `Services: ${form.services.join(', ')}`,
          '',
          form.message
        ].join('\n')
      };
      const { data } = await api.post('/contact/leads', payload);
      trackEvent('custom_website_request', { services: form.services, budget: form.budget, timeline: form.timeline });
      setStatus({ type: 'success', message: data.message || 'Your custom website request has been sent.' });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Request could not be sent. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden bg-[#0d0d0d] text-white">
      <SEO
        title="Custom Website Development"
        description="Request a custom Weblix website with design, builder setup, SEO, marketing ads, social media, launch support, and a free consultation."
      />

      <section className="relative px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[980px] w-[980px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-15%] top-[-12%] h-[680px] w-[680px] rounded-full bg-[#2155FF]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal className="self-center">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Custom website development</p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font500 leading-[1.05] tracking-[-0.02em] md:text-7xl">
              Need a custom website?
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-normal leading-8 text-white/55">
              Build a website tailored to your business needs. Our team creates fast, responsive, and professional websites with Weblix Builder setup, launch support, SEO, ads, and social media marketing.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                [WandSparkles, 'Built to your request', 'Pages, sections, content and features shaped around your business.'],
                [Target, 'Launch to marketing', 'SEO, ads, analytics and social direction planned with the site.'],
                [BarChart3, 'Growth focused', 'Lead capture, tracking and conversion thinking from day one.'],
                [PenLine, 'Free consultation', 'Share your idea and we will suggest the right website package.']
              ].map(([Icon, title, text]) => (
                <div key={title} className="rounded-[18px] border border-white/10 bg-[#111111] p-5">
                  <Icon className="text-[#4F7BFF]" size={24} />
                  <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <form id="request-quote" onSubmit={submit} className="rounded-[30px] border border-white/10 bg-[#171717] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.38)] md:p-9">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Project request</p>
                  <h2 className="mt-3 max-w-xl text-3xl font500 leading-tight md:text-5xl">Request a quote.</h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
                    Tell us what you need. We will review your project and send a custom website, SEO, ads, and marketing plan.
                  </p>
                </div>
                <span className="hidden h-14 w-14 place-items-center rounded-[16px] bg-[#2155FF]/15 text-[#4F7BFF] md:grid">
                  <Sparkles size={25} />
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Field label="Name">
                  <input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Alex Carter" className={inputClass} />
                </Field>
                <Field label="Email">
                  <input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" className={inputClass} />
                </Field>
                <Field label="Company">
                  <input value={form.company} onChange={(event) => update('company', event.target.value)} placeholder="Your business name" className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+91 00000 00000" className={inputClass} />
                </Field>
                <Field label="Current website">
                  <input value={form.website} onChange={(event) => update('website', event.target.value)} placeholder="https://example.com" className={inputClass} />
                </Field>
                <Field label="Timeline">
                  <select value={form.timeline} onChange={(event) => update('timeline', event.target.value)} className={inputClass}>
                    {timelines.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <p className="text-xs font900 uppercase tracking-[0.14em] text-white/40">Services needed</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {services.map(({ id, icon: Icon, title, text }) => {
                    const active = form.services.includes(id);
                    return (
                      <button key={id} type="button" onClick={() => toggleService(id)} className={`min-h-[132px] rounded-[16px] border p-4 text-left transition ${active ? 'border-[#4F7BFF] bg-[#2155FF]/12' : 'border-white/10 bg-[#0d0d0d] hover:border-[#4F7BFF]/45'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <Icon className={active ? 'text-[#4F7BFF]' : 'text-white/45'} size={22} />
                          {active && <CheckCircle2 className="text-[#4F7BFF]" size={18} />}
                        </div>
                        <h3 className="mt-4 text-base font-semibold">{title}</h3>
                        <p className="mt-2 text-xs leading-5 text-white/45">{text}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Budget">
                  <select value={form.budget} onChange={(event) => update('budget', event.target.value)} className={inputClass}>
                    {budgets.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Project details">
                  <textarea required value={form.message} onChange={(event) => update('message', event.target.value)} rows={6} placeholder="Tell us about your business, required pages, builder needs, launch goals, SEO, ads, social media, competitors, and any design references..." className={`${inputClass} py-4`} />
                </Field>
              </div>

              {status.message && (
                <p className={`mt-5 rounded-[12px] border p-4 text-sm font800 ${status.type === 'success' ? 'border-[#4F7BFF]/30 bg-[#2155FF]/10 text-[#9bb5ff]' : 'border-red-400/30 bg-red-500/10 text-red-200'}`}>
                  {status.message}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link to="/pricing" className="text-sm font900 text-white/45 transition hover:text-[#4F7BFF]">See Weblix builder pricing</Link>
                <Button disabled={loading} type="submit">
                  {loading ? 'Sending request...' : 'Get Free Consultation'} <Send size={17} />
                </Button>
              </div>
            </form>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-20 max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Why choose us</p>
            <h2 className="mt-4 font-display text-4xl font500 leading-tight md:text-6xl">Websites made for real business growth.</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {whyChooseUs.map(({ icon: Icon, title, text }) => (
              <Reveal key={title} className="rounded-[22px] border border-white/10 bg-[#111111] p-6">
                <Icon className="text-[#4F7BFF]" size={28} />
                <h3 className="mt-5 text-xl font600">{title}</h3>
                <p className="mt-3 text-sm font-normal leading-6 text-white/45">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Our services</p>
            <h2 className="mt-4 font-display text-4xl font500 leading-tight md:text-6xl">From first page to full launch.</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customServices.map(({ icon: Icon, title, text }) => (
              <Reveal key={title} className="min-h-[210px] rounded-[22px] border border-white/10 bg-[#151515] p-6">
                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#2155FF]/14 text-[#4F7BFF]">
                  <Icon size={23} />
                </div>
                <h3 className="mt-5 text-[25px] font600 leading-tight">{title}</h3>
                <p className="mt-3 text-base font-normal leading-7 text-white/45">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-7xl rounded-[30px] border border-white/10 bg-[#151515] p-6 md:p-10">
          <Reveal className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Our process</p>
              <h2 className="mt-4 font-display text-4xl font500 leading-tight md:text-6xl">Clear steps from consultation to launch.</h2>
              <p className="mt-5 text-base leading-7 text-white/50">
                We help you define the project, build the website according to your requirements, prepare it inside Weblix Builder where useful, and support marketing after launch.
              </p>
            </div>
            <div className="grid gap-3">
              {processSteps.map(([title, text], index) => (
                <div key={title} className="grid gap-4 rounded-[18px] border border-white/10 bg-[#0d0d0d] p-5 sm:grid-cols-[52px_1fr]">
                  <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#2155FF] text-sm font900 text-white">{index + 1}</span>
                  <div>
                    <h3 className="text-lg font700">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/45">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-20 grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Reveal className="rounded-[30px] border border-white/10 bg-[#111111] p-6 md:p-10">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Portfolio</p>
            <h2 className="mt-4 font-display text-4xl font500 leading-tight md:text-6xl">Recent project types.</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {portfolioItems.map((item) => (
                <div key={item} className="rounded-[16px] border border-white/10 bg-[#0d0d0d] p-5">
                  <Rocket className="text-[#4F7BFF]" size={22} />
                  <p className="mt-4 text-lg font700">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="rounded-[30px] border border-[#4F7BFF]/25 bg-[#2155FF]/10 p-6 md:p-10">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#9bb5ff]">Pricing</p>
            <h2 className="mt-4 font-display text-4xl font500 leading-tight">Custom packages.</h2>
            <p className="mt-5 text-base leading-7 text-white/55">
              Every business needs a different mix of design, development, builder setup, SEO, ads, and social media. Send your details and our team will prepare the right quote.
            </p>
            <a href="#request-quote" className="mt-8 inline-flex items-center gap-2 rounded-[10px] bg-[#2155FF] px-6 py-4 text-sm font500 text-white transition hover:bg-[#4F7BFF]">
              Request a Quote <Send size={17} />
            </a>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-20 max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">FAQ</p>
            <h2 className="mt-4 font-display text-4xl font500 leading-tight md:text-6xl">Common questions.</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map(([question, answer]) => (
              <Reveal key={question} className="rounded-[22px] border border-white/10 bg-[#111111] p-6">
                <MessageSquare className="text-[#4F7BFF]" size={24} />
                <h3 className="mt-4 text-xl font700">{question}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{answer}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="relative mx-auto mt-20 max-w-7xl rounded-[30px] border border-white/10 bg-[#171717] p-7 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Contact our team</p>
              <h2 className="mt-4 font-display text-4xl font500 leading-tight md:text-6xl">Looking for a custom website?</h2>
              <p className="mt-5 max-w-4xl text-base leading-8 text-white/55">
                Our expert team creates fast, responsive, and professional websites designed specifically for your business. We can also handle SEO, marketing ads, social media planning, and launch support so your website is ready to grow from day one.
              </p>
            </div>
            <a href="#request-quote" className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2155FF] px-7 py-4 text-sm font500 text-white transition hover:bg-[#4F7BFF]">
              Get Free Consultation <ShieldCheck size={18} />
            </a>
          </div>
        </Reveal>
      </section>
    </section>
  );
}
