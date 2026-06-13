import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search as SearchIcon, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { MotionPage, Reveal } from '../components/common/MotionPage.jsx';
import { SEO } from '../utils/seo.jsx';

export function NotFound() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <MotionPage>
      <SEO title="Page Not Found" description="The requested Weblix page could not be found. Search the site or return home." />
      <section className="relative min-h-[72vh] overflow-hidden bg-[#0d0d0d] py-20 text-white">
        <div className="pointer-events-none absolute left-1/2 top-8 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Reveal>
            <p className="text-sm font800 uppercase tracking-[0.22em] text-[#4F7BFF]">404 error</p>
            <h1 className="mt-4 text-5xl font-medium leading-tight md:text-7xl">This Weblix page is not here.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60">The URL may have changed, or the page was moved. Search the site, ask the AI Agent, or go back to the Weblix homepage.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <form onSubmit={submit} className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 md:flex-row">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Weblix..." className="min-h-12 flex-1 rounded-[10px] border border-white/10 bg-[#111] px-4 text-white outline-none placeholder:text-white/35" />
              <Button type="submit"><SearchIcon size={18} /> Search</Button>
            </form>
          </Reveal>
          <Reveal delay={0.12} className="mt-7 flex flex-wrap justify-center gap-3">
            <Button to="/"><Home size={18} /> Home</Button>
            <Button to="/ai-agent" variant="ghost"><Sparkles size={18} /> Ask AI Agent</Button>
            <Button to="/templates" variant="ghost">Templates</Button>
            <Button to="/pricing" variant="ghost">Pricing</Button>
          </Reveal>
        </div>
      </section>
    </MotionPage>
  );
}
