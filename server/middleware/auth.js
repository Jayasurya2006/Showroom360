const jwt = require('jsonwebtoken');
const { User } = require('../models');
exports.auth = async (q, s, n) => {
  try {
    const t = (q.headers.authorization || '').split(' ')[1];
    const u = await User.findById(jwt.verify(t, process.env.JWT_SECRET).id);
    if (!u || !u.active) throw new Error('x');
    q.user = u; n();
  } catch { s.status(401).json({ message: 'Please sign in again' }); }
};
exports.owner = (q, s, n) => q.user.role === 'OWNER' ? n() : s.status(403).json({ message: 'Owner access required' });
exports.wrap = f => (q, s, n) => Promise.resolve(f(q, s, n)).catch(n);
