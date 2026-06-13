import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SEO } from '../../utils/seo.jsx';

export function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { acceptToken } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      await acceptToken(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Please request a new link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid min-h-screen place-items-center bg-[#0d0d0d] px-4 py-16 text-white">
      <SEO title="Reset Password" />
      <form onSubmit={submit} className="w-full max-w-lg rounded-[24px] border border-white/10 bg-[#1b1b1b] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] md:p-10">
        <h1 className="font-display text-4xl font-black">Create new password</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-white/45">Use at least 8 characters to secure your Weblix account.</p>
        <div className="mt-8 grid gap-4">
          <input required minLength={8} type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-14 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-bold outline-none transition placeholder:text-white/30 focus:border-[#4F7BFF]" />
          <input required minLength={8} type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="min-h-14 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-bold outline-none transition placeholder:text-white/30 focus:border-[#4F7BFF]" />
        </div>
        {error && <p className="mt-4 rounded-[10px] border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">{error}</p>}
        <button disabled={loading} className="mt-6 min-h-14 w-full rounded-[10px] bg-[#2155FF] text-sm font-black transition hover:bg-[#4F7BFF] disabled:opacity-60">
          {loading ? 'Saving...' : 'Reset and sign in'}
        </button>
        <p className="mt-6 text-center text-sm font-bold text-white/45"><Link to="/login" className="text-[#4F7BFF] hover:text-white">Back to login</Link></p>
      </form>
    </section>
  );
}
