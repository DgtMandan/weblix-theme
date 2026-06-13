import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, UserRound } from 'lucide-react';
import { api, assetUrl } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SEO } from '../../utils/seo.jsx';

export function AdminSettings() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState('');
  async function save(e) {
    e.preventDefault();
    const data = new FormData();
    data.append('name', name);
    if (avatar) data.append('avatar', avatar);
    await updateProfile(data);
    setMessage('Profile updated.');
  }
  async function signOut() {
    await logout();
    navigate('/login');
  }
  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Admin Settings" />
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Settings</p>
        <h1 className="mt-2 text-3xl font-black">Profile & security</h1>
        {message && <div className="mt-5 rounded-[10px] bg-[#4F7BFF]/10 p-4 text-sm font900 text-[#4F7BFF]">{message}</div>}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <form onSubmit={save} className="rounded-[18px] border border-white/10 bg-[#171717] p-6">
            <h2 className="flex items-center gap-2 text-xl font-black"><UserRound className="text-[#4F7BFF]" /> Edit profile</h2>
            <div className="mt-6 grid gap-4">
              <input value={name} onChange={(e) => setName(e.target.value)} className="min-h-14 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none" placeholder="Name" />
              <input value={user?.email || ''} disabled className="min-h-14 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 text-white/45 outline-none" />
              <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4"><span className="text-sm font900">Avatar image</span><input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" className="mt-3 w-full text-sm text-white/55" onChange={(e) => setAvatar(e.target.files[0])} /></label>
            </div>
            <button className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[#2155FF] px-5 py-3 text-sm font900 hover:bg-[#4F7BFF]"><Save size={17} /> Save Profile</button>
          </form>
          <div className="rounded-[18px] border border-white/10 bg-[#171717] p-6">
            <div className="flex items-center gap-4">
              {user?.avatar ? <img src={assetUrl(user.avatar)} alt={user.name} className="h-20 w-20 rounded-full object-cover" /> : <span className="grid h-20 w-20 place-items-center rounded-full bg-[#2155FF] text-3xl font900">{user?.name?.[0] || 'A'}</span>}
              <div><p className="font900">{user?.name}</p><p className="text-sm text-white/45">{user?.email}</p><p className="mt-1 text-xs font900 uppercase text-[#4F7BFF]">{user?.role}</p></div>
            </div>
            <button onClick={signOut} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font900 text-red-200 hover:bg-red-500/20"><LogOut size={17} /> Logout</button>
          </div>
        </div>
      </div>
    </section>
  );
}
