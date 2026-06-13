import { ChevronDown, Download, KeyRound, LifeBuoy, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';

const faqGroups = [
  {
    title: 'Buying Weblix',
    icon: Sparkles,
    items: [
      ['What is Weblix Website Builder?', 'Weblix is a full-stack website builder sales platform for selling builder ZIPs, template ZIP files, licenses, secure downloads, blogs, and customer dashboards.'],
      ['Can I buy yearly or lifetime access?', 'Yes. Weblix supports yearly licenses with renewal dates and lifetime licenses with permanent access.'],
      ['Do I need to login before buying?', 'Yes. Customers login or sign up before checkout so the order, license key, and downloads can be saved to their dashboard.']
    ]
  },
  {
    title: 'Downloads & Licenses',
    icon: Download,
    items: [
      ['How do downloads work after payment?', 'After successful payment, Weblix creates a download record and unlocks the purchased builder or template ZIP in the customer dashboard.'],
      ['Will customers receive email details?', 'Yes. When SMTP is configured, customers receive a branded Weblix email with purchase details, license information, dashboard link, and a secure download link.'],
      ['What happens when a yearly license expires?', 'Yearly downloads remain active while the license is valid. Expired yearly licenses can be renewed, and Stripe subscription renewals can keep access active automatically.']
    ]
  },
  {
    title: 'Templates & Blogs',
    icon: KeyRound,
    items: [
      ['Can admins add new templates?', 'Yes. The admin dashboard lets you add template name, price, tags, thumbnail, preview images, and ZIP file. Published templates appear on the Templates page automatically.'],
      ['Can admins publish SEO blogs?', 'Yes. The blog dashboard supports SEO title, slug, meta description, focus keywords, featured image, FAQ schema, status, and scheduled publishing fields.'],
      ['Can Weblix generate trending blog ideas?', 'The system includes a Google Trends and AI blog workflow for generating SEO-focused article drafts related to website builders, AI, SaaS, SEO, and web development.']
    ]
  },
  {
    title: 'Support',
    icon: LifeBuoy,
    items: [
      ['How do I contact Weblix?', 'Use the Contact page form. Leads are sent to the configured lead email address.'],
      ['Can Weblix be deployed?', 'Yes. The project is structured for Vercel frontend, Render or Railway backend, and MongoDB Atlas.'],
      ['Can I customize the design?', 'Yes. Pages use reusable React components and Tailwind CSS, so colors, sections, cards, and dashboards can be customized.']
    ]
  }
];

export function FAQ() {
  return (
    <section className="bg-[#0d0d0d] text-white">
      <SEO title="FAQ" description="Frequently asked questions about Weblix Website Builder, licenses, templates, downloads, payments and admin dashboard workflows." />

      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[940px] w-[940px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-16%] top-[-18%] h-[720px] w-[720px] rounded-full bg-[#2155FF]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="max-w-4xl">
            <p className="text-sm font900 uppercase tracking-[0.2em] text-[#4F7BFF]">FAQ</p>
            <h1 className="mt-5 font-display text-5xl font500 leading-[1.06] tracking-[-0.02em] md:text-7xl">
              Questions about Weblix Builder, licenses, and downloads.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-normal leading-8 text-white/52">
              Find answers about buying the builder ZIP, selling templates, publishing blogs, managing licenses, and delivering secure downloads.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [ShieldCheck, 'Secure checkout', 'Orders and downloads unlock only after payment.'],
              [Download, 'ZIP delivery', 'Builder and templates are delivered from protected records.'],
              [KeyRound, 'License records', 'Yearly and lifetime plans stay visible in dashboard.']
            ].map(([Icon, title, text]) => (
              <Reveal key={title} className="rounded-[18px] border border-white/10 bg-[#111111] p-6">
                <Icon className="text-[#4F7BFF]" />
                <h2 className="mt-5 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          {faqGroups.map(({ title, icon: Icon, items }, groupIndex) => (
            <Reveal key={title} delay={groupIndex * 0.04} className="rounded-[24px] border border-white/10 bg-[#111111] p-6 md:p-8">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-[12px] bg-[#2155FF]/15 text-[#4F7BFF]">
                  <Icon size={22} />
                </span>
                <h2 className="text-2xl font-semibold">{title}</h2>
              </div>
              <div className="mt-6 divide-y divide-white/10">
                {items.map(([question, answer]) => (
                  <details key={question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font900 text-white">
                      {question}
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-[#0d0d0d] text-[#4F7BFF] transition group-open:rotate-180 group-open:bg-[#2155FF] group-open:text-white">
                        <ChevronDown size={18} />
                      </span>
                    </summary>
                    <p className="mt-4 max-w-2xl text-sm font-normal leading-7 text-white/50">{answer}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20">
        <Reveal className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[24px] border border-white/10 bg-[#0A0F2C] p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Still need help?</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">Send a project lead or support question to the Weblix team.</p>
          </div>
          <Link to="/contact" className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[#2155FF] px-6 text-sm font900 text-white transition hover:bg-[#4F7BFF]">
            Contact Weblix
          </Link>
        </Reveal>
      </section>
    </section>
  );
}
