import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { api, assetUrl } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => { api.get('/admin/users').then(({ data }) => setUsers(data)).catch(() => setUsers([])); }, []);
  const visible = users.filter((user) => `${user.name} ${user.email} ${user.role} ${user.provider}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Manage Users" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Users</p><h1 className="mt-2 text-3xl font-black">Customer accounts</h1></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="min-h-12 rounded-[10px] border border-white/10 bg-[#171717] px-4 outline-none" placeholder="Search users" />
        </div>
        <div className="mt-6 rounded-[18px] bg-[#171717] p-5"><Users className="text-[#4F7BFF]" /><p className="mt-4 text-sm text-white/45">Total Users</p><h2 className="text-3xl font-black">{users.length}</h2></div>
        <div className="mt-6 overflow-hidden rounded-[18px] border border-white/10 bg-[#171717]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-[#101010] text-xs font900 uppercase tracking-[0.12em] text-white/35"><tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Joined</th></tr></thead>
              <tbody className="divide-y divide-white/10">{visible.map((user) => <tr key={user._id}><td className="px-5 py-4"><div className="flex items-center gap-3">{user.avatar ? <img src={assetUrl(user.avatar)} alt={user.name} className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2155FF] font900">{user.name?.[0] || 'U'}</span>}<span className="font900">{user.name}</span></div></td><td className="px-5 py-4 text-[#4F7BFF]">{user.email}</td><td className="px-5 py-4 capitalize text-white/55">{user.provider}</td><td className="px-5 py-4 capitalize">{user.role}</td><td className="px-5 py-4 text-white/45">{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
            </table>
          </div>
          {visible.length === 0 && <p className="p-8 text-center text-white/45">No users found.</p>}
        </div>
      </div>
    </section>
  );
}
