import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Send, X } from 'lucide-react';
import { api } from '../../services/api.js';
import { trackEvent } from '../../hooks/useAnalytics.js';

const starters = [
  'Which plan is best?',
  'How do downloads work?',
  'Show me templates'
];

export function AIAgentWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hi, I am the Weblix AI Agent. Ask me about pricing, templates, downloads, licenses, or SEO blogs.' }
  ]);
  const [results, setResults] = useState([]);

  const hiddenRoutes = ['/admin', '/checkout', '/login', '/signup', '/forgot-password', '/reset-password'];
  if (hiddenRoutes.some((route) => location.pathname.startsWith(route))) return null;

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
      setMessages((items) => [...items, { role: 'agent', text: 'I could not connect right now. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    send();
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] text-white">
      {open && (
        <div className="mb-4 w-[calc(100vw-2.5rem)] max-w-[390px] overflow-hidden rounded-[18px] border border-white/10 bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#06134A] to-[#1237a5] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#2155FF]">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-sm font900">Weblix AI Agent</h3>
                <p className="text-xs text-white/45">Online site assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-[10px] bg-white/10 text-white/70 transition hover:text-white" aria-label="Close AI chat">
              <X size={17} />
            </button>
          </div>

          <div className="h-[330px] space-y-3 overflow-y-auto bg-[#0d0d0d] p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[84%] rounded-[14px] px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-[#2155FF] text-white' : 'bg-white/[0.08] text-white/72'}`}>
                  {message.text}
                </div>
              </div>
            ))}
            {loading && <div className="rounded-[14px] bg-white/[0.08] px-4 py-3 text-sm text-white/50">Thinking...</div>}
          </div>

          {results.length > 0 && (
            <div className="border-t border-white/10 bg-[#101010] px-4 py-3">
              <p className="mb-2 text-xs font900 uppercase tracking-[0.14em] text-[#4F7BFF]">Helpful links</p>
              <div className="grid gap-2">
                {results.slice(0, 3).map((item) => (
                  <Link key={`${item.type}-${item.title}`} onClick={() => setOpen(false)} to={item.url} className="rounded-[10px] bg-white/[0.05] px-3 py-2 text-xs font800 text-white/65 transition hover:bg-[#2155FF]/20 hover:text-white">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 bg-[#101010] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {starters.map((starter) => (
                <button key={starter} onClick={() => send(starter)} className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font800 text-white/50 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF]">
                  {starter}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Weblix..."
                className="min-h-11 flex-1 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 text-sm outline-none placeholder:text-white/30 focus:border-[#4F7BFF]"
              />
              <button disabled={loading} className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#2155FF] transition hover:bg-[#4F7BFF] disabled:opacity-60" aria-label="Send message">
                <Send size={17} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setOpen((value) => {
            if (!value) trackEvent('ai_agent_open');
            return !value;
          });
        }}
        className="group relative grid h-[62px] w-[62px] place-items-center rounded-full bg-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(33,85,255,0.35)]"
        aria-label="Open Weblix AI Agent"
      >
        <span className="absolute inset-[5px] rounded-full bg-gradient-to-br from-[#2155FF] to-[#4F7BFF]" />
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#06134A] text-white shadow-inner">
          {open ? <X size={23} /> : <Bot size={24} />}
        </span>
        <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-[#48d88b]" />
        <span className="absolute right-[68px] hidden whitespace-nowrap rounded-full border border-white/10 bg-[#101010] px-3 py-2 text-xs font800 text-white/75 shadow-[0_14px_40px_rgba(0,0,0,0.35)] group-hover:block">
          Ask Weblix AI
        </span>
      </button>
    </div>
  );
}
