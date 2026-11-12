import { useEffect, useState } from 'react'; import { format } from 'date-fns'; import { Printer } from 'lucide-react'; import api, { inr } from '../api';
export function Invoice({ id, onClose }) {
  const [d, setD] = useState(null); useEffect(() => { api.get('/sales/' + id).then(r => setD(r.data)); }, [id]);
  if (!d) return null; const { sale: s, shop } = d;
  return (<div className="card max-w-2xl mx-auto space-y-3">
    <div className="flex justify-between border-b pb-2"><div><h2 className="text-xl">{shop.shopName}</h2><div className="text-sm">{shop.address} · {shop.phone}</div></div>
      <div className="text-right text-sm"><div className="font-bold">TAX INVOICE</div><div>{s.invoiceNo}</div><div>{format(new Date(s.createdAt), 'dd MMM yyyy, hh:mm a')}</div></div></div>
    <div className="text-sm">Billed to: <b>{s.customerName}</b></div>
    <table className="w-full"><thead><tr><th className="th">Item</th><th className="th">Qty</th><th className="th">Rate</th><th className="th">Amount</th></tr></thead>
      <tbody>{s.items.map((i, k) => <tr key={k}><td className="td">{i.name}</td><td className="td">{i.qty}</td><td className="td">{inr(i.price)}</td><td className="td">{inr(i.qty * i.price)}</td></tr>)}</tbody></table>
    <div className="ml-auto w-56 text-sm space-y-1"><div className="flex justify-between"><span>Subtotal</span>{inr(s.subtotal)}</div><div className="flex justify-between"><span>Discount</span>-{inr(s.discount)}</div>
      <div className="flex justify-between"><span>Tax ({shop.gstRate}%)</span>{inr(s.tax)}</div><div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span>{inr(s.total)}</div></div>
    <div className="text-sm">Payment: {s.payment} · Status: {s.status}</div>
    <div className="noprint flex gap-2"><button className="btn" onClick={() => window.print()}><Printer size={15} />Print / Save as PDF</button>{onClose && <button className="btn-o" onClick={onClose}>Close</button>}</div></div>);
}
export default function Invoices() {
  const [list, setList] = useState([]), [f, setF] = useState({ q: '', from: '', to: '' }), [open, setOpen] = useState(null);
  useEffect(() => { const t = setTimeout(() => api.get('/sales', { params: f }).then(r => setList(r.data)), 250); return () => clearTimeout(t); }, [f]);
  if (open) return <Invoice id={open} onClose={() => setOpen(null)} />;
  return (<div className="space-y-4"><h1 className="text-2xl">Invoices</h1>
    <div className="card flex flex-wrap gap-2"><input className="input sm:w-60" placeholder="Invoice number" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} />
      <input type="date" className="input w-auto" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /><input type="date" className="input w-auto" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></div>
    <div className="card p-0 overflow-x-auto"><table className="w-full"><thead><tr><th className="th">Invoice</th><th className="th">Date</th><th className="th">Customer</th><th className="th">Payment</th><th className="th">Total</th><th className="th"></th></tr></thead>
      <tbody>{list.map(s => <tr key={s._id}><td className="td">{s.invoiceNo}</td><td className="td">{format(new Date(s.createdAt), 'dd MMM yyyy')}</td><td className="td">{s.customerName}</td><td className="td">{s.payment}</td><td className="td">{inr(s.total)}</td><td className="td"><button className="btn-o" onClick={() => setOpen(s._id)}>View</button></td></tr>)}
        {!list.length && <tr><td className="td" colSpan="6">No invoices found.</td></tr>}</tbody></table></div></div>);
}
