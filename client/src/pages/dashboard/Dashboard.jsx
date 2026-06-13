import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, FileArchive, LayoutDashboard, LogOut, Receipt, Save, ShieldCheck, ShoppingBag, UserRound } from 'lucide-react';
import { api, assetUrl } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SEO } from '../../utils/seo.jsx';
import { downloadProtectedFile } from '../../utils/download.js';
import { formatUsd } from '../../utils/currency.js';

function Panel({ children, className = '' }) {
  return <div className={`rounded-[18px] border border-white/10 bg-[#171717] ${className}`}>{children}</div>;
}

function Status({ value }) {
  const paid = value === 'paid';
  return <span className={`rounded-[10px] px-3 py-1 text-xs font800 ${paid ? 'bg-[#1f8f55]/15 text-[#48d88b]' : 'bg-[#2155FF]/15 text-[#4F7BFF]'}`}>{value || 'pending'}</span>;
}

function LicenseLabel({ order }) {
  if (order.status !== 'paid') return <span className="text-white/35">Pending</span>;
  if (order.licenseType === 'lifetime') return <span className="text-[#48d88b]">Lifetime</span>;
  if (order.licenseExpiresAt) return <span className="text-white/55">Renews {new Date(order.licenseExpiresAt).toLocaleDateString()}</span>;
  return <span className="text-white/55">Standard</span>;
}

export function Dashboard() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data)).catch(() => setOrders([]));
    api.get('/downloads').then(({ data }) => setDownloads(data)).catch(() => setDownloads([]));
  }, []);

  useEffect(() => {
    setProfileName(user?.name || '');
  }, [user?.name]);

  async function saveProfile(e) {
    e.preventDefault();
    const data = new FormData();
    data.append('name', profileName);
    if (avatar) data.append('avatar', avatar);
    await updateProfile(data);
    setAvatar(null);
    setProfileMessage('Profile updated.');
  }

  async function signOut() {
    await logout();
    navigate('/login');
  }

  const paidOrders = orders.filter((order) => order.status === 'paid');
  const totalSpent = paidOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const cards = useMemo(() => ([
    ['Orders', orders.length, Receipt],
    ['Downloads', downloads.length, Download],
    ['Paid Value', formatUsd(totalSpent), ShoppingBag],
    ['Account', user?.provider || 'local', ShieldCheck]
  ]), [orders.length, downloads.length, totalSpent, user?.provider]);

  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white md:px-6">
      <SEO title="Dashboard" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Customer Dashboard</p>
            <h1 className="mt-2 text-3xl font-black">Welcome back, {user?.name}</h1>
            <p className="mt-2 text-sm font700 text-white/40">Manage your Weblix orders, licenses and secure ZIP downloads.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/templates" className="flex-1 rounded-[10px] border border-white/10 px-4 py-3 text-center text-sm font900 text-white/65 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF] sm:flex-none">Browse Templates</Link>
            {user?.role === 'admin' && <Link className="flex-1 rounded-[10px] bg-[#2155FF] px-4 py-3 text-center text-sm font900 transition hover:bg-[#4F7BFF] sm:flex-none" to="/admin">Admin</Link>}
            <button onClick={signOut} className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font900 text-red-200 transition hover:bg-red-500/20 sm:flex-none"><LogOut size={17} /> Logout</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <Panel key={label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font800 text-white/45">{label}</p>
                  <h2 className="mt-2 text-3xl font-black capitalize">{value}</h2>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#2155FF]/15 text-[#4F7BFF]"><Icon size={22} /></span>
              </div>
            </Panel>
          ))}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-xl font-black">Billing History</h2>
                <p className="mt-1 text-sm font700 text-white/35">All purchases made from your Weblix account.</p>
              </div>
              <LayoutDashboard className="text-[#4F7BFF]" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#101010] text-xs font900 uppercase tracking-[0.12em] text-white/35">
                  <tr><th className="px-5 py-4">Item</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">License</th><th className="px-5 py-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {orders.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-white/40">No orders yet. Buy a builder ZIP or template to begin.</td></tr>}
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-5 py-4 font800">{order.item?.name || order.itemType}</td>
                      <td className="px-5 py-4 capitalize text-white/50">{order.itemType}</td>
                      <td className="px-5 py-4 text-[#4F7BFF]">{formatUsd(order.amount)}</td>
                      <td className="px-5 py-4"><LicenseLabel order={order} /></td>
                      <td className="px-5 py-4"><Status value={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Profile</h2>
              <UserRound className="text-[#4F7BFF]" />
            </div>
            <div className="mt-5 rounded-[16px] bg-[#0d0d0d] p-5">
              <div className="flex items-center gap-4">
                {user?.avatar ? <img src={assetUrl(user.avatar)} alt={user.name} className="h-16 w-16 rounded-full object-cover" /> : <span className="grid h-16 w-16 place-items-center rounded-full bg-[#2155FF] text-xl font900">{user?.name?.[0] || 'U'}</span>}
                <div>
                  <p className="text-sm font900">{user?.name}</p>
                  <p className="mt-1 break-all text-sm font700 text-white/45">{user?.email}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between"><span className="text-white/40">Provider</span><span className="font800 capitalize">{user?.provider}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Role</span><span className="font800 capitalize">{user?.role}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Security</span><span className="font800 text-[#48d88b]">JWT Active</span></div>
              </div>
            </div>
            <form onSubmit={saveProfile} className="mt-4 grid gap-3">
              <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 text-sm font800 outline-none focus:border-[#4F7BFF]" placeholder="Name" />
              <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-sm font800 text-white/60">
                Avatar
                <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" className="mt-2 w-full text-xs" onChange={(e) => setAvatar(e.target.files[0])} />
              </label>
              {profileMessage && <p className="rounded-[10px] bg-[#4F7BFF]/10 p-3 text-xs font900 text-[#4F7BFF]">{profileMessage}</p>}
              <button className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2155FF] px-4 py-3 text-sm font900 transition hover:bg-[#4F7BFF]"><Save size={17} /> Update Profile</button>
            </form>
          </Panel>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.8fr_1fr]">
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Download Library</h2>
              <FileArchive className="text-[#4F7BFF]" />
            </div>
            <div className="mt-5 grid gap-3">
              {downloads.length === 0 && <p className="rounded-[12px] bg-[#0d0d0d] p-5 text-sm font-bold text-white/40">Purchased ZIP files will appear here after payment.</p>}
              {downloads.map((item) => (
                <button key={item._id} onClick={() => downloadProtectedFile(`/api/downloads/${item._id}`)} className="flex items-center justify-between rounded-[12px] bg-[#0d0d0d] p-4 text-left transition hover:bg-[#2155FF]/10">
                  <span className="font800">Download ZIP</span>
                  <span className="text-sm font800 text-[#4F7BFF]">{item.count} downloads</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-xl font-black">Recommended Actions</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ['Buy Builder ZIP', '/pricing'],
                ['Browse Templates', '/templates'],
                ['Read Weblix Blog', '/blog']
              ].map(([label, href]) => (
                <Link key={label} to={href} className="rounded-[12px] bg-[#0d0d0d] p-5 text-sm font900 transition hover:bg-[#2155FF]/10 hover:text-[#4F7BFF]">{label}</Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
