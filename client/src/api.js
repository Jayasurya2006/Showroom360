import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use(c => { const t = localStorage.getItem('s360_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401 && !e.config.url.includes('/auth/login')) { localStorage.removeItem('s360_token'); location.href = '/login'; }
  e.msg = e.response?.data?.message || 'Network error'; return Promise.reject(e);
});
export const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const badge = s => ({ IN_STOCK: 'bg-green-100 text-green-800', LOW_STOCK: 'bg-amber-100 text-amber-800', OUT_OF_STOCK: 'bg-red-100 text-red-800' }[s]);
export const label = s => s.replace(/_/g, ' ');
export default api;
