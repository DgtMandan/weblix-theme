import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import weblixLogo from '../../assets/weblix-logo.png';
import { WebsiteTranslator } from './WebsiteTranslator.jsx';

const nav = [
  ['About', '/about'],
  ['Pricing', '/pricing'],
  ['Templates', '/templates'],
  ['Blog', '/blog'],
  ['Contact', '/contact']
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  async function signOut() {
    await logout();
    closeMenu();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0d0d]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" onClick={closeMenu} className="flex items-center" aria-label="Weblix Website Builder home">
          <img src={weblixLogo} alt="Weblix Website Builder" className="h-11 w-auto object-contain" />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map(([label, href]) => (
            <NavLink key={href} to={href} className={({ isActive }) => `text-sm font700 transition ${isActive ? 'text-lightBlue' : 'text-white/62 hover:text-lightBlue'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <WebsiteTranslator />
          {user ? (
            <>
              <Button to={user.role === 'admin' ? '/admin' : '/dashboard'}>Dashboard</Button>
              <button onClick={logout} className="grid h-11 w-11 place-items-center rounded-[10px] border border-white/15 bg-white/5 text-white transition hover:border-[#4F7BFF] hover:text-[#4F7BFF]" title="Logout"><LogOut size={18} /></button>
            </>
          ) : <Button to="/login" variant="ghost">Login</Button>}
        </div>
        <button onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white md:hidden" aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-[#0d0d0d] px-4 py-4 md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {nav.map(([label, href]) => (
              <NavLink key={href} to={href} onClick={closeMenu} className={({ isActive }) => `rounded-[10px] px-4 py-3 text-sm font700 transition ${isActive ? 'bg-[#2155FF] text-white' : 'text-white/70 hover:bg-white/5 hover:text-[#4F7BFF]'}`}>
                {label}
              </NavLink>
            ))}
            <div className="mt-2 grid gap-2 border-t border-white/10 pt-3">
              <WebsiteTranslator compact onChange={closeMenu} />
              {user ? (
                <>
                  <Link onClick={closeMenu} to={user.role === 'admin' ? '/admin' : '/dashboard'} className="rounded-[10px] bg-[#2155FF] px-4 py-3 text-center text-sm font800 text-white">Dashboard</Link>
                  <button onClick={signOut} className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/5 px-4 py-3 text-sm font800 text-white/75">
                    <LogOut size={17} /> Logout
                  </button>
                </>
              ) : (
                <Link onClick={closeMenu} to="/login" className="rounded-[10px] border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font800 text-white">Login</Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
