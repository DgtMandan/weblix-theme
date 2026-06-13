import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bot, Search as SearchIcon } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { MotionPage, Reveal } from '../components/common/MotionPage.jsx';
import { api } from '../services/api.js';
import { SEO } from '../utils/seo.jsx';

export function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = params.get('q') || '';
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    api.get('/search', { params: { q } })
      .then(({ data }) => setResults(data.results || []))
      .catch(() => setError('Search is not available right now. Please try again.'))
      .finally(() => setLoading(false));
  }, [params]);

  function submit(event) {
    event.preventDefault();
    const next = query.trim();
    setParams(next ? { q: next } : {});
  }

  return (
    <MotionPage>
      <SEO title="Search" description="Search Weblix Builder plans, template ZIPs, SEO blogs, and support content." />
      <section className="relative overflow-hidden bg-[#0d0d0d] py-16 text-white">
        <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full border border-[#2155FF]/25 blur-sm" />
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font800 uppercase tracking-[0.18em] text-[#4F7BFF]">Site search</span>
              <h1 className="mt-4 text-4xl font-medium leading-tight md:text-6xl">Find builder plans, templates, blogs, and help.</h1>
              <p className="mt-5 text-lg text-white/62">Search across the live Weblix database. Results update from admin-created products, templates, and published blogs.</p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <form onSubmit={submit} className="mx-auto mt-9 flex max-w-3xl flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 shadow-glass backdrop-blur md:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-[10px] border border-white/10 bg-[#111]/80 px-4">
                <SearchIcon size={19} className="text-[#4F7BFF]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Weblix Builder, templates, SEO blogs..."
                  className="h-14 w-full bg-transparent text-white outline-none placeholder:text-white/35"
                />
              </div>
              <Button type="submit" className="md:min-w-36">Search</Button>
            </form>
          </Reveal>

          <div className="mt-10">
            {loading && <p className="text-center text-white/60">Searching Weblix...</p>}
            {error && <p className="text-center text-red-300">{error}</p>}
            {!loading && params.get('q') && !results.length && (
              <Card className="mx-auto max-w-2xl text-center">
                <Bot className="mx-auto text-[#4F7BFF]" size={34} />
                <h2 className="mt-4 text-2xl font600">No direct results found</h2>
                <p className="mt-2 text-white/60">Ask the Weblix AI Agent for help choosing a plan, finding templates, or understanding downloads.</p>
                <Button to="/ai-agent" className="mt-5">Ask AI Agent</Button>
              </Card>
            )}
            <div className="grid gap-4">
              {results.map((item) => (
                <Reveal key={`${item.type}-${item.id}`}>
                  <Link to={item.url} className="group block rounded-lg border border-white/10 bg-[#111]/90 p-5 shadow-glass transition hover:-translate-y-1 hover:border-[#4F7BFF]/70">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <span className="rounded-full border border-[#4F7BFF]/30 bg-[#2155FF]/10 px-3 py-1 text-xs font800 uppercase tracking-[0.12em] text-[#8fabff]">{item.type}</span>
                        <h2 className="mt-3 text-2xl font600 text-white">{item.title}</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">{item.description}</p>
                        <p className="mt-3 text-sm text-white/45">{item.meta}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[#4F7BFF]">
                        {item.price && <span className="text-lg font800 text-white">{item.price}</span>}
                        <ArrowRight className="transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MotionPage>
  );
}
