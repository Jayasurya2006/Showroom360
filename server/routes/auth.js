const r = require('express').Router();
const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { auth, wrap } = require('../middleware/auth');
const tok = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });
r.post('/register', body('name').notEmpty().withMessage('Name is required'), body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'), wrap(async (q, s) => {
    const e = validationResult(q);
    if (!e.isEmpty()) return s.status(400).json({ message: e.array()[0].msg });
    if (await User.findOne({ email: q.body.email.toLowerCase() })) return s.status(409).json({ message: 'Email already registered' });
    const u = await User.create({ name: q.body.name, email: q.body.email, password: await bcrypt.hash(q.body.password, 10), role: 'CLIENT' });
    s.status(201).json({ token: tok(u), user: pub(u) });
  }));
r.post('/login', wrap(async (q, s) => {
  const u = await User.findOne({ email: String(q.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(String(q.body.password || ''), u.password))) return s.status(401).json({ message: 'Invalid email or password' });
  if (!u.active) return s.status(403).json({ message: 'Account is disabled' });
  s.json({ token: tok(u), user: pub(u) });
}));
r.get('/me', auth, (q, s) => s.json({ user: pub(q.user) }));
module.exports = r;
