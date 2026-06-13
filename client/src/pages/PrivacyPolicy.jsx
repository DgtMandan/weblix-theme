import { CalendarDays, Cookie, Database, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';

const sections = [
  {
    title: 'Information We Collect',
    text: 'Weblix may collect account details such as name, email address, avatar, login provider, billing records, order history, license records, download history, contact form messages, and information you submit inside admin forms for products, templates, blogs, and settings.'
  },
  {
    title: 'How We Use Information',
    text: 'We use information to create accounts, authenticate users, process purchases, generate license records, unlock secure ZIP downloads, send purchase or lead emails, provide customer support, improve website performance, protect the platform, and manage admin dashboard workflows.'
  },
  {
    title: 'Payments',
    text: 'Payments may be processed through providers such as Razorpay or Stripe. Weblix stores order status, payment provider IDs, amount, currency, license type, renewal dates, and related metadata. We do not store full card numbers on our servers.'
  },
  {
    title: 'Licenses & Downloads',
    text: 'When you buy a Weblix Builder product or template, we create download records and license information. This may include license key, license start date, expiration or renewal date, subscription status, and download activity so access can be controlled securely.'
  },
  {
    title: 'Emails & Contact Leads',
    text: 'If SMTP email is configured, Weblix can send branded purchase emails, license details, secure download links, renewal messages, and contact form leads. Contact form leads may be delivered to the configured lead recipient email address.'
  },
  {
    title: 'Cookies & Authentication',
    text: 'Weblix uses tokens, local storage, session storage, and cookies where needed for login sessions, protected routes, OAuth redirects, checkout flows, and dashboard access. You can clear browser storage, but some logged-in features may stop working.'
  },
  {
    title: 'Third-Party Services',
    text: 'Weblix may connect to third-party services including MongoDB Atlas, Razorpay, Stripe, Google OAuth, GitHub OAuth, email providers, hosting platforms, analytics tools, and deployment providers. Their privacy practices are governed by their own policies.'
  },
  {
    title: 'Data Security',
    text: 'We use JWT authentication, password hashing, protected admin routes, secure download checks, rate limiting, Helmet, validation, and environment-based secrets. No internet system is perfectly secure, but Weblix is designed with practical protections for digital product delivery.'
  },
  {
    title: 'Your Choices',
    text: 'You may request account updates, deletion, email changes, or access to your order and license data by contacting Weblix. Some records may be retained where needed for legal, tax, payment, fraud prevention, or support purposes.'
  },
  {
    title: 'Policy Updates',
    text: 'We may update this Privacy Policy as Weblix evolves. The updated version will be posted on this page with a new effective date.'
  }
];

export function PrivacyPolicy() {
  return (
    <section className="bg-[#0d0d0d] text-white">
      <SEO title="Privacy Policy" description="Privacy Policy for Weblix Website Builder covering accounts, payments, licenses, downloads, contact forms and platform data." />

      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[940px] w-[940px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-16%] top-[-18%] h-[720px] w-[720px] rounded-full bg-[#2155FF]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="max-w-4xl">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Privacy Policy</p>
            <h1 className="mt-5 font-display text-5xl font500 leading-[1.06] tracking-[-0.02em] md:text-7xl">
              How Weblix protects platform and customer data.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-normal leading-8 text-white/52">
              This policy explains how Weblix Website Builder handles information for accounts, purchases, templates, blogs, licenses, downloads, contact leads, and admin workflows.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-[#111111] px-4 py-3 text-sm font800 text-white/55">
              <CalendarDays size={16} className="text-[#4F7BFF]" />
              Effective date: May 31, 2026
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              [ShieldCheck, 'Protected checkout'],
              [LockKeyhole, 'JWT authentication'],
              [Database, 'License records'],
              [Cookie, 'Cookie controls']
            ].map(([Icon, title]) => (
              <Reveal key={title} className="rounded-[18px] border border-white/10 bg-[#111111] p-5">
                <Icon className="text-[#4F7BFF]" />
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.35fr_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[22px] border border-white/10 bg-[#111111] p-6">
              <h2 className="text-sm font900 uppercase tracking-[0.16em] text-[#4F7BFF]">Contents</h2>
              <div className="mt-5 grid gap-3">
                {sections.map((section) => (
                  <a key={section.title} href={`#${section.title.toLowerCase().replaceAll(' ', '-')}`} className="text-sm font800 text-white/45 transition hover:text-[#4F7BFF]">
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <div className="grid gap-4">
            {sections.map((section, index) => (
              <Reveal key={section.title} delay={(index % 3) * 0.03} id={section.title.toLowerCase().replaceAll(' ', '-')} className="scroll-mt-28 rounded-[22px] border border-white/10 bg-[#111111] p-6 md:p-8">
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                <p className="mt-4 text-base font-normal leading-8 text-white/55">{section.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <Reveal className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[24px] border border-white/10 bg-[#0A0F2C] p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Mail className="text-[#4F7BFF]" />
              <h2 className="text-3xl font-semibold">Privacy questions?</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/50">Contact Weblix if you need help with account data, orders, licenses, or download records.</p>
          </div>
          <Link to="/contact" className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[#2155FF] px-6 text-sm font900 text-white transition hover:bg-[#4F7BFF]">
            Contact Weblix
          </Link>
        </Reveal>
      </section>
    </section>
  );
}
