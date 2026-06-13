import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BadgePercent,
  Bell,
  BookOpenText,
  Bot,
  CheckCircle2,
  Download,
  FileArchive,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Megaphone,
  Menu,
  PackagePlus,
  PenLine,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  X
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { api, assetUrl } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { SEO } from '../../utils/seo.jsx';
import { formatUsd } from '../../utils/currency.js';

const menu = [
  ['Dashboard', '/admin', LayoutDashboard],
  ['Analytics', '/admin/analytics', BarChart3],
  ['Builder Product', '/admin/products', FileArchive],
  ['Templates', '/admin/templates', PackagePlus],
  ['Coupons', '/admin/coupons', BadgePercent],
  ['Lead Finder', '/admin/leads', MapPinned],
  ['Announcements', '/admin/announcements', Megaphone],
  ['Blogs', '/admin/blogs', PenLine],
  ['Google Trends', '/admin/trends', BarChart3],
  ['AI Blog Generator', '/admin/trends', Bot],
  ['Auto Publish Settings', '/admin/trends/settings', Settings],
  ['Scheduled Posts', '/admin/trends/scheduled', BookOpenText],
  ['Orders', '/admin/orders', ShoppingCart],
  ['Users', '/admin/users', Users],
  ['Settings', '/admin/settings', Settings]
];

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-[18px] border border-white/10 bg-[#171717] shadow-[0_18px_60px_rgba(0,0,0,0.22)] ${className}`}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const paid = status === 'paid' || status === 'published' || status === 'active';
  return (
    <span className={`rounded-[10px] px-3 py-1 text-xs font800 ${paid ? 'bg-[#1f8f55]/15 text-[#48d88b]' : 'bg-[#2155FF]/15 text-[#4F7BFF]'}`}>
      {status || 'pending'}
    </span>
  );
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [range, setRange] = useState('Month');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardSearch, setDashboardSearch] = useState('');

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => setStats(data)).catch(() => setStats({}));
    api.get('/orders/admin/all').then(({ data }) => setOrders(data.slice(0, 6))).catch(() => setOrders([]));
    api.get('/admin/users').then(({ data }) => setUsers(data.slice(0, 6))).catch(() => setUsers([]));
    api.get('/templates').then(({ data }) => setTemplates(data.slice(0, 5))).catch(() => setTemplates([]));
    api.get('/blogs').then(({ data }) => setBlogs(data.slice(0, 5))).catch(() => setBlogs([]));
  }, []);

  const cards = useMemo(() => ([
    ['Total Revenue', formatUsd(stats.revenue), BarChart3, '+ live paid orders'],
    ['Orders', stats.orders || 0, ShoppingCart, 'checkout records'],
    ['Templates', stats.templates || 0, FileArchive, 'marketplace ZIPs'],
    ['Customers', stats.users || 0, Users, 'registered users']
  ]), [stats]);

  const paidOrders = orders.filter((order) => order.status === 'paid').length;
  const conversion = orders.length ? Math.round((paidOrders / orders.length) * 100) : 0;
  const chartSets = {
    Week: [40, 74, 62, 96, 70, 126, 88],
    Month: [62, 88, 54, 112, 76, 132, 92, 150, 118, 170, 136, 190],
    Year: [90, 120, 150, 110, 180, 210, 160, 230, 195, 260, 225, 300]
  };
  const chartLabels = range === 'Week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function submitDashboardSearch(event) {
    event.preventDefault();
    const query = dashboardSearch.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className="min-h-screen bg-[#0d0d0d] text-white">
      <SEO title="Admin Dashboard" />
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden min-h-screen border-r border-white/10 bg-[#101010] lg:block">
          <div className="px-5 py-6">
            <p className="text-xs font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Weblix Admin</p>
            <nav className="mt-5 grid gap-1.5">
              {menu.map(([label, href, Icon]) => (
                <NavLink
                  key={label}
                  to={href}
                  end={href === '/admin'}
                  className={({ isActive }) => `flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font800 transition ${isActive ? 'bg-[#2155FF] text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}
                >
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </nav>
            <Link to="/admin/products" className="mt-8 flex min-h-11 items-center justify-center rounded-[10px] bg-[#2155FF] px-4 text-sm font900 transition hover:bg-[#4F7BFF]">
              Upload Builder ZIP
            </Link>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden">
            <aside className="h-full w-[min(320px,86vw)] overflow-y-auto border-r border-white/10 bg-[#101010] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Weblix Admin</p>
                <button onClick={() => setMobileMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5" aria-label="Close admin menu">
                  <X size={18} />
                </button>
              </div>
              <nav className="mt-5 grid gap-1.5">
                {menu.map(([label, href, Icon]) => (
                  <NavLink
                    key={label}
                    to={href}
                    end={href === '/admin'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font800 transition ${isActive ? 'bg-[#2155FF] text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Icon size={18} /> {label}
                  </NavLink>
                ))}
              </nav>
              <Link onClick={() => setMobileMenuOpen(false)} to="/admin/products" className="mt-8 flex min-h-11 items-center justify-center rounded-[10px] bg-[#2155FF] px-4 text-sm font900 transition hover:bg-[#4F7BFF]">
                Upload Builder ZIP
              </Link>
            </aside>
          </div>
        )}

        <main className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setMobileMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5 lg:hidden" aria-label="Open menu"><Menu size={19} /></button>
                <div>
                  <h1 className="text-2xl font-black">Dashboard</h1>
                  <p className="text-sm font700 text-white/40">Home / Dashboard</p>
                </div>
              </div>
              <form onSubmit={submitDashboardSearch} className="hidden min-h-11 w-full max-w-md items-center gap-3 rounded-[10px] border border-white/10 bg-[#171717] px-4 md:flex">
                <Search size={18} className="text-white/35" />
                <input value={dashboardSearch} onChange={(event) => setDashboardSearch(event.target.value)} className="w-full bg-transparent text-sm font700 outline-none placeholder:text-white/30" placeholder="Search builder, templates, blogs" />
              </form>
              <div className="flex items-center gap-2">
                <button className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5 text-white/70"><Bell size={18} /></button>
                <Link to="/admin/settings" className="hidden items-center gap-2 rounded-[10px] bg-white/5 px-3 py-2 text-sm font800 text-white/70 transition hover:text-[#4F7BFF] sm:flex">
                  {user?.avatar ? <img src={assetUrl(user.avatar)} alt={user.name} className="h-7 w-7 rounded-full object-cover" /> : <span className="grid h-7 w-7 place-items-center rounded-full bg-[#2155FF] text-xs">{user?.name?.[0] || 'A'}</span>}
                  {user?.name || 'Admin'}
                </Link>
                <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5 text-white/70 hover:text-red-300" title="Logout"><LogOut size={18} /></button>
                <Link to="/dashboard" className="hidden rounded-[10px] border border-white/10 px-4 py-2 text-sm font800 text-white/65 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF] sm:inline-flex">User View</Link>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map(([label, value, Icon, note]) => (
                <Panel key={label} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font800 text-white/45">{label}</p>
                      <h2 className="mt-2 text-3xl font-black">{value}</h2>
                    </div>
                    <span className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#2155FF]/15 text-[#4F7BFF]"><Icon size={22} /></span>
                  </div>
                  <p className="mt-5 text-xs font800 text-[#4F7BFF]">{note}</p>
                </Panel>
              ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
              <Panel className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">Sales Overview</h2>
                    <p className="mt-1 text-sm font700 text-white/40">Revenue, paid orders and marketplace movement</p>
                  </div>
                  <div className="flex gap-2 text-xs font900">
                    {['Week', 'Month', 'Year'].map((item) => <button type="button" onClick={() => setRange(item)} key={item} className={`rounded-[10px] px-4 py-2 ${range === item ? 'bg-[#2155FF]' : 'bg-white/5 text-white/50 hover:text-white'}`}>{item}</button>)}
                  </div>
                </div>
                <div className="mt-8 flex h-72 items-end gap-3 rounded-[16px] bg-[#0d0d0d] p-5">
                  {chartSets[range].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-3">
                      <div className="relative w-full">
                        <div style={{ height }} className="w-full rounded-t-[10px] bg-gradient-to-t from-[#2155FF] to-[#4F7BFF]" />
                        <span style={{ bottom: Math.max(12, height - 30) }} className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />
                      </div>
                      <span className="text-[10px] font800 text-white/30">{chartLabels[index]}</span>
                    </div>
                  ))}
                </div>
                <div className="grid border-t border-white/10 text-center sm:grid-cols-4">
                  {[
                    ['Paid Orders', paidOrders],
                    ['Conversion', `${conversion}%`],
                    ['Blogs', stats.blogs || 0],
                    ['Downloads', orders.length]
                  ].map(([label, value]) => (
                    <div key={label} className="border-white/10 p-4 sm:border-r last:border-r-0">
                      <p className="text-lg font-black text-[#4F7BFF]">{value}</p>
                      <p className="text-xs font800 text-white/40">{label}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Weblix Tasks</h2>
                  <Link to="/admin/blogs" className="text-xs font900 text-[#4F7BFF]">View all</Link>
                </div>
                <div className="mt-5 grid gap-3">
                  {[
                    ['Upload builder product ZIP', '/admin/products'],
                    ['Review paid orders', '/admin/orders'],
                    ['Upload latest template ZIP', '/admin/templates'],
                    ['Publish trend blog posts', '/admin/blogs']
                  ].map(([label, href], index) => (
                    <Link key={label} to={href} className="flex items-center gap-3 rounded-[12px] bg-[#0d0d0d] p-4 transition hover:bg-[#2155FF]/10">
                      <CheckCircle2 size={18} className={index === 0 ? 'text-[#48d88b]' : 'text-[#4F7BFF]'} />
                      <span className="text-sm font800 text-white/65">{label}</span>
                    </Link>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
              <Panel className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <h2 className="text-xl font-black">Recent Orders</h2>
                  <Link to="/admin/orders" className="rounded-[10px] bg-[#2155FF] px-4 py-2 text-xs font900 transition hover:bg-[#4F7BFF]">Manage</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-[#101010] text-xs font900 uppercase tracking-[0.12em] text-white/35">
                      <tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {orders.length === 0 && <tr><td colSpan="4" className="px-5 py-8 text-center text-white/40">No orders yet.</td></tr>}
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-5 py-4 font800">{order.item?.name || order.itemType}</td>
                          <td className="px-5 py-4 text-white/50">{order.user?.email || 'Customer'}</td>
                          <td className="px-5 py-4 text-[#4F7BFF]">{formatUsd(order.amount)}</td>
                          <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Content Status</h2>
                  <BookOpenText className="text-[#4F7BFF]" />
                </div>
                <div className="mt-6 grid gap-3">
                  {blogs.length === 0 && <p className="text-sm font-bold text-white/40">Published and trend blogs will appear here.</p>}
                  {blogs.map((blog) => (
                    <Link key={blog._id} to={`/blog/${blog.slug}`} className="rounded-[12px] bg-[#0d0d0d] p-4 transition hover:bg-[#2155FF]/10">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 text-sm font900">{blog.title}</p>
                        <StatusBadge status={blog.status} />
                      </div>
                      <p className="mt-2 line-clamp-1 text-xs font700 text-white/35">{blog.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1fr]">
              <Panel className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Template Inventory</h2>
                  <Link to="/admin/templates" className="text-xs font900 text-[#4F7BFF]">Add template</Link>
                </div>
                <div className="mt-5 grid gap-3">
                  {templates.length === 0 && <p className="text-sm font-bold text-white/40">Templates from dashboard uploads will appear here.</p>}
                  {templates.map((template) => (
                    <Link key={template._id} to={`/templates/${template.slug}`} className="flex items-center justify-between gap-4 rounded-[12px] bg-[#0d0d0d] p-4 transition hover:bg-[#2155FF]/10">
                      <div>
                        <p className="text-sm font900">{template.name}</p>
                        <p className="mt-1 text-xs font700 text-white/35">{template.tags?.join(', ') || 'Template ZIP'}</p>
                      </div>
                      <span className="text-sm font900 text-[#4F7BFF]">{formatUsd(template.price)}</span>
                    </Link>
                  ))}
                </div>
              </Panel>

              <Panel className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <h2 className="text-xl font-black">Users</h2>
                  <Link to="/admin/users" className="rounded-[10px] bg-white/5 px-4 py-2 text-xs font900 text-white/60 transition hover:bg-[#2155FF] hover:text-white">View all</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-[#101010] text-xs font900 uppercase tracking-[0.12em] text-white/35">
                      <tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Role</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.length === 0 && <tr><td colSpan="4" className="px-5 py-8 text-center text-white/40">No users yet.</td></tr>}
                      {users.map((item) => (
                        <tr key={item._id}>
                          <td className="px-5 py-4 font800">{item.name}</td>
                          <td className="px-5 py-4 text-[#4F7BFF]">{item.email}</td>
                          <td className="px-5 py-4 text-white/50">{item.provider}</td>
                          <td className="px-5 py-4"><StatusBadge status={item.role === 'admin' ? 'active' : 'user'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 border-t border-white/10 py-5 text-xs font800 text-white/30 sm:flex-row">
              <span>Weblix Website Builder admin dashboard</span>
              <span>Secure JWT + protected admin routes</span>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
