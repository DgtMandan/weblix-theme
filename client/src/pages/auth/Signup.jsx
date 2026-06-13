import { useState } from 'react';
import { CheckCircle2, Github, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { API_URL } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';
import weblixLogo from '../../assets/weblix-logo.png';

function GoogleIcon() {
  return (
    <span className="relative h-5 w-5 rounded-full bg-white">
      <span className="absolute inset-0 rounded-full border-[5px] border-[#4285F4] [clip-path:polygon(50%_50%,100%_50%,100%_100%,30%_100%,30%_70%,70%_70%,70%_30%,50%_30%)]" />
      <span className="absolute inset-0 rounded-full border-[5px] border-[#34A853] [clip-path:polygon(0_50%,50%_50%,50%_100%,0_100%)]" />
      <span className="absolute inset-0 rounded-full border-[5px] border-[#FBBC05] [clip-path:polygon(0_0,50%_0,50%_55%,0_55%)]" />
      <span className="absolute inset-0 rounded-full border-[5px] border-[#EA4335] [clip-path:polygon(30%_0,100%_0,100%_45%,50%_45%,50%_0)]" />
    </span>
  );
}

export function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showEmail, setShowEmail] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, verifySignupOtp, resendSignupOtp } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await signup(form);
      if (result.pendingVerification) {
        setPendingEmail(result.email);
        setDevOtp(result.devOtp || '');
        setMessage('Verification code sent to your email. Enter it below to finish signup.');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await verifySignupOtp({ email: pendingEmail, otp });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await resendSignupOtp(pendingEmail || form.email);
      setPendingEmail(result.email);
      setDevOtp(result.devOtp || '');
      setMessage('A new verification code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend verification code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden bg-[#0d0d0d] text-white">
      <SEO title="Signup" description="Create your Weblix Website Builder account with email, Google or GitHub." />

      <div className="relative min-h-screen px-4 py-12 md:px-8">
        <div className="pointer-events-none absolute left-[-12%] top-[-18%] h-[760px] w-[760px] rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-16%] top-[8%] h-[720px] w-[720px] rounded-full border border-[#4F7BFF]/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#06134A]/50 to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.78fr]">
          <div className="hidden min-h-[700px] flex-col justify-center lg:flex">
            <div className="mb-8">
              <img src={weblixLogo} alt="Weblix Website Builder" className="h-20 w-auto object-contain" />
            </div>
            <h1 className="font-display text-7xl font-black leading-[0.98] tracking-[-0.02em]">
              Come in, get creative.
            </h1>
            <p className="mt-8 max-w-xl text-xl font-bold leading-8 text-white/55">
              Create your free account to buy Weblix builder ZIPs, save templates, manage downloads and launch faster.
            </p>
            <div className="mt-14 max-w-xl rounded-[30px] border border-white/10 bg-white/[0.04] p-8">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((item) => <span key={item} className="h-20 rounded-[18px] bg-gradient-to-br from-[#2155FF] to-[#4F7BFF]" />)}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-[24px] border border-white/10 bg-[#1b1b1b] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-6 md:p-10">
            <div className="text-center">
              <h2 className="font-display text-4xl font-black tracking-[-0.02em]">Create a free account</h2>
              <div className="mt-7 flex items-center justify-center gap-3 text-base font-black text-white/80">
                <CheckCircle2 className="text-[#4F7BFF]" size={22} />
                Save purchases into your own dashboard
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              <a href={`${API_URL}/auth/google`} className="flex min-h-14 items-center justify-center gap-3 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">
                <GoogleIcon /> Continue with Google
              </a>
              <a href={`${API_URL}/auth/github`} className="flex min-h-14 items-center justify-center gap-3 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">
                <Github size={20} /> Continue with GitHub
              </a>
              <button type="button" onClick={() => setShowEmail((value) => !value)} className="flex min-h-14 items-center justify-center gap-3 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">
                <Mail size={20} /> Continue with Email
              </button>
            </div>

            {message && <p className="mt-5 rounded-[10px] border border-[#4F7BFF]/30 bg-[#2155FF]/10 p-3 text-sm font-bold text-[#9bb5ff]">{message}</p>}
            {devOtp && <p className="mt-3 rounded-[10px] border border-yellow-300/30 bg-yellow-300/10 p-3 text-xs font900 text-yellow-100">Dev OTP: {devOtp}</p>}

            {showEmail && !pendingEmail && (
              <form onSubmit={submit} className="mt-6 grid gap-4">
                <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="min-h-14 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-bold outline-none transition placeholder:text-white/30 focus:border-[#4F7BFF]" />
                <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="min-h-14 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-bold outline-none transition placeholder:text-white/30 focus:border-[#4F7BFF]" />
                <input required minLength={8} type="password" placeholder="Password, 8+ characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="min-h-14 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-bold outline-none transition placeholder:text-white/30 focus:border-[#4F7BFF]" />
                {error && <p className="rounded-[10px] border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">{error}</p>}
                <button disabled={loading} className="min-h-14 rounded-[10px] bg-[#2155FF] text-sm font-black text-white transition hover:bg-[#4F7BFF] disabled:opacity-60">
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            )}

            {pendingEmail && (
              <form onSubmit={verifyOtp} className="mt-6 grid gap-4">
                <div className="rounded-[14px] border border-white/10 bg-[#0d0d0d] p-4">
                  <p className="text-sm font900 text-white">Verify {pendingEmail}</p>
                  <p className="mt-2 text-xs font700 leading-5 text-white/45">Enter the 6-digit code sent to your email. This step applies only to email/password signup.</p>
                </div>
                <input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="min-h-14 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-center text-xl font-black tracking-[0.25em] text-white outline-none transition placeholder:text-white/30 focus:border-[#4F7BFF]"
                />
                {error && <p className="rounded-[10px] border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">{error}</p>}
                <button disabled={loading || otp.length !== 6} className="min-h-14 rounded-[10px] bg-[#2155FF] text-sm font-black text-white transition hover:bg-[#4F7BFF] disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? 'Verifying...' : 'Verify & create account'}
                </button>
                <button type="button" disabled={loading} onClick={resendOtp} className="min-h-12 rounded-[10px] border border-white/15 bg-white/5 text-sm font900 text-white/70 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF] disabled:opacity-60">
                  Resend code
                </button>
                <button type="button" onClick={() => { setPendingEmail(''); setOtp(''); setDevOtp(''); setMessage(''); }} className="text-sm font800 text-white/40 hover:text-white">
                  Edit signup details
                </button>
              </form>
            )}

            <label className="mt-6 flex items-start gap-3 text-sm font-bold leading-6 text-white/75">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-1 h-5 w-5 rounded border-white/20 bg-transparent accent-[#2155FF]" />
              <span>
                Yes to creative inspo in your inbox. Fresh tutorials, trends, tools and Weblix updates.
                <span className="mt-1 block text-white/40">You can unsubscribe at any time.</span>
              </span>
            </label>

            <p className="mt-7 text-center text-sm font-bold text-white/50">
              Already have a Weblix account? <Link className="text-[#4F7BFF] hover:text-white" to="/login">Sign in here.</Link>
            </p>

            <div className="mt-8 border-t border-white/10 pt-6 text-xs font-bold leading-6 text-white/35">
              By continuing, you confirm you agree to our <Link className="text-white/65 hover:text-[#4F7BFF]" to="/privacy-policy">Privacy Policy</Link> and <Link className="text-white/65 hover:text-[#4F7BFF]" to="/terms-and-conditions">Terms of Use</Link>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
