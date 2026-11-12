import { useEffect, useState } from 'react'; import toast from 'react-hot-toast'; import { Minus, Plus, X } from 'lucide-react'; import api, { inr, badge, label } from '../api'; import { Invoice } from './Invoices';
export default function POS() {
  const [prods, setProds] = useState([]), [q, setQ] = useState(''), [cat, setCat] = useState(''), [cats, setCats] = useState([]), [cart, setCart] = useState([]), [clients, setClients] = useState([]);
  const [cust, setCust] = useState(''), [walk, setWalk] = useState(''), [pay, setPay] = useState('CASH'), [disc, setDisc] = useState(0), [cfg, setCfg] = useState({ gstRate: 18, maxDiscount: 20 }), [done, setDone] = useState(null), [rid, setRid] = useState(crypto.randomUUID()), [busy, setBusy] = useState(false);
  const load = () => api.get('/products', { params: { q, category: cat, limit: 40 } }).then(r => setProds(r.data.items));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, cat]);
  useEffect(() => { api.get('/products/categories').then(r => setCats(r.data)); api.get('/clients').then(r => setClients(r.data)); api.get('/settings').then(r => setCfg(r.data)); }, []);
  const add = p => { const c = cart.find(i => i._id === p._id); if ((c?.n || 0) + 1 > p.qty) return toast.error(`Only ${p.qty} in stock`); setCart(c ? cart.map(i => i._id === p._id ? { ...i, n: i.n + 1 } : i) : [...cart, { ...p, n: 1 }]); };
  const chg = (id, d) => setCart(cart.map(i => i._id === id ? { ...i, n: Math.min(Math.max(1, i.n + d), i.qty) } : i));
  const sub = cart.reduce((a, i) => a + i.price * i.n, 0), dp = Math.min(Math.max(+disc || 0, 0), cfg.maxDiscount), dv = sub * dp / 100, tax = (sub - dv) * cfg.gstRate / 100;
  const confirmSale = async () => { setBusy(true);
    try { const r = await api.post('/sales', { items: cart.map(i => ({ productId: i._id, qty: i.n })), customerId: cust || undefined, customerName: walk, payment: pay, discountPct: dp, requestId: rid });
      toast.success('Sale recorded: ' + r.data.invoiceNo); r.data.warnings?.forEach(w => toast(`Low stock: ${w.name} (${w.qty} left)`, { icon: '⚠️' }));
      setDone(r.data._id); setCart([]); setRid(crypto.randomUUID()); load(); } catch (x) { toast.error(x.msg); load(); } setBusy(false); };
  if (done) return <div className="space-y-3"><Invoice id={done} /><div className="text-center noprint"><button className="btn" onClick={() => setDone(null)}>Start new bill</button></div></div>;
  return (<div className="grid lg:grid-cols-5 gap-4">
    <div className="lg:col-span-3 space-y-3"><h1 className="text-2xl">Billing</h1>
      <div className="flex gap-2"><input className="input" placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} />
        <select className="input w-auto" value={cat} onChange={e => setCat(e.target.value)}><option value="">All</option>{cats.map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{prods.map(p => <button key={p._id} disabled={!p.qty} onClick={() => add(p)} className="card text-left hover:border-brand disabled:opacity-50">
        <div className="font-bold">{p.name}</div><div className="text-xs text-slate-500">{p.sku} · {p.category}</div><div className="flex justify-between mt-2"><span className="font-bold">{inr(p.price)}</span>
        <span className={`px-2 rounded text-xs ${badge(p.status)}`}>{p.qty} · {label(p.status)}</span></div></button>)}
        {!prods.length && <div className="text-slate-500">No products found.</div>}</div></div>
    <div className="lg:col-span-2 card space-y-3 self-start"><h2 className="text-lg">Current bill</h2>
      <select className="input" value={cust} onChange={e => setCust(e.target.value)}><option value="">Walk-in customer</option>{clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
      {!cust && <input className="input" placeholder="Customer name (optional)" value={walk} onChange={e => setWalk(e.target.value)} />}
      <div className="divide-y">{cart.map(i => <div key={i._id} className="py-2 flex items-center gap-2 text-sm"><div className="flex-1"><div className="font-bold">{i.name}</div>{inr(i.price)} each</div>
        <button className="btn-o !p-1" onClick={() => chg(i._id, -1)}><Minus size={12} /></button>{i.n}<button className="btn-o !p-1" onClick={() => chg(i._id, 1)}><Plus size={12} /></button>
        <div className="w-20 text-right">{inr(i.price * i.n)}</div><button onClick={() => setCart(cart.filter(x => x._id !== i._id))}><X size={15} /></button></div>)}
        {!cart.length && <div className="py-4 text-sm text-slate-500">No items added.</div>}</div>
      <label className="text-sm flex items-center gap-2 justify-between">Discount % (max {cfg.maxDiscount})<input type="number" min="0" className="input w-24" value={disc} onChange={e => setDisc(e.target.value)} /></label>
      <div className="text-sm space-y-1 border-t pt-2"><div className="flex justify-between"><span>Subtotal</span>{inr(sub)}</div><div className="flex justify-between"><span>Discount</span>-{inr(dv)}</div>
        <div className="flex justify-between"><span>Tax ({cfg.gstRate}%, configured rate)</span>{inr(tax)}</div><div className="flex justify-between text-lg font-bold"><span>Payable</span>{inr(sub - dv + tax)}</div></div>
      <div className="flex gap-3 text-sm">{['CASH', 'UPI', 'CARD'].map(m => <label key={m}><input type="radio" checked={pay === m} onChange={() => setPay(m)} /> {m}</label>)}<span className="text-xs text-slate-500">(recorded only)</span></div>
      <button className="btn w-full justify-center" disabled={!cart.length || busy} onClick={confirmSale}>{busy ? 'Processing…' : 'Confirm sale'}</button></div></div>);
}
