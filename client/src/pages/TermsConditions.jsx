import { AlertCircle, CalendarDays, Download, FileArchive, KeyRound, Scale, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';

const sections = [
  {
    title: 'Acceptance of Terms',
    text: 'By accessing Weblix Website Builder, creating an account, buying a builder ZIP, purchasing a template, downloading files, or using the admin dashboard, you agree to these Terms & Conditions.'
  },
  {
    title: 'Weblix Products',
    text: 'Weblix sells digital products such as website builder ZIP packages, template ZIP files, SaaS page layouts, blog systems, admin dashboard workflows, and related website resources. All products are delivered digitally.'
  },
  {
    title: 'Accounts',
    text: 'You may need an account to buy products, access downloads, view licenses, manage billing history, or use dashboard features. You are responsible for keeping your login details secure and for activity under your account.'
  },
  {
    title: 'Payments',
    text: 'Prices are shown in USD unless otherwise stated. Payments may be processed through providers such as Razorpay or Stripe. Orders are considered complete only after successful payment verification.'
  },
  {
    title: 'Licenses',
    text: 'Weblix may offer one-time, yearly, and lifetime licenses. Yearly licenses provide access until the renewal or expiry date. Lifetime licenses provide ongoing access to the purchased product unless the account violates these terms.'
  },
  {
    title: 'Downloads',
    text: 'After payment, eligible ZIP downloads become available in the customer dashboard and may also be sent through a secure email link. Download links must not be shared publicly or used to redistribute paid products.'
  },
  {
    title: 'Template Usage',
    text: 'Purchased templates may be used for your own websites or client projects according to the license shown at purchase. You may not resell, repackage, redistribute, or upload Weblix template files as competing products unless you have written permission.'
  },
  {
    title: 'Refunds',
    text: 'Because Weblix products are digital files that can be downloaded immediately, refunds may be limited. Refund requests can be reviewed case by case based on payment status, download activity, duplicate orders, or technical issues.'
  },
  {
    title: 'Admin Content',
    text: 'Admins are responsible for the products, templates, images, ZIP files, blog posts, SEO metadata, and other content uploaded through the dashboard. Uploaded content must not violate intellectual property rights or applicable laws.'
  },
  {
    title: 'Prohibited Use',
    text: 'You may not use Weblix to distribute malware, steal data, bypass license restrictions, abuse downloads, spam contact forms, attack the platform, scrape protected files, or perform unlawful activity.'
  },
  {
    title: 'Third-Party Services',
    text: 'Weblix may integrate with third-party services including MongoDB, Stripe, Razorpay, Google OAuth, GitHub OAuth, email providers, hosting platforms, and analytics tools. Their own terms may also apply.'
  },
  {
    title: 'Changes to Terms',
    text: 'We may update these Terms & Conditions as Weblix evolves. Continued use of the platform after updates means you accept the revised terms.'
  }
];

export function TermsConditions() {
  return (
    <section className="bg-[#0d0d0d] text-white">
      <SEO title="Terms & Conditions" description="Terms and Conditions for Weblix Website Builder products, licenses, downloads, payments, templates and admin dashboard usage." />

      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[940px] w-[940px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-16%] top-[-18%] h-[720px] w-[720px] rounded-full bg-[#2155FF]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="max-w-4xl">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">Terms & Conditions</p>
            <h1 className="mt-5 font-display text-5xl font500 leading-[1.06] tracking-[-0.02em] md:text-7xl">
              Clear rules for buying and using Weblix.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-normal leading-8 text-white/52">
              These terms explain how Weblix Website Builder products, templates, licenses, payments, downloads, admin content, and support workflows may be used.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-[#111111] px-4 py-3 text-sm font800 text-white/55">
              <CalendarDays size={16} className="text-[#4F7BFF]" />
              Effective date: May 31, 2026
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              [FileArchive, 'Digital products'],
              [KeyRound, 'License access'],
              [Download, 'Secure downloads'],
              [ShieldCheck, 'Protected usage']
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
        <Reveal className="mx-auto grid max-w-7xl gap-5 rounded-[24px] border border-white/10 bg-[#0A0F2C] p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Scale className="text-[#4F7BFF]" />
              <h2 className="text-3xl font-semibold">Need clarification?</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              Contact Weblix if you have questions about licenses, refunds, downloads, template usage, or client project rights.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/privacy-policy" className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-white/10 px-6 text-sm font900 text-white/70 transition hover:border-[#4F7BFF] hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#2155FF] px-6 text-sm font900 text-white transition hover:bg-[#4F7BFF]">
              <AlertCircle size={16} />
              Contact Weblix
            </Link>
          </div>
        </Reveal>
      </section>
    </section>
  );
}
