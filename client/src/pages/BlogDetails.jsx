import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, Facebook, Linkedin, Sparkles, Twitter } from 'lucide-react';
import { api, assetUrl } from '../services/api.js';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';

function BlogHeroVisual({ image, title }) {
  if (image) return <img loading="lazy" src={assetUrl(image)} alt={title} className="h-full w-full object-cover" />;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1b1b1b]">
      <div className="absolute left-[-10%] top-[-20%] h-72 w-72 rounded-full bg-[#2155FF]/35 blur-3xl" />
      <div className="absolute bottom-[-18%] right-[-10%] h-80 w-80 rounded-full bg-[#4F7BFF]/25 blur-3xl" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((item) => <span key={item} className="h-16 w-16 rounded-[14px] bg-[#4F7BFF]" />)}</div>
      </div>
    </div>
  );
}

function dateLabel(value) {
  if (!value) return 'Weblix editorial';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function extractToc(content = '') {
  return [...content.matchAll(/<h([2-3])[^>]*>(.*?)<\/h\1>/gi)].map((match, index) => ({
    id: `section-${index + 1}`,
    text: match[2].replace(/<[^>]*>/g, ''),
    level: match[1]
  }));
}

function withHeadingIds(content = '') {
  let index = 0;
  return content.replace(/<h([2-3])([^>]*)>/gi, (match, level, attrs) => {
    index += 1;
    return `<h${level}${attrs} id="section-${index}">`;
  });
}

export function BlogDetails() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setError('');
    setPost(null);
    api.get(`/blogs/${slug}`).then(({ data }) => setPost(data)).catch(() => setError('Blog not found.'));
    api.get('/blogs').then(({ data }) => setRelated(data.filter((item) => item.slug !== slug).slice(0, 3))).catch(() => setRelated([]));
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toc = useMemo(() => extractToc(post?.content), [post]);
  const content = useMemo(() => withHeadingIds(post?.content), [post]);
  const canonical = post?.canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const image = post?.ogImage || post?.featuredImage;
  const relatedPosts = related;
  const schema = post ? {
    '@context': 'https://schema.org',
    '@type': post.schemaType || 'BlogPosting',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    abstract: post.geoSummary || post.excerpt,
    image: image ? assetUrl(image) : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.authorName || 'Weblix Editorial' },
    mainEntityOfPage: canonical,
    audience: post.geoAudience ? { '@type': 'Audience', audienceType: post.geoAudience } : undefined,
    spatialCoverage: post.geoRegion || undefined,
    about: post.geoEntities?.map((entity) => ({ '@type': 'Thing', name: entity })),
    mentions: post.geoEntities?.map((entity) => ({ '@type': 'Thing', name: entity })),
    speakable: post.geoAnswer ? { '@type': 'SpeakableSpecification', cssSelector: ['.geo-answer'] } : undefined,
    mainEntity: post.faqs?.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } }))
  } : null;

  if (error) {
    return (
      <section className="grid min-h-screen place-items-center bg-[#0d0d0d] px-4 text-white">
        <SEO title="Blog not found" />
        <div className="max-w-xl text-center">
          <h1 className="font-display text-5xl font-black">Blog not found</h1>
          <p className="mt-4 text-white/55">{error}</p>
          <Link to="/blog" className="mt-8 inline-flex rounded-[10px] bg-[#2155FF] px-5 py-3 text-sm font-black transition hover:bg-[#4F7BFF]">Back to blog</Link>
        </div>
      </section>
    );
  }

  if (!post) return <div className="min-h-screen bg-[#0d0d0d] p-10 text-white">Loading blog...</div>;

  return (
    <article className="overflow-hidden bg-[#0d0d0d] py-14 text-white">
      <div className="fixed left-0 top-0 z-50 h-1 bg-[#4F7BFF]" style={{ width: `${progress}%` }} />
      <SEO
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        canonical={canonical}
        image={image ? assetUrl(image) : ''}
        type="article"
        schema={schema}
        keywords={[post.focusKeyword, ...(post.secondaryKeywords || []), ...(post.tags || [])].filter(Boolean)}
        geo={{
          title: post.geoTitle || post.seoTitle || post.title,
          summary: post.geoSummary || post.excerpt,
          answer: post.geoAnswer,
          audience: post.geoAudience,
          region: post.geoRegion,
          entities: post.geoEntities,
          questions: post.geoQuestions
        }}
      />
      <div className="mx-auto max-w-7xl px-4">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-black text-[#4F7BFF] transition hover:text-white"><ArrowLeft size={16} /> Back to blog</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
          <main className="min-w-0">
            <Reveal>
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white/45">
                <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> {dateLabel(post.publishedAt || post.createdAt)}</span>
                <span className="inline-flex items-center gap-2"><Clock size={16} /> {post.readTime || 4} min read</span>
                <span className="inline-flex items-center gap-2"><Sparkles size={16} /> {post.focusKeyword || post.tags?.[0] || 'Weblix'}</span>
              </div>
              <h1 className="mt-6 font-display text-5xl font-black leading-tight tracking-[-0.02em] md:text-7xl">{post.title}</h1>
              <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-white/55">{post.excerpt}</p>
            </Reveal>
            <Reveal delay={0.08} className="mt-10 aspect-[16/9] overflow-hidden rounded-[24px] border border-white/10 bg-[#1b1b1b]">
              <BlogHeroVisual image={post.featuredImage} title={post.title} />
            </Reveal>
            <Reveal delay={0.12}>
              <div className="prose prose-invert mt-12 max-w-none prose-headings:scroll-mt-28 prose-headings:font-display prose-headings:text-white prose-p:text-white/65 prose-p:font-semibold prose-a:text-[#4F7BFF] prose-strong:text-white prose-li:text-white/65 prose-img:rounded-[18px]" dangerouslySetInnerHTML={{ __html: content }} />
            </Reveal>

            {post.geoAnswer && (
              <section className="geo-answer mt-10 rounded-[22px] border border-[#4F7BFF]/25 bg-[#2155FF]/10 p-6">
                <p className="text-xs font900 uppercase tracking-[0.16em] text-[#4F7BFF]">AI answer summary</p>
                <h2 className="mt-3 text-2xl font-black">{post.geoTitle || post.title}</h2>
                <p className="mt-4 text-sm font700 leading-7 text-white/65">{post.geoAnswer}</p>
              </section>
            )}

            {post.faqs?.length > 0 && (
              <section className="mt-14 rounded-[24px] bg-[#171717] p-6">
                <h2 className="text-2xl font-black">Frequently Asked Questions</h2>
                <div className="mt-5 grid gap-3">
                  {post.faqs.map((faq, index) => <details key={index} className="rounded-[12px] bg-[#0d0d0d] p-4"><summary className="cursor-pointer font900">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-white/55">{faq.answer}</p></details>)}
                </div>
              </section>
            )}

            <section className="mt-12 rounded-[24px] bg-[#171717] p-6">
              <div className="flex items-center gap-4">
                {post.authorImage ? <img loading="lazy" src={assetUrl(post.authorImage)} alt={post.authorName || 'Author'} className="h-16 w-16 rounded-full object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-[#2155FF] font-black">W</div>}
                <div><p className="font900">{post.authorName || 'Weblix Editorial'}</p><p className="text-sm text-white/45">Website builder, SEO and SaaS launch insights.</p></div>
              </div>
            </section>
          </main>

          <aside className="hidden lg:block">
            <div className="sticky top-24 grid gap-5">
              {toc.length > 0 && <div className="rounded-[18px] bg-[#171717] p-5"><h2 className="text-sm font900 uppercase tracking-[0.16em] text-[#4F7BFF]">Table of contents</h2><div className="mt-4 grid gap-2">{toc.map((item) => <a key={item.id} href={`#${item.id}`} className={`text-sm font800 text-white/50 hover:text-[#4F7BFF] ${item.level === '3' ? 'pl-4' : ''}`}>{item.text}</a>)}</div></div>}
              <div className="rounded-[18px] bg-[#171717] p-5"><h2 className="text-sm font900 uppercase tracking-[0.16em] text-[#4F7BFF]">Share</h2><div className="mt-4 flex gap-2">{[Twitter, Facebook, Linkedin].map((Icon, index) => <button key={index} className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#0d0d0d] text-white/60 hover:text-[#4F7BFF]"><Icon size={17} /></button>)}</div></div>
              <div className="rounded-[18px] bg-[#171717] p-5"><h2 className="text-sm font900 uppercase tracking-[0.16em] text-[#4F7BFF]">Newsletter</h2><input className="mt-4 min-h-11 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 text-sm outline-none" placeholder="Email" /><button className="mt-3 w-full rounded-[10px] bg-[#2155FF] px-4 py-3 text-sm font900 hover:bg-[#4F7BFF]">Subscribe</button></div>
            </div>
          </aside>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-4">
          <h2 className="text-3xl font-black">Related posts</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {relatedPosts.map((item) => (
              <Link key={item._id} to={`/blog/${item.slug}`} className="rounded-[20px] border border-white/10 bg-[#171717] p-5 transition hover:-translate-y-1 hover:border-[#4F7BFF]/50">
                <p className="text-xs font-black text-[#4F7BFF]">{dateLabel(item.publishedAt || item.createdAt)}</p>
                <h3 className="mt-3 text-xl font-black leading-tight">{item.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm font-bold leading-6 text-white/45">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
