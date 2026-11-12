import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api, { inr, badge, label } from '../api';
const Stat = ({ t, v }) => <div className="card"><div className="text-sm text-slate-600">{t}</div><div className="text-2xl font-bold">{v}</div></div>;
export default function Dashboard() {
  const [d, setD] = useState(null), [days, setDays] = useState(30);
  useEffect(() => { api.get('/dashboard/owner', { params: { days } }).then(r => setD(r.data)); }, [days]);
  if (!d) return <div>Loading…</div>;
  return (<div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl">Dashboard</h1>
      <div className="flex gap-2"><select className="input w-auto" value={days} onChange={e => setDays(e.target.value)}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>
        <Link to="/pos" className="btn">New bill</Link><Link to="/inventory" className="btn-o">Add product</Link></div></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat t="Total revenue" v={inr(d.revenue)} /><Stat t="Total sales" v={d.sales} /><Stat t="Products" v={d.products} /><Stat t="Units in stock" v={d.stock} />
      <Stat t="Low stock" v={d.lowStock} /><Stat t="Out of stock" v={d.outOfStock} /><Stat t="Clients" v={d.clients} /><Stat t="Stock value (cost)" v={inr(d.stockValue)} /></div>
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="card lg:col-span-2"><h3 className="mb-2">Revenue trend</h3><div className="h-64"><ResponsiveContainer><LineChart data={d.trend}><CartesianGrid stroke="#e2e8f0" /><XAxis dataKey="_id" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={v => inr(v)} /><Line dataKey="revenue" stroke="#1f3a5f" strokeWidth={2} /></LineChart></ResponsiveContainer></div></div>
      <div className="card"><h3 className="mb-2">Top-selling products</h3><div className="h-64"><ResponsiveContainer><BarChart data={d.top} layout="vertical"><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="_id" width={110} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="units" fill="#1f3a5f" /></BarChart></ResponsiveContainer></div></div></div>
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card overflow-x-auto"><h3 className="mb-2">Low-stock alerts</h3><table className="w-full"><thead><tr><th className="th">Product</th><th className="th">SKU</th><th className="th">Qty</th><th className="th">Limit</th><th className="th">Status</th></tr></thead>
        <tbody>{d.lowList.map(p => <tr key={p._id}><td className="td">{p.name}</td><td className="td">{p.sku}</td><td className="td">{p.qty}</td><td className="td">{p.threshold}</td><td className="td"><span className={`px-2 py-0.5 rounded text-xs ${badge(p.status)}`}>{label(p.status)}</span></td></tr>)}
          {!d.lowList.length && <tr><td className="td" colSpan="5">All products are adequately stocked.</td></tr>}</tbody></table></div>
      <div className="card overflow-x-auto"><h3 className="mb-2">Recent invoices</h3><table className="w-full"><thead><tr><th className="th">Invoice</th><th className="th">Customer</th><th className="th">Date</th><th className="th">Total</th></tr></thead>
        <tbody>{d.recent.map(s => <tr key={s._id}><td className="td">{s.invoiceNo}</td><td className="td">{s.customerName}</td><td className="td">{format(new Date(s.createdAt), 'dd MMM yyyy')}</td><td className="td">{inr(s.total)}</td></tr>)}
          {!d.recent.length && <tr><td className="td" colSpan="4">No invoices yet.</td></tr>}</tbody></table></div></div></div>);
}
