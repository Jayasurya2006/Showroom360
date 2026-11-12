require('dotenv').config();
const express = require('express'), mongoose = require('mongoose'), cors = require('cors'), helmet = require('helmet'), rate = require('express-rate-limit');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rate({ windowMs: 15 * 60 * 1000, max: 50 }));
app.get('/api/health', (q, s) => s.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api', require('./routes/misc'));
app.use((e, q, s, n) => {
  const code = e.code === 11000 ? 409 : e.name === 'ValidationError' || e.name === 'CastError' ? 400 : 500;
  if (code === 500) console.error(e);
  s.status(code).json({ message: code === 409 ? 'Duplicate value (SKU or email already exists)' : code === 500 ? 'Server error' : e.message });
});
mongoose.connect(process.env.MONGO_URI).then(() => app.listen(process.env.PORT || 5000, () => console.log('API running')));
