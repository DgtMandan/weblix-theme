import { useState } from 'react';
import { Github, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [pendingTwoFactor, setPendingTwoFactor] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, verifyLoginOtp, resendLoginOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form, remember);
      if (result?.pendingTwoFactor) {
        setPendingTwoFactor(true);
        setDevOtp(result.devOtp || '');
        setError('');
        return;
      }
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyLoginOtp({ email: form.email, otp }, remember);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError('');
    setLoading(true);
    try {
      const result = await resendLoginOtp(form.email);
      setDevOtp(result.devOtp || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend verification code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden bg-[#0d0d0d] text-white">
      <SEO title="Login" description="Sign in to Weblix Website Builder with email, Google or GitHub." />

      <div className="relative min-h-screen px-4 py-12 md:px-8">
        <div className="pointer-events-none absolute left-[-12%] top-[-20%] h-[760px] w-[760px] rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-18%] top-[10%] h-[680px] w-[680px] rounded-full border border-[#4F7BFF]/20" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.78fr]">
          <div className="hidden min-h-[680px] flex-col justify-center lg:flex">
            <div className="mb-8">
              <img src={weblixLogo} alt="Weblix Website Builder" className="h-20 w-auto object-contain" />
            </div>
            <h1 className="font-display text-7xl font-black leading-[0.98] tracking-[-0.02em]">
              Great to have you back.
            </h1>
            <p className="mt-8 max-w-xl text-xl font-bold leading-8 text-white/55">
              Sign in to access purchased builder ZIPs, templates, downloads, billing history and your Weblix dashboard.
            </p>
            <div className="mt-14 grid max-w-xl grid-cols-3 gap-4">
              {['Secure downloads', 'OAuth login', 'Order history'].map((item) => (
                <div key={item} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="mb-5 h-2 w-12 rounded-full bg-[#2155FF]" />
                  <p className="text-sm font-black text-white/75">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={pendingTwoFactor ? verifyOtp : submit} className="mx-auto w-full max-w-xl rounded-[24px] border border-white/10 bg-[#1b1b1b] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-6 md:p-10">
            <div className="text-center">
              <h2 className="font-display text-4xl font-black tracking-[-0.02em]">{pendingTwoFactor ? 'Verify sign in' : 'Sign in'}</h2>
              <p className="mt-3 text-sm font-bold text-white/45">{pendingTwoFactor ? `Enter the code sent to ${form.email}.` : 'Use your account to continue buying and downloading Weblix files.'}</p>
            </div>

            {!pendingTwoFactor ? (
              <>
                <div className="mt-8 grid gap-3">
                  <a href={`${API_URL}/auth/google`} className="flex min-h-14 items-center justify-center gap-3 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">
                    <GoogleIcon /> Continue with Google
                  </a>
                  <a href={`${API_URL}/auth/github`} className="flex min-h-14 items-center justify-center gap-3 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 text-sm font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">
                    <Github size={20} /> Continue with GitHub
                  </a>
                </div>

                <div className="my-8 flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-white/25">
                  <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid gap-5">
                  <label className="grid gap-2">
                    <span className="flex items-center justify-between text-sm font-black">
                      Username or Email
                      <Link to="/forgot-password" className="font-bold text-[#4F7BFF] hover:text-white">Remind me</Link>
                    </span>
                    <span className="flex min-h-14 items-center gap-3 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 transition focus-within:border-[#4F7BFF]">
                      <Mail size={18} className="text-white/35" />
                      <input required type="email" className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/30" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </span>
                  </label>

                  <label className="grid gap-2">
                    <span className="flex items-center justify-between text-sm font-black">
                      Password
                      <Link to="/forgot-password" className="font-bold text-[#4F7BFF] hover:text-white">Forgot</Link>
                    </span>
                    <span className="flex min-h-14 items-center gap-3 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 transition focus-within:border-[#4F7BFF]">
                      <LockKeyhole size={18} className="text-white/35" />
                      <input required minLength={8} type="password" className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/30" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <div className="mt-8 grid gap-5">
                <div className="rounded-[16px] border border-[#4F7BFF]/25 bg-[#2155FF]/10 p-4 text-sm font-bold leading-6 text-[#b9c8ff]">
                  <ShieldCheck className="mb-3 text-[#4F7BFF]" />
                  Two-step verification protects your Weblix purchases, downloads and admin access if someone gets your password.
                </div>
                <label className="grid gap-2">
                  <span className="text-sm font-black">Verification code</span>
                  <span className="flex min-h-14 items-center gap-3 rounded-[10px] border border-white/15 bg-[#0d0d0d] px-4 transition focus-within:border-[#4F7BFF]">
                    <ShieldCheck size={18} className="text-white/35" />
                    <input required inputMode="numeric" maxLength={6} className="w-full bg-transparent text-center text-xl font-black tracking-[0.4em] text-white outline-none placeholder:text-white/30" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                  </span>
                </label>
                {devOtp && <p className="rounded-[10px] border border-[#4F7BFF]/25 bg-[#2155FF]/10 p-3 text-center text-sm font900 text-[#b9c8ff]">Dev code: {devOtp}</p>}
                <button type="button" onClick={resendOtp} disabled={loading} className="text-sm font900 text-[#4F7BFF] hover:text-white">Resend code</button>
              </div>
            )}

            <label className="mt-5 flex items-center gap-2 text-sm font-bold text-white/50">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#2155FF]" />
              Remember me on this device
            </label>

            {error && <p className="mt-4 rounded-[10px] border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">{error}</p>}

            <button disabled={loading} className="mt-7 min-h-14 w-full rounded-[10px] bg-[#2155FF] text-sm font-black text-white transition hover:bg-[#4F7BFF] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Checking...' : pendingTwoFactor ? 'Verify & Sign In' : 'Sign in'}
            </button>

            {pendingTwoFactor && <button type="button" onClick={() => { setPendingTwoFactor(false); setOtp(''); setDevOtp(''); }} className="mt-4 w-full text-sm font900 text-white/45 hover:text-white">Use a different account</button>}

            <p className="mt-7 text-center text-sm font-bold text-white/50">
              New here? <Link className="text-[#4F7BFF] hover:text-white" to="/signup">Create a Weblix account</Link>
            </p>

            <div className="mt-8 border-t border-white/10 pt-6 text-xs font-bold leading-6 text-white/35">
              By continuing, you confirm you agree to our <Link className="text-white/65 hover:text-[#4F7BFF]" to="/privacy-policy">Privacy Policy</Link> and <Link className="text-white/65 hover:text-[#4F7BFF]" to="/terms-and-conditions">Terms of Use</Link>.
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
