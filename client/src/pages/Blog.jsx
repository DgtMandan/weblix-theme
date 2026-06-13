import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText, CalendarDays, Clock, Search, Sparkles, Star } from 'lucide-react';
import { api, assetUrl } from '../services/api.js';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';

function dateLabel(value) {
  if (!value) return 'Weblix editorial';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function BlogVisual({ index, large = false, image, title }) {
  if (image) return <img loading="lazy" src={assetUrl(image)} alt={title || 'Blog image'} className={`${large ? 'h-[520px]' : 'h-56'} w-full rounded-[18px] object-cover transition duration-500 group-hover:scale-105`} />;
  return (
    <div className={`${large ? 'h-[520px]' : 'h-56'} relative overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_70%_18%,#4F7BFF_0_18%,transparent_22%),linear-gradient(135deg,#06134A,#0A0F2C_55%,#050505)]`}>
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute inset-6 rounded-[20px] border border-white/12 bg-black/20 p-5 transition duration-500 group-hover:-translate-y-2">
        <div className="flex items-center justify-between">
          <span className="h-2 w-24 rounded-full bg-white/25" />
          <span className="rounded-md bg-[#2155FF] px-2 py-1 text-[10px] font900">WEBLIX</span>
        </div>
        <div className="mt-8 grid h-28 place-items-center rounded-[18px] bg-white/8">
          <BookOpenText size={large ? 72 : 52} className="text-[#4F7BFF]" />
        </div>
        <div className="mt-6 grid gap-2">
          <span className="h-2 rounded-full bg-white/20" />
          <span className="h-2 w-2/3 rounded-full bg-white/12" />
        </div>
      </div>
    </div>
  );
}

function BlogCard({ post, index }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block overflow-hidden rounded-[22px] border border-white/10 bg-[#111111] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#4F7BFF]/45 hover:bg-[#151515]">
      <BlogVisual index={index + 1} image={post.featuredImage} title={post.title} />
      <div className="p-2 pt-5">
        <div className="flex flex-wrap items-center gap-3 text-xs font800 text-white/40">
          <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-[#4F7BFF]" /> {dateLabel(post.publishedAt || post.createdAt)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-[#4F7BFF]" /> {post.readTime || 4} min read</span>
        </div>
        <h3 className="mt-4 text-2xl font-semibold leading-tight text-white transition group-hover:text-[#4F7BFF]">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm font-normal leading-6 text-white/48">{post.excerpt}</p>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-2">
            {(post.tags || []).slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-[#2155FF]/12 px-3 py-1 text-xs font800 text-[#4F7BFF]">{tag}</span>)}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font900 text-[#4F7BFF]">Read <ArrowRight size={14} /></span>
        </div>
      </div>
    </Link>
  );
}

export function Blog() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    api.get('/blogs').then(({ data }) => setPosts(data)).catch(() => setPosts([]));
  }, []);

  const visible = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = !search || `${post.title} ${post.excerpt} ${post.tags?.join(' ')}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || post.categoryName === category || post.tags?.includes(category);
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, category]);
  const featured = visible[0];
  const gridPosts = visible.slice(1, 7);
  const categories = useMemo(() => ['All', ...new Set(posts.flatMap((post) => [post.categoryName, ...(post.tags || [])]).filter(Boolean))].slice(0, 8), [posts]);
  const popular = useMemo(() => [...visible].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4), [visible]);
  const trending = useMemo(() => visible.filter((post) => post.source === 'trend-draft' || post.tags?.some((tag) => String(tag).toLowerCase().includes('trend'))).slice(0, 6), [visible]);

  return (
    <section className="bg-[#0d0d0d] text-white">
      <SEO title="Blog" />

      <section className="relative overflow-hidden px-4 pb-16 pt-16">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[960px] w-[960px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-18%] top-[-20%] h-[720px] w-[720px] rounded-full bg-[#2155FF]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[520px] items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <Reveal>
              <h1 className="font-display text-6xl font-black leading-[1.08] tracking-[-0.04em] md:text-8xl">
                Weblix builder insights and launch guides
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-xl text-2xl font800 leading-9 text-white/55">
                Learn how to build, sell, license, import and deliver websites with Weblix Builder, template ZIPs, SEO blogs and secure downloads.
              </p>
              <div className="mt-8 flex gap-3">
                <Link to="/pricing" className="rounded-[10px] bg-[#2155FF] px-5 py-3 text-sm font-black transition hover:bg-[#4F7BFF]">View Pricing</Link>
                <Link to="/contact" className="rounded-[10px] border border-white/15 px-5 py-3 text-sm font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">Talk to sales</Link>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ['Builder workflows', 'Guides for one-click imports, visual editing and builder-ready exports.'],
              ['Template sales', 'Articles about selling template ZIPs with checkout and protected downloads.'],
              ['SEO growth', 'Content systems for website builder, SaaS and AI product keywords.']
            ].map(([title, text]) => (
              <div key={title} className="rounded-[16px] border border-white/10 bg-[#111111] p-5">
                <Sparkles className="text-[#4F7BFF]" size={18} />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
              </div>
            ))}
          </Reveal>
          <Reveal className="mt-12">
            <div className="grid gap-4 rounded-[20px] border border-white/10 bg-[#171717] p-4 md:grid-cols-[1fr_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4">
                <Search className="text-[#4F7BFF]" size={18} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm font800 outline-none" placeholder="Search Weblix, SEO, AI, templates..." />
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-[10px] px-4 py-2 text-xs font900 ${category === item ? 'bg-[#2155FF]' : 'bg-[#0d0d0d] text-white/55 hover:text-[#4F7BFF]'}`}>{item}</button>)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {featured && (
        <section className="px-4 pb-20">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[34px_1fr]">
            <div className="hidden md:block">
              <Star size={22} className="text-[#4F7BFF]" />
              <div className="ml-[10px] mt-4 h-[620px] w-px bg-gradient-to-b from-[#2155FF] to-transparent" />
            </div>
            <Reveal>
              <Link to={`/blog/${featured.slug}`} className="group block">
                <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5 md:p-7">
                  <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Featured Weblix guide</p>
                  <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">{featured.title}</h2>
                  <p className="mt-4 max-w-5xl text-lg font-normal leading-8 text-white/50">{featured.excerpt}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font800 text-white/40">
                    <span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-[#4F7BFF]" /> {dateLabel(featured.publishedAt || featured.createdAt)}</span>
                    <span className="inline-flex items-center gap-2"><Clock size={16} className="text-[#4F7BFF]" /> {featured.readTime || 4} min read</span>
                    <span className="inline-flex items-center gap-2 text-[#4F7BFF]">Read guide <ArrowRight size={16} /></span>
                  </div>
                </div>
                <div className="mt-6">
                  <BlogVisual index={0} large image={featured.featuredImage} title={featured.title} />
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {!featured && (
        <section className="px-4 pb-20">
          <Reveal className="mx-auto max-w-7xl rounded-[24px] border border-white/10 bg-[#111111] p-8 text-center">
            <h2 className="text-2xl font-semibold">No published blogs yet</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Publish blogs from the admin dashboard and they will appear here automatically.
            </p>
          </Reveal>
        </section>
      )}

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post, index) => (
            <Reveal key={post._id} delay={(index % 3) * 0.05}>
              <BlogCard post={post} index={index} />
            </Reveal>
          ))}
        </div>
      </section>

      {(trending.length > 0 || popular.length > 0) && (
        <section className="px-4 pb-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <Reveal className="rounded-[24px] bg-[#171717] p-6">
              <h2 className="text-3xl font-black">Trending articles</h2>
              <div className="mt-5 grid gap-3">
                {(trending.length ? trending : visible.slice(0, 4)).map((post) => <Link key={post._id} to={`/blog/${post.slug}`} className="rounded-[12px] bg-[#0d0d0d] p-4 text-sm font900 transition hover:bg-[#2155FF]/10 hover:text-[#4F7BFF]">{post.title}</Link>)}
              </div>
            </Reveal>
            <Reveal className="rounded-[24px] bg-[#171717] p-6" delay={0.08}>
              <h2 className="text-3xl font-black">Popular blogs</h2>
              <div className="mt-5 grid gap-3">
                {popular.map((post) => <Link key={post._id} to={`/blog/${post.slug}`} className="flex justify-between gap-4 rounded-[12px] bg-[#0d0d0d] p-4 text-sm font900 transition hover:bg-[#2155FF]/10 hover:text-[#4F7BFF]"><span>{post.title}</span><span className="text-white/35">{post.views || 0} views</span></Link>)}
              </div>
            </Reveal>
          </div>
        </section>
      )}

    </section>
  );
}
