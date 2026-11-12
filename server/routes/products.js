const r = require('express').Router();
const { Product, Category, StockMovement } = require('../models');
const { auth, owner, wrap } = require('../middleware/auth');
r.use(auth);
const esc = t => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
r.get('/categories', wrap(async (q, s) => s.json(await Product.distinct('category'))));
r.get('/', wrap(async (q, s) => {
  const { q: term, category, status, sort = 'name', dir = 'asc', page = 1, limit = 12 } = q.query;
  const f = {};
  if (term) { const re = new RegExp(esc(term), 'i'); f.$or = [{ name: re }, { sku: re }, { brand: re }, { category: re }]; }
  if (category) f.category = category;
  if (status === 'OUT_OF_STOCK') f.qty = 0;
  if (status === 'LOW_STOCK') f.$expr = { $and: [{ $gt: ['$qty', 0] }, { $lt: ['$qty', '$threshold'] }] };
  if (status === 'IN_STOCK') f.$expr = { $gte: ['$qty', '$threshold'] };
  const key = ['name', 'price', 'qty'].includes(sort) ? sort : 'name';
  const sel = q.user.role === 'OWNER' ? '' : '-purchasePrice';
  const [items, total] = await Promise.all([
    Product.find(f).select(sel).sort({ [key]: dir === 'desc' ? -1 : 1 }).skip((page - 1) * limit).limit(+limit), Product.countDocuments(f)]);
  s.json({ items, total, pages: Math.ceil(total / limit) });
}));
r.get('/:id', wrap(async (q, s) => {
  const p = await Product.findById(q.params.id).select(q.user.role === 'OWNER' ? '' : '-purchasePrice');
  p ? s.json(p) : s.status(404).json({ message: 'Product not found' });
}));
r.post('/', owner, wrap(async (q, s) => {
  const p = await Product.create(q.body);
  await Category.updateOne({ name: p.category }, { name: p.category }, { upsert: true });
  if (p.qty) await StockMovement.create({ product: p._id, name: p.name, change: p.qty, reason: 'OPENING', balance: p.qty });
  s.status(201).json(p);
}));
r.put('/:id', owner, wrap(async (q, s) => {
  const p = await Product.findById(q.params.id);
  if (!p) return s.status(404).json({ message: 'Product not found' });
  const before = p.qty;
  p.set(q.body); await p.save();
  if (p.qty !== before) await StockMovement.create({ product: p._id, name: p.name, change: p.qty - before, reason: 'ADJUSTMENT', balance: p.qty });
  s.json(p);
}));
r.delete('/:id', owner, wrap(async (q, s) => { await Product.findByIdAndDelete(q.params.id); s.json({ ok: true }); }));
module.exports = r;
