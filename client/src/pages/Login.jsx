import { useState } from 'react'; import toast from 'react-hot-toast'; import api from '../api'; import { useAuth } from '../App';
export default function Login() {
  const { login } = useAuth(); const [reg, setReg] = useState(false); const [f, setF] = useState({ name: '', email: '', password: '' }); const [busy, setBusy] = useState(false);
  const submit = async e => { e.preventDefault(); setBusy(true);
    try { login((await api.post(reg ? '/auth/register' : '/auth/login', f)).data); } catch (x) { toast.error(x.msg); } setBusy(false); };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return (<div className="min-h-screen grid md:grid-cols-2">
    <div className="hidden md:flex bg-ink text-white p-12 flex-col justify-between"><div className="text-3xl font-bold">Showroom360</div>
      <div><h1 className="text-3xl mb-3">Billing and stock control for your showroom.</h1><p className="text-slate-300">Point of sale, inventory tracking, invoices and sales reports in one place.</p></div><div className="text-sm text-slate-400">Showroom360 Management System</div></div>
    <div className="flex items-center justify-center p-6"><form onSubmit={submit} className="card w-full max-w-sm space-y-3">
      <h2 className="text-xl">{reg ? 'Create customer account' : 'Sign in'}</h2>
      {reg && <input className="input" placeholder="Full name" value={f.name} onChange={set('name')} required />}
      <input className="input" type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
      <input className="input" type="password" placeholder="Password (min 8 characters)" value={f.password} onChange={set('password')} required />
      <button className="btn w-full justify-center" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Register' : 'Sign in'}</button>
      <button type="button" className="text-sm underline" onClick={() => setReg(!reg)}>{reg ? 'Already registered? Sign in' : 'New customer? Register'}</button></form></div></div>);
}
