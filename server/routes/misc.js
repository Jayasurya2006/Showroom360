const r = require('express').Router();
const bcrypt = require('bcryptjs');
const { Sale, Product, User, StockMovement, Settings } = require('../models');
const { auth, owner, wrap } = require('../middleware/auth');
r.use(auth);
r.get('/dashboard/owner', owner, wrap(async (q, s) => {
  const days = Math.min(+q.query.days || 30, 365), since = new Date(Date.now() - days * 864e5), m = { $match: { createdAt: { $gte: since } } };
  const [rev, prods, trend, top, recent, clients, low] = await Promise.all([
    Sale.aggregate([{ $group: { _id: null, revenue: { $sum: '$total' }, sales: { $sum: 1 } } }]),
    Product.aggregate([{ $group: { _id: null, count: { $sum: 1 }, stock: { $sum: '$qty' }, out: { $sum: { $cond: [{ $eq: ['$qty', 0] }, 1, 0] } }, value: { $sum: { $multiply: ['$qty', '$purchasePrice'] } } } }]),
    Sale.aggregate([m, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, bills: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Sale.aggregate([m, { $unwind: '$items' }, { $group: { _id: '$items.name', units: { $sum: '$items.qty' } } }, { $sort: { units: -1 } }, { $limit: 5 }]),
    Sale.find().sort({ createdAt: -1 }).limit(6),
    User.countDocuments({ role: 'CLIENT' }),
    Product.find({ $expr: { $lt: ['$qty', '$threshold'] } }).sort({ qty: 1 }).limit(10),
  ]);
  s.json({ revenue: rev[0]?.revenue || 0, sales: rev[0]?.sales || 0, products: prods[0]?.count || 0, stock: prods[0]?.stock || 0,
    outOfStock: prods[0]?.out || 0, stockValue: prods[0]?.value || 0, lowStock: low.filter(p => p.qty > 0).length, clients, trend, top, recent, lowList: low });
}));
r.get('/dashboard/client', wrap(async (q, s) => {
  const a = await Sale.aggregate([{ $match: { customer: q.user._id } }, { $group: { _id: null, spent: { $sum: '$total' }, orders: { $sum: 1 } } }]);
  s.json({ spent: a[0]?.spent || 0, orders: a[0]?.orders || 0 });
}));
r.get('/reports/sales', owner, wrap(async (q, s) => {
  const m = q.query.from ? { createdAt: { $gte: new Date(q.query.from), $lte: new Date((q.query.to || q.query.from) + 'T23:59:59') } } : {};
  const [byPay, tot] = await Promise.all([Sale.aggregate([{ $match: m }, { $group: { _id: '$payment', total: { $sum: '$total' }, bills: { $sum: 1 } } }]),
    Sale.aggregate([{ $match: m }, { $group: { _id: null, revenue: { $sum: '$total' }, bills: { $sum: 1 }, avg: { $avg: '$total' } } }])]);
  s.json({ byPay, ...(tot[0] || { revenue: 0, bills: 0, avg: 0 }) });
}));
r.get('/inventory/movements', owner, wrap(async (q, s) => s.json(await StockMovement.find().sort({ createdAt: -1 }).limit(200))));
r.get('/clients', owner, wrap(async (q, s) => {
  const f = { role: 'CLIENT' };
  if (q.query.q) f.name = new RegExp(String(q.query.q).replace(/[^\w ]/g, ''), 'i');
  const list = await User.find(f).select('-password').sort({ createdAt: -1 }).lean();
  const tot = await Sale.aggregate([{ $group: { _id: '$customer', spent: { $sum: '$total' }, orders: { $sum: 1 } } }]);
  s.json(list.map(c => ({ ...c, ...(tot.find(t => String(t._id) === String(c._id)) || { spent: 0, orders: 0 }) })));
}));
r.post('/clients', owner, wrap(async (q, s) => {
  if (!q.body.password || q.body.password.length < 8) return s.status(400).json({ message: 'Password must be at least 8 characters' });
  const u = await User.create({ name: q.body.name, email: q.body.email, password: await bcrypt.hash(q.body.password, 10) });
  s.status(201).json({ id: u._id });
}));
r.patch('/clients/:id', owner, wrap(async (q, s) => s.json(await User.findOneAndUpdate({ _id: q.params.id, role: 'CLIENT' }, { active: !!q.body.active }, { new: true }).select('-password'))));
r.get('/settings', wrap(async (q, s) => s.json((await Settings.findOne()) || (await Settings.create({})))));
r.put('/settings', owner, wrap(async (q, s) => s.json(await Settings.findOneAndUpdate({}, q.body, { new: true, upsert: true }))));
module.exports = r;
