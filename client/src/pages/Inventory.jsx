import { useEffect, useState } from 'react'; import toast from 'react-hot-toast'; import { Plus, Pencil, Trash2 } from 'lucide-react'; import api, { inr, badge, label } from '../api';
const blank = { sku: '', name: '', description: '', category: '', brand: '', purchasePrice: 0, price: 0, qty: 0, threshold: 5, image: '' };
export default function Inventory() {
  const [data, setData] = useState({ items: [], pages: 1, total: 0 }), [cats, setCats] = useState([]), [form, setForm] = useState(null);
  const [fl, setFl] = useState({ q: '', category: '', status: '', sort: 'name', dir: 'asc', page: 1 }), [dq, setDq] = useState('');
  useEffect(() => { const t = setTimeout(() => setFl(f => ({ ...f, q: dq, page: 1 })), 300); return () => clearTimeout(t); }, [dq]);
  const load = () => api.get('/products', { params: fl }).then(r => setData(r.data)); useEffect(() => { load(); }, [fl]);
  useEffect(() => { api.get('/products/categories').then(r => setCats(r.data)); }, [data.total]);
  const save = async e => { e.preventDefault();
    try { form._id ? await api.put('/products/' + form._id, form) : await api.post('/products', form); toast.success('Product saved'); setForm(null); load(); } catch (x) { toast.error(x.msg); } };
  const del = async p => { if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return; await api.delete('/products/' + p._id); toast.success('Product deleted'); load(); };
  const sortBy = k => setFl({ ...fl, sort: k, dir: fl.sort === k && fl.dir === 'asc' ? 'desc' : 'asc' });
  const F = ({ k, t, type = 'text', req }) => <label className="block text-sm">{t}<input className="input mt-1" type={type} min={type === 'number' ? 0 : undefined} step="any" required={req} value={form[k] ?? ''} onChange={e => setForm({ ...form, [k]: type === 'number' ? +e.target.value : e.target.value })} /></label>;
  return (<div className="space-y-4">
    <div className="flex flex-wrap justify-between gap-2"><h1 className="text-2xl">Inventory</h1><button className="btn" onClick={() => setForm(blank)}><Plus size={15} />Add product</button></div>
    <div className="card flex flex-wrap gap-2"><input className="input sm:w-64" placeholder="Search name, SKU, brand…" value={dq} onChange={e => setDq(e.target.value)} />
      <select className="input w-auto" value={fl.category} onChange={e => setFl({ ...fl, category: e.target.value, page: 1 })}><option value="">All categories</option>{cats.map(c => <option key={c}>{c}</option>)}</select>
      <select className="input w-auto" value={fl.status} onChange={e => setFl({ ...fl, status: e.target.value, page: 1 })}><option value="">Any stock status</option><option value="IN_STOCK">In stock</option><option value="LOW_STOCK">Low stock</option><option value="OUT_OF_STOCK">Out of stock</option></select></div>
    <div className="card overflow-x-auto p-0"><table className="w-full"><thead><tr><th className="th">SKU</th><th className="th cursor-pointer" onClick={() => sortBy('name')}>Name ↕</th><th className="th">Category</th><th className="th cursor-pointer" onClick={() => sortBy('price')}>Price ↕</th><th className="th cursor-pointer" onClick={() => sortBy('qty')}>Stock ↕</th><th className="th">Status</th><th className="th"></th></tr></thead>
      <tbody>{data.items.map(p => <tr key={p._id}><td className="td">{p.sku}</td><td className="td">{p.name}<div className="text-xs text-slate-500">{p.brand}</div></td><td className="td">{p.category}</td><td className="td">{inr(p.price)}</td><td className="td">{p.qty}</td>
        <td className="td"><span className={`px-2 py-0.5 rounded text-xs ${badge(p.status)}`}>{label(p.status)}</span></td>
        <td className="td whitespace-nowrap"><button className="p-1" onClick={() => setForm(p)}><Pencil size={16} /></button><button className="p-1 text-red-700" onClick={() => del(p)}><Trash2 size={16} /></button></td></tr>)}
        {!data.items.length && <tr><td className="td" colSpan="7">No products match your search.</td></tr>}</tbody></table></div>
    <div className="flex items-center justify-between text-sm"><span>{data.total} products</span><div className="flex gap-2 items-center">
      <button className="btn-o" disabled={fl.page <= 1} onClick={() => setFl({ ...fl, page: fl.page - 1 })}>Previous</button>Page {fl.page} of {data.pages || 1}
      <button className="btn-o" disabled={fl.page >= data.pages} onClick={() => setFl({ ...fl, page: fl.page + 1 })}>Next</button></div></div>
    {form && <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10"><form onSubmit={save} className="card w-full max-w-xl max-h-[90vh] overflow-auto space-y-3">
      <h2 className="text-lg">{form._id ? 'Edit product' : 'New product'}</h2>
      <div className="grid sm:grid-cols-2 gap-3"><F k="sku" t="Product ID / SKU" req /><F k="name" t="Name" req /><F k="category" t="Category" req /><F k="brand" t="Brand" />
        <F k="purchasePrice" t="Purchase price" type="number" /><F k="price" t="Selling price" type="number" req /><F k="qty" t="Quantity in stock" type="number" req /><F k="threshold" t="Low-stock threshold" type="number" /></div>
      <F k="image" t="Image URL" /><label className="block text-sm">Description<textarea className="input mt-1" rows="2" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <div className="flex justify-end gap-2"><button type="button" className="btn-o" onClick={() => setForm(null)}>Cancel</button><button className="btn">Save</button></div></form></div>}
  </div>);
}
