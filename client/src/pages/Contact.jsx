import { useState } from 'react';
import { ArrowRight, Clock3, Download, LifeBuoy, MessageSquareText, PanelsTopLeft, Send, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';
import { api } from '../services/api.js';
import { trackEvent } from '../hooks/useAnalytics.js';

const supportItems = [
  {
    icon: PanelsTopLeft,
    title: 'Builder setup',
    text: 'Get help with Weblix Builder ZIP setup, one-click imports, template pages and visual editing.'
  },
  {
    icon: Download,
    title: 'Downloads & licenses',
    text: 'Ask about yearly/lifetime licenses, secure ZIP downloads, renewal dates and customer dashboard access.'
  },
  {
    icon: LifeBuoy,
    title: 'Custom launch help',
    text: 'Discuss premium template packs, SaaS pages, SEO blog setup, checkout flow and deployment support.'
  }
];

const interests = ['Builder ZIP', 'Template ZIPs', 'Custom website', 'Payment setup', 'SEO blog system', 'Support'];
const budgets = ['$99 - $299', '$300 - $999', '$1,000+', 'Not sure yet'];

const initialForm = {
  name: '',
  email: '',
  company: '',
  phone: '',
  interest: 'Builder ZIP',
  budget: 'Not sure yet',
  message: ''
};

function DotMark() {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {[1, 2, 3, 4].map((item) => <span key={item} className="h-4 w-4 rounded-[5px] bg-[#4F7BFF]" />)}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font900 uppercase tracking-[0.14em] text-white/40">{label}</span>
      {children}
    </label>
  );
}

export function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const { data } = await api.post('/contact/leads', form);
      trackEvent('contact_submit', { interest: form.interest, budget: form.budget });
      setStatus({ type: 'success', message: data.message || 'Your message has been sent to the Weblix team.' });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Message could not be sent. Please check the form and try again.' });
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'min-h-14 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 text-sm font700 text-white outline-none transition placeholder:text-white/25 focus:border-[#4F7BFF] focus:bg-[#10131d]';

  return (
    <section className="overflow-hidden bg-[#0d0d0d] text-white">
      <SEO title="Contact" description="Contact Weblix Website Builder for support, template help, purchases and custom SaaS website builder projects." />

      <section className="relative px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[960px] w-[960px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-18%] top-[-20%] h-[720px] w-[720px] rounded-full bg-[#2155FF]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="self-center">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Contact Weblix</p>
            <h1 className="mt-5 font-display text-5xl font500 leading-[1.06] tracking-[-0.02em] md:text-7xl">
              Let&apos;s build your Weblix website workflow.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-normal leading-8 text-white/52">
              Tell us what you need: builder ZIP setup, template sales, license flow, secure downloads, SEO blog system, or a custom MERN launch.
            </p>

            <div className="mt-10 grid gap-4">
              {supportItems.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-[18px] border border-white/10 bg-[#111111] p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-[#2155FF]/15 text-[#4F7BFF]">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="mt-2 text-sm font-normal leading-6 text-white/45">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [Clock3, 'Reply fast', 'Usually same day'],
                [ShieldCheck, 'Private lead', 'Sent securely']
              ].map(([Icon, title, text]) => (
                <div key={title} className="rounded-[16px] border border-white/10 bg-[#050505] p-4">
                  <Icon className="text-[#4F7BFF]" size={20} />
                  <p className="mt-3 text-sm font900">{title}</p>
                  <p className="mt-1 text-xs text-white/38">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="rounded-[30px] border border-white/10 bg-[#171717] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.38)] md:p-9">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="mt-3 max-w-xl text-3xl font500 leading-tight md:text-5xl">
                    Share your project details.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
                    This form sends your request directly to the Weblix team.
                  </p>
                </div>
                <div className="hidden rounded-[18px] bg-[#0d0d0d] p-5 md:block">
                  <DotMark />
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Field label="Your name">
                  <input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Alex Carter" className={inputClass} />
                </Field>
                <Field label="Email address">
                  <input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" className={inputClass} />
                </Field>
                <Field label="Company">
                  <input value={form.company} onChange={(event) => update('company', event.target.value)} placeholder="Company or project name" className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+91 00000 00000" className={inputClass} />
                </Field>
                <Field label="Interested in">
                  <select value={form.interest} onChange={(event) => update('interest', event.target.value)} className={inputClass}>
                    {interests.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Budget">
                  <select value={form.budget} onChange={(event) => update('budget', event.target.value)} className={inputClass}>
                    {budgets.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Message">
                <textarea required value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Tell us about your Weblix Builder, template, checkout, blog, or deployment requirement..." rows={6} className={`${inputClass} py-4`} />
              </Field>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span />
                <button disabled={loading} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[10px] bg-[#2155FF] px-8 py-3.5 text-sm font900 text-white shadow-[0_16px_45px_rgba(33,85,255,0.28)] transition hover:bg-[#4F7BFF] disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send lead'}
                  <Send size={17} />
                </button>
              </div>

              {status.message && (
                <p className={`mt-5 rounded-[12px] border p-4 text-sm font800 ${status.type === 'success' ? 'border-[#4F7BFF]/30 bg-[#2155FF]/10 text-[#9bb5ff]' : 'border-red-400/30 bg-red-500/10 text-red-200'}`}>
                  {status.message}
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-20">
        <Reveal className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            ['Need builder pricing?', 'Compare yearly, lifetime and template pack options.', '/pricing'],
            ['Need template ZIPs?', 'Browse builder-ready page packs for fast launches.', '/templates'],
            ['Need product details?', 'See yearly and lifetime Weblix Builder packages.', '/pricing']
          ].map(([title, text, href]) => (
            <Link key={title} to={href} className="group rounded-[20px] border border-white/10 bg-[#111111] p-6 transition hover:-translate-y-1 hover:border-[#4F7BFF]/45">
              <MessageSquareText className="text-[#4F7BFF]" />
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font900 text-[#4F7BFF]">Open page <ArrowRight size={15} /></span>
            </Link>
          ))}
        </Reveal>
      </section>
    </section>
  );
}
