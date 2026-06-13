import { ArrowRight, Briefcase, ChartColumn, Download, Layers, LockKeyhole, ShoppingBag, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';
import weblixAboutBanner from '../assets/weblix-about-banner.png';

const stats = [
  ['2026', 'Founded'],
  ['100%', 'Digital delivery'],
  ['35+', 'Builder sections'],
  ['24/7', 'Dashboard access']
];

const featureCards = [
  ['One-click imports', 'Import clean website ZIP files and turn HTML pages into editable Weblix template pages.', Download, '1-click', 'Import flow'],
  ['Secure checkout', 'Protected purchases, license records, branded emails, and verified digital downloads.', ShoppingBag, '100%', 'Protected'],
  ['Builder product sales', 'Sell the Weblix Builder ZIP with yearly or lifetime licensing from one dashboard.', Briefcase, '2', 'License plans'],
  ['Customer accounts', 'Every buyer gets login access, order history, license details, and downloads.', Users, 'Auto', 'Customer portal']
];

const jobs = [
  ['Builder ZIP sales', 'Sell Weblix Builder yearly or lifetime with secure license records.'],
  ['Template marketplace', 'Upload thumbnails, preview images, and ZIP files from the admin dashboard.'],
  ['SEO blog engine', 'Publish optimized articles and trend-driven blog drafts from one CMS.']
];

const posts = [
  ['Step 01', 'Choose your Weblix product', 'Buy the builder package or select a premium template ZIP from the marketplace.'],
  ['Step 02', 'Payment unlocks license', 'The system creates the order, license key, renewal details, and secure download record.'],
  ['Step 03', 'Download and build', 'Use the dashboard or email link to download the ZIP, then import and edit inside Weblix Builder.']
];

function DotMark() {
  return (
    <div className="grid grid-cols-2 gap-1">
      {[1, 2, 3, 4].map((item) => <span key={item} className="h-2.5 w-2.5 rounded-[3px] bg-[#2155FF]" />)}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl font-black text-white md:text-4xl">{value}</div>
      <p className="mt-1 text-xs font700 text-white/42">{label}</p>
    </div>
  );
}

export function About() {
  return (
    <section className="bg-[#0d0d0d] text-white">
      <SEO title="About" />

      <section className="relative overflow-hidden px-4 pb-16 pt-16">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[960px] w-[960px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-18%] top-[-20%] h-[720px] w-[720px] rounded-full bg-[#2155FF]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-end gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="pb-20">
              <h1 className="font-display text-6xl font-black leading-[1.08] tracking-[-0.04em] md:text-8xl">
                Build, sell, and deliver websites with Weblix
              </h1>
              <p className="mt-8 max-w-lg text-lg font700 leading-7 text-white/55">
                Weblix Website Builder is a complete MERN platform for selling builder ZIPs, premium templates, SEO blogs, licenses, payments, and protected downloads.
              </p>
            </div>
            <div className="relative min-h-[460px]">
              <div className="absolute bottom-4 right-0 h-[430px] w-[430px] rounded-full bg-gradient-to-br from-[#2155FF]/35 to-[#4F7BFF]/5 blur-2xl" />
              <motion.div
                initial={{ opacity: 0, y: 34, scale: 0.96 }}
                animate={{ opacity: 1, y: [0, -10, 0], scale: 1 }}
                whileHover={{ y: -14, scale: 1.025 }}
                transition={{
                  opacity: { duration: 0.7, ease: 'easeOut' },
                  scale: { duration: 0.7, ease: 'easeOut' },
                  y: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="absolute inset-x-0 bottom-0 mx-auto max-w-[390px] rounded-[28px] border border-white/10 bg-[#171717] p-3 shadow-[0_40px_140px_rgba(0,0,0,0.55)] lg:right-10 lg:mx-0"
              >
                <img
                  src={weblixAboutBanner}
                  alt="Weblix Website Builder banner showing drag and drop website building"
                  className="aspect-[1/1] w-full rounded-[22px] object-cover object-center"
                  loading="eager"
                />
              </motion.div>
            </div>
          </div>
          <Reveal className="relative z-10 -mt-10 grid gap-8 rounded-[14px] bg-[#1b1b1b] px-8 py-9 shadow-[0_24px_90px_rgba(0,0,0,0.45)] md:grid-cols-4">
            {stats.map(([value, label]) => <StatCard key={label} value={value} label={label} />)}
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-[34px_1fr]">
            <div className="hidden md:block">
              <DotMark />
              <div className="ml-[9px] mt-4 h-[760px] w-px bg-gradient-to-b from-[#2155FF] to-transparent" />
            </div>
            <div>
              <Reveal>
              <h2 className="font-display text-4xl font-black leading-tight tracking-[-0.03em] md:text-6xl">
                <span className="text-[#4F7BFF]">Why Weblix exists</span> We make website delivery faster, safer, and easier to manage.
              </h2>
              </Reveal>
              <Reveal className="mt-12 rounded-[14px] bg-[#1b1b1b] p-7">
                <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
                  <div>
                    <h3 className="text-xl font-black">Our mission</h3>
                    <p className="mt-2 max-w-xl text-sm font700 leading-6 text-white/45">
                      Weblix helps creators, agencies, and SaaS teams turn website designs into sellable digital products with checkout, licensing, template imports, and repeatable delivery.
                    </p>
                    <div className="mt-8 rounded-[14px] bg-[#121212] p-5">
                      <p className="text-sm font800 text-white/55">Weblix platform capabilities</p>
                      <div className="mt-5 grid gap-4 md:grid-cols-4">
                        {featureCards.map(([title, text, Icon, value, label]) => (
                          <div key={title} className="rounded-[12px] bg-[#0d0d0d] p-5">
                            <Icon className="text-[#4F7BFF]" />
                            <div className="mt-6 text-2xl font-black">{value}</div>
                            <p className="mt-1 text-xs text-white/55">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[14px] bg-[#121212] p-5">
                    <p className="text-sm font800 text-white/55">Launch flow</p>
                    <div className="mt-8 flex h-48 items-end gap-3">
                      {[70, 112, 52, 98, 44, 82].map((height, index) => (
                        <span key={index} style={{ height }} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#2155FF] to-[#4F7BFF]" />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {featureCards.slice(0, 2).map(([title, text, Icon, value, label]) => (
                  <Reveal key={title} className="rounded-[14px] bg-[#1b1b1b] p-7">
                    <h3 className="text-xl font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
                    <div className="mt-9 grid grid-cols-2 gap-5">
                      <div className="rounded-[12px] bg-[#0d0d0d] p-6">
                        <Icon className="text-[#4F7BFF]" />
                        <div className="mt-6 text-3xl font-black">{value}</div>
                        <p className="mt-1 text-sm text-white/55">{label}</p>
                        <p className="mt-2 text-xs font800 text-[#4F7BFF]">Ready after payment</p>
                      </div>
                      <div className="rounded-[12px] bg-[#0d0d0d] p-6">
                        <LockKeyhole className="text-[#4F7BFF]" />
                        <div className="mt-6 text-3xl font-black">ZIP</div>
                        <p className="mt-1 text-sm text-white/55">Secure file</p>
                        <p className="mt-2 text-xs font800 text-[#4F7BFF]">Email + dashboard</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex items-center gap-5">
            <DotMark />
            <div>
              <h2 className="font-display text-4xl font-black text-white/75 md:text-5xl"><span className="text-[#4F7BFF]">What</span> Weblix handles.</h2>
              <p className="mt-3 max-w-xl text-lg font700 text-white/35">One platform connects product sales, template uploads, blog publishing, license records, and customer downloads.</p>
            </div>
          </Reveal>
          <div className="mt-7 flex gap-3">
            <Link to="/pricing" className="rounded-[10px] bg-[#2155FF] px-4 py-2 text-xs font-black transition hover:bg-[#4F7BFF]">View pricing</Link>
            <Link to="/templates" className="rounded-[10px] border border-white/12 px-4 py-2 text-xs font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">Browse templates</Link>
          </div>
          <div className="mt-10 grid gap-5">
            {jobs.map(([title, meta]) => (
              <Reveal key={title} className="rounded-[14px] bg-[#1b1b1b] p-7 transition hover:bg-[#202020]">
                <h3 className="font-black">{title}</h3>
                <p className="mt-1 text-xs font700 text-white/38">{meta}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="text-center">
              <h2 className="font-display text-4xl font-black text-white/55 md:text-5xl"><span className="text-[#4F7BFF]">How</span> customers use Weblix.</h2>
            <Link to="/pricing" className="mt-6 inline-flex items-center gap-2 text-sm font800 text-white/35 transition hover:text-[#4F7BFF]">View builder plans <ArrowRight size={16} /></Link>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {posts.map(([date, title, text], index) => (
              <Reveal key={title} className="group">
              <Link to="/blog">
                <div className="h-44 overflow-hidden rounded-[10px] bg-[#1b1b1b]">
                  <div className={`h-full opacity-80 transition group-hover:scale-105 ${index === 0 ? 'bg-[linear-gradient(135deg,#5f5238,#d7c7a1)]' : index === 1 ? 'bg-[radial-gradient(circle,#4F7BFF,#1b1b1b_62%)]' : 'bg-[radial-gradient(circle_at_30%_30%,#2155FF_0_4px,transparent_5px),radial-gradient(circle_at_70%_60%,#4F7BFF_0_4px,transparent_5px)] bg-[length:32px_32px]'}`} />
                </div>
                <p className="mt-6 text-xs font800 text-[#4F7BFF]">{date}</p>
                <h3 className="mt-3 text-xl font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/40">{text}</p>
              </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </section>
  );
}
