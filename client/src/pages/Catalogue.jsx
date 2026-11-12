import { useEffect, useState } from 'react'; import api, { inr, badge, label } from '../api'; import { useAuth } from '../App';
export default function Catalogue() {
  const { user } = useAuth(); const [items, setItems] = useState([]), [cats, setCats] = useState([]), [f, setF] = useState({ q: '', category: '', status: '' }), [sel, setSel] = useState(null), [st, setSt] = useState({ orders: 0, spent: 0 });
  useEffect(() => { const t = setTimeout(() => api.get('/products', { params: { ...f, limit: 48 } }).then(r => setItems(r.data.items)), 250); return () => clearTimeout(t); }, [f]);
  useEffect(() => { api.get('/products/categories').then(r => setCats(r.data)); api.get('/dashboard/client').then(r => setSt(r.data)); }, []);
  return (<div className="space-y-4"><div><h1 className="text-2xl">Welcome, {user.name}</h1><p className="text-sm text-slate-600">{st.orders} orders placed · {inr(st.spent)} total purchases</p></div>
    <div className="card flex flex-wrap gap-2"><input className="input sm:w-72" placeholder="Search by name or product ID" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} />
      <select className="input w-auto" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}><option value="">All categories</option>{cats.map(c => <option key={c}>{c}</option>)}</select>
      <select className="input w-auto" value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option value="">Any availability</option><option value="IN_STOCK">In stock</option><option value="LOW_STOCK">Low stock</option><option value="OUT_OF_STOCK">Out of stock</option></select>
      {(f.q || f.category || f.status) && <button className="btn-o" onClick={() => setF({ q: '', category: '', status: '' })}>Clear</button>}</div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{items.map(p => <button key={p._id} onClick={() => setSel(p)} className="card text-left hover:border-brand">
      {p.image && <img src={p.image} alt="" className="h-32 w-full object-cover mb-2 rounded" />}<div className="font-bold">{p.name}</div><div className="text-xs text-slate-500">{p.category} · {p.sku}</div>
      <div className="flex justify-between mt-2"><span className="font-bold">{inr(p.price)}</span><span className={`px-2 rounded text-xs ${badge(p.status)}`}>{label(p.status)}</span></div></button>)}
      {!items.length && <div className="text-slate-500">No products match your search.</div>}</div>
    {sel && <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" onClick={() => setSel(null)}><div className="card max-w-md w-full space-y-2" onClick={e => e.stopPropagation()}>
      <h2 className="text-xl">{sel.name}</h2><div className="text-sm">{sel.brand} · {sel.category} · {sel.sku}</div><p>{sel.description || 'No description available.'}</p>
      <div className="font-bold text-lg">{inr(sel.price)}</div><span className={`px-2 rounded text-xs ${badge(sel.status)}`}>{label(sel.status)}</span><div><button className="btn-o mt-2" onClick={() => setSel(null)}>Close</button></div></div></div>}</div>);
}
