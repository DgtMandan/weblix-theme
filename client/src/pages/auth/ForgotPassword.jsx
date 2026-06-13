import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not prepare reset link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid min-h-screen place-items-center bg-[#0d0d0d] px-4 py-16 text-white">
      <SEO title="Forgot Password" />
      <form onSubmit={submit} className="w-full max-w-lg rounded-[24px] border border-white/10 bg-[#1b1b1b] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] md:p-10">
        <h1 className="font-display text-4xl font-black">Reset password</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-white/45">Enter your email and Weblix will prepare a secure reset link.</p>
        <input required type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-8 min-h-14 w-full rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-bold outline-none transition placeholder:text-white/30 focus:border-[#4F7BFF]" />
        {error && <p className="mt-4 rounded-[10px] border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">{error}</p>}
        {result && (
          <div className="mt-4 rounded-[10px] border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 p-4 text-sm font-bold leading-6 text-white/70">
            <p>{result.message}</p>
            {result.resetUrl && <Link className="mt-2 block break-all text-[#4F7BFF] hover:text-white" to={new URL(result.resetUrl).pathname}>Open reset link</Link>}
          </div>
        )}
        <button disabled={loading} className="mt-6 min-h-14 w-full rounded-[10px] bg-[#2155FF] text-sm font-black transition hover:bg-[#4F7BFF] disabled:opacity-60">
          {loading ? 'Preparing...' : 'Send reset link'}
        </button>
        <p className="mt-6 text-center text-sm font-bold text-white/45"><Link to="/login" className="text-[#4F7BFF] hover:text-white">Back to login</Link></p>
      </form>
    </section>
  );
}
