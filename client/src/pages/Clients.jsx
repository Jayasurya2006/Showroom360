import { useEffect, useState } from 'react'; import toast from 'react-hot-toast'; import api, { inr } from '../api';
export default function Clients() {
  const [list, setList] = useState([]), [q, setQ] = useState(''), [f, setF] = useState(null);
  const load = () => api.get('/clients', { params: { q } }).then(r => setList(r.data)); useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);
  const add = async e => { e.preventDefault(); try { await api.post('/clients', f); toast.success('Client registered'); setF(null); load(); } catch (x) { toast.error(x.msg); } };
  const toggle = async c => { await api.patch('/clients/' + c._id, { active: !c.active }); load(); };
  return (<div className="space-y-4"><div className="flex justify-between"><h1 className="text-2xl">Clients</h1><button className="btn" onClick={() => setF({ name: '', email: '', password: '' })}>Register client</button></div>
    <input className="input sm:w-72" placeholder="Search clients…" value={q} onChange={e => setQ(e.target.value)} />
    <div className="card p-0 overflow-x-auto"><table className="w-full"><thead><tr><th className="th">Name</th><th className="th">Email</th><th className="th">Orders</th><th className="th">Total purchases</th><th className="th">Status</th><th className="th"></th></tr></thead>
      <tbody>{list.map(c => <tr key={c._id}><td className="td">{c.name}</td><td className="td">{c.email}</td><td className="td">{c.orders}</td><td className="td">{inr(c.spent)}</td><td className="td">{c.active ? 'Active' : 'Disabled'}</td>
        <td className="td"><button className="btn-o" onClick={() => toggle(c)}>{c.active ? 'Disable' : 'Enable'}</button></td></tr>)}{!list.length && <tr><td className="td" colSpan="6">No clients found.</td></tr>}</tbody></table></div>
    {f && <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"><form onSubmit={add} className="card w-full max-w-sm space-y-3"><h2 className="text-lg">Register client</h2>
      <input className="input" placeholder="Name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><input className="input" type="email" placeholder="Email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
      <input className="input" type="password" placeholder="Temporary password (min 8)" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
      <div className="flex justify-end gap-2"><button type="button" className="btn-o" onClick={() => setF(null)}>Cancel</button><button className="btn">Save</button></div></form></div>}</div>);
}
