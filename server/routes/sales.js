const r = require('express').Router();
const { Sale, Product, StockMovement, Settings, User } = require('../models');
const { auth, owner, wrap } = require('../middleware/auth');
r.use(auth);
const round = n => Math.round(n * 100) / 100;
r.post('/', owner, wrap(async (q, s) => {
  const { items = [], customerId, customerName, payment, discountPct = 0, requestId } = q.body;
  if (requestId) { const dup = await Sale.findOne({ requestId }); if (dup) return s.json(dup); }
  if (!items.length) return s.status(400).json({ message: 'Cart is empty' });
  if (!['CASH', 'UPI', 'CARD'].includes(payment)) return s.status(400).json({ message: 'Select a payment method' });
  const cfg = (await Settings.findOne()) || (await Settings.create({}));
  const lines = [];
  for (const it of items) {
    const p = await Product.findById(it.productId), n = parseInt(it.qty);
    if (!p || !(n > 0)) return s.status(400).json({ message: 'Invalid item in cart' });
    lines.push({ p, n });
  }
  const done = [];
  const rollback = async () => { for (const d of done) await Product.updateOne({ _id: d.p._id }, { $inc: { qty: d.n } }); };
  for (const l of lines) { // atomic conditional decrement: stock can never go below zero
    const u = await Product.findOneAndUpdate({ _id: l.p._id, qty: { $gte: l.n } }, { $inc: { qty: -l.n } }, { new: true });
    if (!u) { await rollback(); return s.status(409).json({ message: `Insufficient stock for ${l.p.name}` }); }
    l.after = u.qty; done.push(l);
  }
  try {
    const subtotal = round(lines.reduce((a, l) => a + l.p.price * l.n, 0));
    const discount = round(subtotal * Math.min(Math.max(+discountPct || 0, 0), cfg.maxDiscount) / 100);
    const tax = round((subtotal - discount) * cfg.gstRate / 100);
    const cust = customerId ? await User.findById(customerId) : null;
    const count = await Sale.countDocuments();
    const sale = await Sale.create({
      invoiceNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(count + 1).padStart(4, '0')}${Math.floor(Math.random() * 90 + 10)}`,
      requestId, customer: cust?._id, customerName: cust?.name || customerName || 'Walk-in Customer',
      items: lines.map(l => ({ product: l.p._id, name: l.p.name, sku: l.p.sku, qty: l.n, price: l.p.price })),
      subtotal, discount, tax, total: round(subtotal - discount + tax), payment, createdBy: q.user._id,
    });
    await StockMovement.insertMany(lines.map(l => ({ product: l.p._id, name: l.p.name, change: -l.n, reason: 'SALE', ref: sale.invoiceNo, balance: l.after })));
    const warnings = lines.filter(l => l.after < l.p.threshold).map(l => ({ name: l.p.name, qty: l.after }));
    s.status(201).json({ ...sale.toJSON(), warnings });
  } catch (e) { await rollback(); throw e; }
}));
r.get('/', wrap(async (q, s) => {
  const f = q.user.role === 'OWNER' ? {} : { customer: q.user._id };
  if (q.query.q) f.invoiceNo = new RegExp(String(q.query.q).replace(/[^\w-]/g, ''), 'i');
  if (q.query.from || q.query.to) f.createdAt = { ...(q.query.from && { $gte: new Date(q.query.from) }), ...(q.query.to && { $lte: new Date(q.query.to + 'T23:59:59') }) };
  s.json(await Sale.find(f).sort({ createdAt: -1 }).limit(200));
}));
r.get('/:id', wrap(async (q, s) => {
  const x = await Sale.findById(q.params.id);
  if (!x || (q.user.role !== 'OWNER' && String(x.customer) !== String(q.user._id))) return s.status(404).json({ message: 'Invoice not found' });
  s.json({ sale: x, shop: (await Settings.findOne()) || {} });
}));
module.exports = r;
