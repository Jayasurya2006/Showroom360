const { Schema, model } = require('mongoose');
const ts = { timestamps: true };
const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['OWNER', 'CLIENT'], default: 'CLIENT' },
  active: { type: Boolean, default: true },
}, ts));
const Category = model('Category', new Schema({ name: { type: String, required: true, unique: true } }));
const pSchema = new Schema({
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: String, category: { type: String, required: true }, brand: String,
  purchasePrice: { type: Number, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  qty: { type: Number, required: true, min: 0, default: 0 },
  threshold: { type: Number, min: 0, default: 5 },
  image: String,
}, { ...ts, toJSON: { virtuals: true } });
pSchema.virtual('status').get(function () { return this.qty === 0 ? 'OUT_OF_STOCK' : this.qty < this.threshold ? 'LOW_STOCK' : 'IN_STOCK'; });
pSchema.index({ name: 'text', sku: 'text', brand: 'text', category: 'text' });
const Product = model('Product', pSchema);
const sSchema = new Schema({
  invoiceNo: { type: String, unique: true },
  requestId: { type: String, unique: true, sparse: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, default: 'Walk-in Customer' },
  items: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, name: String, sku: String, qty: Number, price: Number }],
  subtotal: Number, discount: Number, tax: Number, total: Number,
  payment: { type: String, enum: ['CASH', 'UPI', 'CARD'], required: true },
  status: { type: String, default: 'PAID' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, ts);
sSchema.index({ customer: 1, createdAt: -1 });
const Sale = model('Sale', sSchema);
const StockMovement = model('StockMovement', new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' }, name: String,
  change: Number, reason: String, ref: String, balance: Number,
}, ts));
const Settings = model('Settings', new Schema({
  shopName: { type: String, default: 'Showroom360' }, address: { type: String, default: '12 Market Road' },
  phone: { type: String, default: '+91 00000 00000' },
  gstRate: { type: Number, default: 18 }, maxDiscount: { type: Number, default: 20 },
}));
module.exports = { User, Category, Product, Sale, StockMovement, Settings };
