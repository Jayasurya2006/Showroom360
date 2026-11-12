import { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Users, LogOut, Store, Menu } from 'lucide-react';
import api from './api';
import Login from './pages/Login'; import Dashboard from './pages/Dashboard'; import Inventory from './pages/Inventory';
import POS from './pages/POS'; import Invoices from './pages/Invoices'; import Clients from './pages/Clients'; import Catalogue from './pages/Catalogue';
const Auth = createContext(); export const useAuth = () => useContext(Auth);
function Shell() {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false);
  const own = user.role === 'OWNER';
  const nav = own ? [['/', 'Dashboard', LayoutDashboard], ['/pos', 'Billing', ShoppingCart], ['/inventory', 'Inventory', Package], ['/invoices', 'Invoices', FileText], ['/clients', 'Clients', Users]]
    : [['/', 'Products', Store], ['/invoices', 'My Orders', FileText]];
  return (<div className="min-h-screen md:flex">
    <aside className={`noprint bg-ink text-white w-60 shrink-0 ${open ? 'block' : 'hidden'} md:block`}>
      <div className="px-5 py-4 border-b border-white/20"><div className="text-xl font-bold tracking-wide">Showroom360</div><div className="text-xs text-slate-300">Billing &amp; Inventory</div></div>
      <nav className="p-3 space-y-1">{nav.map(([to, t, I]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
        className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded ${isActive ? 'bg-white/15 font-bold' : 'hover:bg-white/10'}`}><I size={17} />{t}</NavLink>)}</nav>
    </aside>
    <div className="flex-1 min-w-0">
      <header className="noprint bg-white border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
        <button className="md:hidden" onClick={() => setOpen(!open)}><Menu /></button>
        <div className="font-bold">{own ? 'Owner Console' : 'Customer Portal'}</div>
        <div className="flex items-center gap-3 text-sm"><span>{user.name}</span><button className="btn-o" onClick={logout}><LogOut size={14} />Sign out</button></div>
      </header>
      <main className="p-4 md:p-6"><Outlet /></main>
    </div></div>);
}
export default function App() {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false), nav = useNavigate();
  useEffect(() => { localStorage.getItem('s360_token') ? api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => {}).finally(() => setReady(true)) : setReady(true); }, []);
  const login = d => { localStorage.setItem('s360_token', d.token); setUser(d.user); nav('/'); };
  const logout = () => { localStorage.removeItem('s360_token'); setUser(null); nav('/login'); };
  if (!ready) return <div className="p-10 text-center">Loading…</div>;
  const own = user?.role === 'OWNER';
  return (<Auth.Provider value={{ user, login, logout }}><Routes>
    <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
    <Route element={user ? <Shell /> : <Navigate to="/login" />}>
      <Route index element={own ? <Dashboard /> : <Catalogue />} />
      <Route path="invoices" element={<Invoices />} />
      {own && <><Route path="pos" element={<POS />} /><Route path="inventory" element={<Inventory />} /><Route path="clients" element={<Clients />} /></>}
    </Route><Route path="*" element={<Navigate to="/" />} /></Routes></Auth.Provider>);
}
