import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Send, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { MotionPage, Reveal } from '../components/common/MotionPage.jsx';
import { api } from '../services/api.js';
import { SEO } from '../utils/seo.jsx';

const starters = [
  'Which Weblix Builder plan should I buy?',
  'How do downloads work after payment?',
  'How can I publish SEO blogs from Google Trends?'
];

export function AIAgent() {
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hi, I am the Weblix AI Agent. Ask me about builder pricing, template ZIPs, licenses, downloads, SEO blogs, or account verification.' }
  ]);
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function send(text = input) {
    const message = text.trim();
    if (!message || loading) return;
    setInput('');
    setMessages((items) => [...items, { role: 'user', text: message }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai-agent', { message });
      setMessages((items) => [...items, { role: 'agent', text: data.answer }]);
      setResults(data.results || []);
    } catch {
      setMessages((items) => [...items, { role: 'agent', text: 'I could not reach the Weblix data service right now. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    send();
  }

  return (
    <MotionPage>
      <SEO title="Weblix AI Agent" description="Ask the Weblix AI Agent about builder plans, template downloads, licenses, SEO blogs, and dashboard workflows." />
      <section className="bg-[#0d0d0d] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 text-sm font800 uppercase tracking-[0.18em] text-[#4F7BFF]"><Sparkles size={17} /> Weblix AI Agent</span>
              <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-tight md:text-6xl">Instant answers for Weblix buyers and admins.</h1>
              <p className="mt-5 max-w-2xl text-lg text-white/62">This assistant reads your live Weblix products, templates, and blogs so visitors can understand pricing, downloads, licenses, and content workflows without waiting for support.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button to="/pricing">View Pricing</Button>
                <Button to="/templates" variant="ghost">Browse Templates</Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Card className="p-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#2155FF]"><Bot size={22} /></div>
                <div>
                  <h2 className="font600">Weblix Agent</h2>
                  <p className="text-sm text-white/50">Connected to site data</p>
                </div>
              </div>
              <div className="mt-4 h-[420px] space-y-3 overflow-y-auto pr-1">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[84%] rounded-lg px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-[#2155FF] text-white' : 'bg-white/[0.08] text-white/75'}`}>
                      {message.text}
                    </div>
                  </div>
                ))}
                {loading && <div className="rounded-lg bg-white/[0.08] px-4 py-3 text-sm text-white/55">Thinking with Weblix data...</div>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {starters.map((starter) => (
                  <button key={starter} onClick={() => send(starter)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/58 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF]">{starter}</button>
                ))}
              </div>
              <form onSubmit={submit} className="mt-4 flex gap-2">
                <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about pricing, downloads, blogs..." className="min-h-12 flex-1 rounded-[10px] border border-white/10 bg-[#111] px-4 text-white outline-none placeholder:text-white/35" />
                <Button type="submit" className="px-4"><Send size={18} /></Button>
              </form>
            </Card>
          </Reveal>
        </div>

        {results.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-4 md:grid-cols-3">
            {results.map((item) => (
              <Link key={`${item.type}-${item.title}`} to={item.url} className="group rounded-lg border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-[#4F7BFF]/70">
                <p className="text-xs font800 uppercase tracking-[0.14em] text-[#4F7BFF]">{item.type}</p>
                <h3 className="mt-3 text-xl font600">{item.title}</h3>
                {item.price && <p className="mt-2 text-white/60">{item.price}</p>}
                <span className="mt-5 inline-flex items-center gap-2 text-sm text-[#4F7BFF]">Open <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MotionPage>
  );
}
