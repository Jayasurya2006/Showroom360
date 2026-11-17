
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../App';
import { ShieldCheck, ShoppingBag, Store } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();

  const [role, setRole] = useState('CLIENT');
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);

    try {
      const endpoint = reg ? '/auth/register' : '/auth/login';
      const { data } = await api.post(endpoint, f);

      if (data.user.role !== role) {
        toast.error(
          role === 'OWNER'
            ? 'This account is not an Owner account.'
            : 'Please use Owner Login for this account.'
        );
        return;
      }

      login(data);
    } catch (x) {
      toast.error(
        x.response?.data?.message || x.msg || 'Login failed. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  const set = k => e =>
    setF({ ...f, [k]: e.target.value });

  const changeRole = selected => {
    setRole(selected);
    setReg(false);
    setF({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      <div className="hidden md:flex bg-ink text-white p-12 flex-col justify-between">
        <div className="text-3xl font-bold">Showroom360</div>

        <div>
          <h1 className="text-3xl mb-3">
            Billing and stock control for your showroom.
          </h1>
          <p className="text-slate-300">
            Point of sale, inventory tracking, invoices and sales reports
            in one place.
          </p>
        </div>

        <div className="text-sm text-slate-400">
          Showroom360 Management System
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="card w-full max-w-sm space-y-4">

          <div className="text-center">
            <Store size={36} className="mx-auto text-brand mb-2" />
            <h1 className="text-2xl font-bold">Showroom360</h1>
            <p className="text-sm text-slate-500">
              Welcome! Choose your login type.
            </p>
          </div>

          {/* Account type selection */}
          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => changeRole('OWNER')}
              className={`border rounded-lg p-3 flex flex-col items-center gap-2 ${
                role === 'OWNER'
                  ? 'border-brand bg-blue-50 ring-2 ring-brand'
                  : 'border-slate-200'
              }`}
            >
              <ShieldCheck size={28} />
              <span className="font-bold">Owner</span>
              <span className="text-xs text-slate-500">
                Owner Login
              </span>
            </button>

            <button
              type="button"
              onClick={() => changeRole('CLIENT')}
              className={`border rounded-lg p-3 flex flex-col items-center gap-2 ${
                role === 'CLIENT'
                  ? 'border-brand bg-blue-50 ring-2 ring-brand'
                  : 'border-slate-200'
              }`}
            >
              <ShoppingBag size={28} />
              <span className="font-bold">Customer</span>
              <span className="text-xs text-slate-500">
                Customer Login
              </span>
            </button>

          </div>

          <div>
            <h2 className="text-xl font-bold">
              {reg
                ? 'Create Customer Account'
                : role === 'OWNER'
                  ? 'Owner Sign In'
                  : 'Customer Sign In'}
            </h2>

            <p className="text-sm text-slate-500">
              {role === 'OWNER'
                ? 'Access your showroom management dashboard.'
                : 'Sign in to explore products and manage your orders.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">

            {reg && (
              <input
                className="input"
                placeholder="Full name"
                value={f.name}
                onChange={set('name')}
                required
              />
            )}

            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={f.email}
              onChange={set('email')}
              required
            />

            <input
              className="input"
              type="password"
              placeholder="Password"
              value={f.password}
              onChange={set('password')}
              required
            />

            <button
              className="btn w-full justify-center"
              disabled={busy}
            >
              {busy
                ? 'Please wait...'
                : reg
                  ? 'Create Account'
                  : role === 'OWNER'
                    ? 'Login as Owner'
                    : 'Login as Customer'}
            </button>

          </form>

          {role === 'CLIENT' && (
            <button
              type="button"
              className="text-sm underline"
              onClick={() => setReg(!reg)}
            >
              {reg
                ? 'Already registered? Sign in'
                : 'New customer? Create an account'}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
